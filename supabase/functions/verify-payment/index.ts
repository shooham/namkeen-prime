import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// HMAC SHA-256 signature verification
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const body = orderId + "|" + paymentId;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSignatureHex;
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse and validate request body
    const body = await req.json();
    console.log('📥 Received request body:', JSON.stringify(body, null, 2));
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body;
    
    console.log('🎬 HOLOPLAY Payment Verification Handler:', {
      razorpay_order_id,
      razorpay_payment_id,
      has_signature: !!razorpay_signature,
      planId
    });

    // 2. Basic validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing required Razorpay parameters');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required Razorpay parameters',
        received: { razorpay_order_id, razorpay_payment_id, has_signature: !!razorpay_signature }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration');
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Verify Razorpay signature
    if (razorpayKeySecret) {
      const isValidSignature = await verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpayKeySecret
      );

      if (!isValidSignature) {
        console.error('❌ Invalid Razorpay signature');
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid payment signature'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('✅ Razorpay signature verified successfully');
    } else {
      console.warn('⚠️ Razorpay signature verification skipped - secret not configured');
    }

    // 5. Find the order in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', razorpay_order_id)
      .single();

    if (orderError || !orderData) {
      console.error('❌ Order not found:', orderError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found',
        details: orderError?.message
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Order found:', orderData);

    // 6. Check if payment already processed
    if (orderData.status === 'paid') {
      console.log('⚠️ Payment already processed');
      return new Response(JSON.stringify({
        success: true,
        message: 'Payment already processed',
        subscription: {
          user_id: orderData.user_id,
          status: 'active'
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 7. Get plan details if planId provided
    let planDetails = null;
    if (planId) {
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (!planError && plan) {
        planDetails = plan;
        console.log('📋 Plan details found:', planDetails);
      }
    }

    // 8. Update order status to paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', razorpay_order_id);

    if (updateError) {
      console.error('❌ Order update error:', updateError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update order status',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Order status updated to paid');

    // 9. Create subscription
    const subscriptionEndDate = new Date();
    const durationDays = planDetails?.duration_days || 30;
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationDays);

    const subscriptionData = {
      user_id: orderData.user_id,
      plan_id: planId || null,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0], // Date format
      end_date: subscriptionEndDate.toISOString().split('T')[0], // Date format
      created_at: new Date().toISOString()
    };

    const { data: subscriptionResult, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      console.error('❌ Subscription creation error:', subscriptionError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create subscription',
        details: subscriptionError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Subscription created successfully:', subscriptionResult);

    // 10. Create payment history record
    const { error: paymentHistoryError } = await supabase
      .from('payment_history')
      .insert({
        user_id: orderData.user_id,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        status: 'completed',
        payment_method: 'razorpay',
        completed_at: new Date().toISOString()
      });

    if (paymentHistoryError) {
      console.error('⚠️ Payment history error:', paymentHistoryError);
      // Don't fail the entire process for this
    } else {
      console.log('✅ Payment history created');
    }

    // 11. Update user profile subscription status (if exists)
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', orderData.user_id);

    if (profileUpdateError) {
      console.log('⚠️ Profile update skipped:', profileUpdateError.message);
    }

    // 12. Return success response
    console.log('🎉 HOLOPLAY Payment processed successfully!');

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment processed successfully! आपका सब्सक्रिप्शन सक्रिय हो गया है!',
      app: 'HoloPlay',
      subscription: {
        id: subscriptionResult.id,
        user_id: orderData.user_id,
        plan_id: planId,
        status: 'active',
        start_date: subscriptionResult.start_date,
        end_date: subscriptionResult.end_date,
        duration_days: durationDays,
        activated_at: new Date().toISOString()
      },
      order: {
        id: orderData.id,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'paid'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 HOLOPLAY payment handler error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Payment processing failed',
      details: error.message,
      app: 'HoloPlay'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});