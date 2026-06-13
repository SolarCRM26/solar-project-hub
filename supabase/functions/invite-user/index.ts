// @ts-expect-error: Deno edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error: Deno edge function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      // @ts-expect-error: Deno runtime global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error: Deno runtime global
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the caller is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify caller is an administrator
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admins only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { email, fullName, role, redirectTo } = await req.json()

    // Determine the frontend request origin dynamically
    const requestOrigin = req.headers.get('origin') || 'http://localhost:8080'
    const finalRedirectTo = redirectTo || `${requestOrigin}/reset-password`

    if (!email || !fullName || !role) {
      return new Response(
        JSON.stringify({ error: 'email, fullName, and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already exists in profiles
    const { data: existingProfiles, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email', email)

    let userId = null
    let isExisting = false

    if (!profileFetchError && existingProfiles && existingProfiles.length > 0) {
      userId = existingProfiles[0].user_id
      isExisting = true
    }

    if (isExisting && userId) {
      // Update metadata to flag password setup pending
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { pending_password_setup: true }
      })

      // Assign role to user in user_roles
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        })

      // If role is client, ensure client record is also created
      if (role === 'client') {
        const { data: existingClient } = await supabaseAdmin
          .from('clients')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (!existingClient) {
          await supabaseAdmin
            .from('clients')
            .insert({
              user_id: userId,
              name: fullName,
              email: email
            })
        }
      }

      // Try sending invitation first (if user is unconfirmed)
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: finalRedirectTo,
          data: {
            full_name: fullName,
            pending_password_setup: true
          }
        }
      )

      if (inviteError) {
        // If they are already registered/confirmed, trigger a password recovery instead
        const { error: recoveryError } = await supabaseAdmin.auth.admin.resetPasswordForEmail(
          email,
          {
            redirectTo: finalRedirectTo,
          }
        )
        if (recoveryError) {
          console.error('Failed to send recovery email:', recoveryError)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User already exists. Role updated and invitation link sent.',
          user: {
            id: userId,
            email: email,
            fullName: fullName,
            role: role
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Invite user by email using Supabase Auth Admin API (for new users)
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: finalRedirectTo,
        data: {
          full_name: fullName,
          pending_password_setup: true
        }
      }
    )

    if (inviteError || !inviteData?.user) {
      throw inviteError || new Error('Failed to invite user')
    }

    const invitedUser = inviteData.user

    // Assign role to user in user_roles
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: invitedUser.id,
        role: role
      })

    if (roleInsertError) {
      console.error('Error assigning role:', roleInsertError)
    }

    // If role is client, ensure client record is also created
    if (role === 'client') {
      const { error: clientInsertError } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: invitedUser.id,
          name: fullName,
          email: email
        })

      if (clientInsertError) {
        console.error('Error creating client record:', clientInsertError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: invitedUser.id,
          email: invitedUser.email,
          fullName: fullName,
          role: role
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
