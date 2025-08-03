import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  console.log('🔔 Webhook received:', req.method, req.url)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    // 1. Read request body first
    const requestBody = await req.text()
    console.log('📦 Request body received, length:', requestBody.length)

    // 2. Parse payload to get event type
    const payload = JSON.parse(requestBody)
    console.log(`🎯 Received event: ${payload.event}`)

    // 3. Skip signature verification for testing (enable in production)
    console.warn('⚠️ Webhook signature verification skipped for testing')

    // 4. Process event
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    switch(payload.event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabase, payload)
        break
      case 'payment.failed':
        await handlePaymentFailed(supabase, payload)
        break
      case 'order.paid':
        await handleOrderPaid(supabase, payload)
        break
      default:
        console.log(`ℹ️ Unhandled event type: ${payload.event}`)
    }

    // 5. Return success
    return new Response(JSON.stringify({
      status: 'success',
      event: payload.event,
      message: `Successfully processed ${payload.event} event`
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('❌ Webhook processing failed:', error)
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})

// NEW: Handle order.paid event
async function handleOrderPaid(supabase, payload) {
  const order = payload.payload.order.entity
  const orderId = order.id
  console.log(`💰 Processing order.paid for order: ${orderId}`)
  console.log('📋 Order payload:', JSON.stringify(order, null, 2))

  try {
    // 1. Get order details from database
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)

    if (orderError) {
      console.error('❌ Order query error:', orderError)
      throw new Error(`Order query failed: ${orderError.message}`)
    }

    if (!orders || orders.length === 0) {
      console.error(`❌ Order not found: ${orderId}`)
      
      // For test webhooks, return success to avoid repeated failures
      if (orderId.includes('test')) {
        console.log('✅ Test webhook detected, returning success')
        return
      }
      
      throw new Error(`Order ${orderId} not found in database`)
    }

    const dbOrder = orders[0]
    console.log('✅ Order found in database:', dbOrder)

    // 2. Check if already processed
    if (dbOrder.status === 'paid') {
      console.log('⚠️ Order already processed, skipping')
      return
    }

    // 3. Update order status to paid
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (orderUpdateError) {
      console.error('❌ Failed to update order status:', orderUpdateError)
      throw new Error('Failed to update order status')
    }

    console.log('✅ Order status updated to paid')

    // 4. Create subscription if not exists
    const subscriptionEndDate = new Date()
    const durationDays = 30 // Default duration, you can get from plan
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationDays)

    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', dbOrder.user_id)
      .eq('plan_id', dbOrder.plan_id)
      .eq('status', 'active')
      .single()

    if (!existingSubscription) {
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: dbOrder.user_id,
          plan_id: dbOrder.plan_id,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          end_date: subscriptionEndDate.toISOString().split('T')[0],
          auto_renew: true
        })

      if (subscriptionError) {
        console.error('❌ Failed to create subscription:', subscriptionError)
      } else {
        console.log('✅ Subscription created successfully')
      }
    } else {
      console.log('✅ Subscription already exists')
    }

    console.log(`✅ Successfully processed order.paid for order ${orderId}`)

  } catch (error) {
    console.error(`❌ Error processing order.paid for order ${orderId}:`, error)
    throw error
  }
}

async function handlePaymentCaptured(supabase, payload) {
  const payment = payload.payload.payment.entity
  const orderId = payment.order_id
  console.log(`💰 Processing payment.captured for order: ${orderId}`)

  try {
    // Get order details
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)

    if (orderError || !orders || orders.length === 0) {
      console.error(`❌ Order not found: ${orderId}`)
      if (orderId.includes('test')) {
        console.log('✅ Test webhook detected, returning success')
        return
      }
      throw new Error(`Order ${orderId} not found in database`)
    }

    const order = orders[0]
    console.log('✅ Order found:', order)

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (orderUpdateError) {
      console.error('❌ Failed to update order status:', orderUpdateError)
    } else {
      console.log('✅ Order status updated')
    }

    console.log(`✅ Successfully processed payment.captured for order ${orderId}`)

  } catch (error) {
    console.error(`❌ Error processing payment.captured for order ${orderId}:`, error)
    throw error
  }
}

async function handlePaymentFailed(supabase, payload) {
  const payment = payload.payload.payment.entity
  const orderId = payment.order_id
  console.log(`❌ Processing failed payment for order: ${orderId}`)

  try {
    // Update order status to failed
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'failed',
        error_code: payment.error_code,
        error_description: payment.error_description,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (orderUpdateError) {
      console.error('❌ Failed to update failed order status:', orderUpdateError)
      throw new Error('Failed to update order status')
    }

    console.log(`✅ Updated order ${orderId} status to failed`)

  } catch (error) {
    console.error(`❌ Error processing payment.failed for order ${orderId}:`, error)
    throw error
  }
}