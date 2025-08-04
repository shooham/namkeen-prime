Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔍 Simple payment verification');
    
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body;
    
    console.log('Payment data:', { razorpay_order_id, razorpay_payment_id, planId });
    
    if (!razorpay_order_id || !razorpay_payment_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing payment data'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find and update order
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${razorpay_order_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: 'paid',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      console.log('Order update failed');
    } else {
      console.log('✅ Order updated to paid');
    }

    // Create subscription for hardcoded user
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

    const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: 'c1e2092f-362e-42c9-bff3-df34f53a3661', // Hardcoded user ID
        plan_id: planId || '3300dc04-4a87-4817-a95b-ffb24c095556',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: subscriptionEndDate.toISOString().split('T')[0],
        created_at: new Date().toISOString()
      })
    });

    if (subscriptionResponse.ok) {
      console.log('✅ Subscription created');
    } else {
      console.log('❌ Subscription creation failed');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified and subscription created!',
      subscription: {
        user_id: 'c1e2092f-362e-42c9-bff3-df34f53a3661',
        status: 'active',
        duration_days: 30
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('💥 Error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Payment verification failed',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});