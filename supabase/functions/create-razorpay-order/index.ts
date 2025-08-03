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
    // 1. Get the plan ID from the request body
    const { planId } = await req.json();
    if (!planId) {
      throw new Error('Plan ID is required.');
    }

    // 2. Authenticate the user
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated.');

    // 3. Fetch plan details from the database using the admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('price')
      .eq('id', planId)
      .single();

    if (planError) throw new Error('Subscription plan not found or query failed.');
    if (!plan) throw new Error('Subscription plan does not exist.');

    const amountInPaise = Math.round(plan.price * 100);

    // 4. Create an order with Razorpay
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

    if (!razorpayResponse.ok) {
      console.error('Razorpay Error:', orderData);
      throw new Error(orderData.error.description || 'Razorpay order creation failed.');
    }

    // 5. Return the created order details to the client
    return new Response(
      JSON.stringify({ 
        orderId: orderData.id, 
        amount: orderData.amount,
        razorpayKeyId: RAZORPAY_KEY_ID,
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