import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];
const HOME_BY_ROLE = { owner: "/dashboard/owner", barista: "/dashboard/barista" };

export async function middleware(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const loginRedirect = () => {
    const next = pathname + (request.nextUrl.search || "");
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.search = `?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(u);
  };

  // Signed-in users do not need auth pages
  if (user && AUTH_PAGES.includes(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const dest =
      HOME_BY_ROLE[profile?.role] ?? HOME_BY_ROLE.barista;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/find-baristas") ||
    pathname.startsWith("/messages") ||
    pathname === "/update-password";

  if (!isProtected) return response;

  if (!user) return loginRedirect();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role;
  const home = HOME_BY_ROLE[role] ?? HOME_BY_ROLE.barista;

  // Role-scoped areas
  if (
    (pathname.startsWith("/dashboard/owner") ||
      pathname === "/find-baristas") &&
    role !== "owner"
  ) {
    return NextResponse.redirect(new URL(home, request.url));
  }
  if (pathname.startsWith("/dashboard/barista") && role !== "barista") {
    return NextResponse.redirect(new URL(home, request.url));
  }
  if (pathname.startsWith("/onboarding/")) {
    const wanted = pathname.split("/")[2]; // 'barista' | 'owner'
    if (wanted !== role) {
      return NextResponse.redirect(
        new URL(`/onboarding/${role ?? "barista"}`, request.url)
      );
    }
    const table = role === "owner" ? "owners" : "barista_profiles";
    const { data: detail } = await supabase
      .from(table)
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    // Already finished onboarding -> send to dashboard
    if (detail && pathname !== `/onboarding/${role}`) {
      return NextResponse.redirect(new URL(home, request.url));
    }
    if (detail) {
      return NextResponse.redirect(new URL(home, request.url));
    }
    return response;
  }

  // Dashboard requires completed onboarding
  if (pathname.startsWith("/dashboard")) {
    const table = role === "owner" ? "owners" : "barista_profiles";
    const { data: detail } = await supabase
      .from(table)
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!detail) {
      return NextResponse.redirect(
        new URL(`/onboarding/${role}`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
