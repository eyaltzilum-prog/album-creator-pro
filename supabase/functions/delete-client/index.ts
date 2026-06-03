import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { clientId } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: 'Client ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Delete all spreads for client's projects first
    const { data: projects } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('client_id', clientId);

    if (projects && projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      
      // Delete spreads for all projects
      const { error: spreadsError } = await supabaseAdmin
        .from('spreads')
        .delete()
        .in('project_id', projectIds);

      if (spreadsError) {
        console.error('Error deleting spreads:', spreadsError);
      }
    }

    // 2. Delete all client's projects
    const { error: projectsError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('client_id', clientId);

    if (projectsError) {
      console.error('Error deleting projects:', projectsError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete projects: ' + projectsError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Delete client's profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', clientId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete profile: ' + profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(clientId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Don't fail completely - profile is already deleted
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Client deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete client error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
