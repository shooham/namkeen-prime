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
    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date()

    // Check user_subscriptions table first (most recent approach)
    const { data: userSubscriptions, error: userSubError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          price,
          duration_days,
          description
        )
      `)
      .eq('user_id', user_id)
      .eq('status', 'active')
      .gte('end_date', now.toISOString().split('T')[0]) // Only get non-expired subscriptions

    console.log('📊 user_subscriptions query result:', { data: userSubscriptions, error: userSubError })

    if (userSubscriptions && userSubscriptions.length > 0) {
      // Get the subscription with the latest end date (longest remaining time)
      const activeSub = userSubscriptions.sort((a, b) => 
        new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )[0]
      
      const expiresAt = new Date(activeSub.end_date)
      const planName = activeSub.subscription_plans?.name || 'Premium'
      const planPrice = activeSub.subscription_plans?.price || 0
      
      console.log('✅ Found active subscription in user_subscriptions:', {
        subscription: activeSub,
        planName,
        planPrice,
        expiresAt
      })

      return new Response(
        JSON.stringify({
          success: true,
          isSubscribed: true,
          plan: planName,
          price: planPrice,
          expiresAt: expiresAt.toISOString(),
          source: 'user_subscriptions',
          subscription: activeSub
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fallback to subscriptions table
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', user_id)
      .eq('status', 'active')
      .gte('current_period_end', now.toISOString()) // Only get non-expired subscriptions

    console.log('📊 subscriptions query result:', { data: subscriptions, error: subError })

    if (subscriptions && subscriptions.length > 0) {
      // Get the subscription with the latest end date
      const activeSub = subscriptions.sort((a, b) => 
        new Date(b.current_period_end).getTime() - new Date(a.current_period_end).getTime()
      )[0]
      
      const expiresAt = new Date(activeSub.current_period_end)
      
      console.log('✅ Found active subscription in subscriptions:', {
        subscription: activeSub,
        expiresAt
      })

      return new Response(
        JSON.stringify({
          success: true,
          isSubscribed: true,
          plan: activeSub.plan || 'premium',
          expiresAt: expiresAt.toISOString(),
          source: 'subscriptions',
          subscription: activeSub
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fallback to streaming_profiles table
    const { data: streamingProfile, error: profileError } = await supabase
      .from('streaming_profiles')
      .select('subscription_tier, subscription_expiry')
      .eq('id', user_id)
      .single()

    console.log('📊 streaming_profiles query result:', { data: streamingProfile, error: profileError })

    if (streamingProfile && !profileError) {
      const expiresAt = streamingProfile.subscription_expiry ? new Date(streamingProfile.subscription_expiry) : null
      const isExpired = expiresAt && expiresAt < now
      const isSubscribed = streamingProfile.subscription_tier !== 'free' && !isExpired
      
      console.log('✅ Found subscription in streaming_profiles:', {
        profile: streamingProfile,
        expiresAt,
        isExpired,
        isSubscribed
      })

      if (isSubscribed) {
        return new Response(
          JSON.stringify({
            success: true,
            isSubscribed: true,
            plan: streamingProfile.subscription_tier,
            expiresAt: expiresAt?.toISOString(),
            source: 'streaming_profiles',
            subscription: streamingProfile
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // No active subscription found
    console.log('❌ No active subscription found for user:', user_id)
    
    return new Response(
      JSON.stringify({
        success: true,
        isSubscribed: false,
        plan: null,
        expiresAt: null,
        source: 'none',
        subscription: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error checking subscription:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to check subscription',
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})