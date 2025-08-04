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
    console.log('🚀 Function called');
    
    const body = await req.json();
    console.log('📥 Body:', JSON.stringify(body));
    
    if (!body.planId) {
      console.log('❌ No planId');
      return new Response(JSON.stringify({ error: 'planId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    console.log('🔑 Keys:', !!keyId, !!keySecret);
    
    if (!keyId || !keySecret) {
      console.log('❌ No Razorpay keys');
      return new Response(JSON.stringify({ error: 'Razorpay config missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Simple hardcoded order for testing
    const orderData = {
      amount: 24900, // ₹249 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`.slice(0, 40)
    };

    console.log('💰 Order:', JSON.stringify(orderData));

    // Create Razorpay order
    const auth = btoa(`${keyId}:${keySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log('📡 Razorpay status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Razorpay error:', errorText);
      return new Response(JSON.stringify({ error: 'Razorpay failed', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const order = await response.json();
    console.log('✅ Order created:', order.id);

    // Store order in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: 'c1e2092f-362e-42c9-bff3-df34f53a3661', // Hardcoded for now
          plan_id: body.planId,
          order_id: order.id,
          amount: order.amount / 100, // Convert back to rupees
          currency: order.currency,
          status: 'created',
          created_at: new Date().toISOString()
        })
      });

      if (insertResponse.ok) {
        console.log('✅ Order stored in database');
      } else {
        console.log('❌ Failed to store order');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      },
      keyId: keyId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('💥 Error:', error.message);
    return new Response(JSON.stringify({
      error: 'Server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});