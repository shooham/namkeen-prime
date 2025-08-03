import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 create-user-profile function called:', new Date().toISOString())
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📝 Processing user profile creation request...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ No authorization header found')
      throw new Error('No authorization header')
    }

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Verifying user token...')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error('❌ Invalid user token:', userError)
      throw new Error('Invalid user token')
    }

    console.log('✅ User verified:', user.email)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Check if user already exists in users table
    console.log('🔍 Checking if user exists in users table...')
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', checkError)
      throw checkError
    }

    let userData = existingUser

    if (!existingUser) {
      console.log('🆕 Creating new user profile for:', user.email)
      
      // Create new user profile
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating user in users table:', createError)
        throw createError
      }

      console.log('✅ User created in users table successfully')
      userData = newUser

      // Also create in user_profiles as backup
      console.log('📋 Creating backup entry in user_profiles table...')
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('⚠️ Warning: Error creating user_profiles backup:', profileError)
        // Don't throw error for backup table failure
      } else {
        console.log('✅ Backup entry created in user_profiles table')
      }
    } else {
      console.log('👤 User already exists:', user.email)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData,
        message: existingUser ? 'User already exists' : 'User profile created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-user-profile:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
