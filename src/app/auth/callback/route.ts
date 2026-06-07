import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  if (code) {
    const response = NextResponse.redirect(new URL('/onboarding', origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookieHeader = request.headers.get('cookie');
            if (!cookieHeader) return [];

            return cookieHeader
              .split(';')
              .map((cookie) => {
                const [name, ...rest] = cookie.trim().split('=');
                return { name: name || '', value: rest.join('=') };
              })
              .filter((cookie) => cookie.name !== '');
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
    }

    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/reset-password', origin));
    }

    return response;
  }

  return NextResponse.redirect(new URL('/login', origin));
}
