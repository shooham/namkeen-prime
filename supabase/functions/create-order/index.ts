import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'INR', receipt, user_id } = await req.json()

    if (!amount || !user_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Amount and user_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Razorpay
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, message: 'Razorpay credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        user_id: user_id
      }
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderOptions)
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text()
      console.error('Razorpay API Error:', errorData)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create Razorpay order' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const order = await razorpayResponse.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store order details in Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_id: order.id,
          user_id: user_id,
          amount: amount,
          currency: currency,
          status: 'created',
          receipt: order.receipt,
          razorpay_order_id: order.id
        }
      ])
      .select()

    if (orderError) {
      console.error('Error storing order in Supabase:', orderError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: order,
        message: 'Order created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating order:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to create order',
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})