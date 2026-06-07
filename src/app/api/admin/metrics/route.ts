import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: overview } = await supabase.from('user_dashboard_stats').select('*');

    const { data: funnel } = await supabase.from('application_funnel').select('*');

    const { data: analysis } = await supabase.from('resume_analysis_stats').select('*').single();

    const { data: providers } = await supabase.from('provider_health').select('*');

    return NextResponse.json({
      users: overview?.length ?? 0,
      resumes: overview?.reduce((sum, u) => sum + (u.total_resumes ?? 0), 0) ?? 0,
      analyses: overview?.reduce((sum, u) => sum + (u.total_analyses ?? 0), 0) ?? 0,
      applications: overview?.reduce((sum, u) => sum + (u.total_applications ?? 0), 0) ?? 0,
      feedback: overview?.reduce((sum, u) => sum + (u.total_feedback_entries ?? 0), 0) ?? 0,
      feeds: overview?.reduce((sum, u) => sum + (u.total_feed_generations ?? 0), 0) ?? 0,
      funnel,
      analysis,
      providers,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
