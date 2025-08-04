import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from 'https://esm.sh/razorpay@2.9.2';

// Define CORS headers for consistent use
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IMPORTANT: Set these in your Supabase project's Edge Function secrets
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight request immediately
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 create-razorpay-order function called');
    
    // 1. Get the plan ID from the request body
    const requestBody = await req.json();
    console.log('📥 Request body:', requestBody);
    
    const { planId } = requestBody;
    if (!planId) {
      console.error('❌ Plan ID is missing from request');
      throw new Error('Plan ID is required.');
    }
    console.log('✅ Plan ID received:', planId);

    // 2. Authenticate the user
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ No authorization header found');
      throw new Error('Authorization header missing. Please login again.');
    }
    
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    
    console.log('🔍 Attempting to get user...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('❌ User authentication error:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('❌ No user found in session');
      throw new Error('User session expired. Please login again.');
    }
    
    console.log('✅ User authenticated:', user.email);

    // 3. Fetch plan details from the database using the admin client
    console.log('🔍 Fetching plan details for:', planId);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('price, name')
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('❌ Plan query error:', planError);
      throw new Error(`Subscription plan not found: ${planError.message}`);
    }
    
    if (!plan) {
      console.error('❌ Plan not found in database');
      throw new Error('Subscription plan does not exist.');
    }
    
    console.log('✅ Plan found:', plan.name, '- ₹' + plan.price);

    const amountInPaise = Math.round(plan.price * 100);
    console.log('💰 Amount in paise:', amountInPaise);

    // 4. Check Razorpay credentials
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing');
      throw new Error('Payment gateway configuration error');
    }
    
    console.log('🔑 Razorpay key ID present:', !!RAZORPAY_KEY_ID);

    // 5. Create an order with Razorpay
    console.log('📞 Creating Razorpay order...');
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET)}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_user_${user.id}_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan_id: planId,
        },
      }),
    });

    const orderData = await razorpayResponse.json();
    console.log('📋 Razorpay response status:', razorpayResponse.status);

    if (!razorpayResponse.ok) {
      console.error('❌ Razorpay Error:', orderData);
      throw new Error(orderData.error?.description || 'Razorpay order creation failed.');
    }
    
    console.log('✅ Razorpay order created:', orderData.id);

    // 5. Store order in database
    const { error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        plan_id: planId,
        order_id: orderData.id,
        amount: orderData.amount / 100, // Convert back to rupees for storage
        currency: orderData.currency,
        status: 'created',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Don't fail the entire process for this
    }

    // 6. Return the created order details to the client in expected format
    return new Response(
      JSON.stringify({ 
        success: true,
        order: {
          id: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          receipt: orderData.receipt,
          status: orderData.status
        },
        keyId: RAZORPAY_KEY_ID,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || ''
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-razorpay-order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});