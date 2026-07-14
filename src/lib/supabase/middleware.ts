import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/auth/callback"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let {
    data: { user },
  } = await supabase.auth.getUser();

  // No visible login screen for this single-user deployment: if there's no
  // session, transparently sign in with a fixed account instead of bouncing
  // to /login. Falls back to the normal login flow if that's misconfigured.
  const autoEmail = process.env.AUTO_LOGIN_EMAIL;
  const autoPassword = process.env.AUTO_LOGIN_PASSWORD;
  if (!user && autoEmail && autoPassword) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: autoEmail,
      password: autoPassword,
    });
    if (!error) {
      user = data.user;
    }
  }

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
