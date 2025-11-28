import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";


export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });


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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/remedies") &&
    !request.nextUrl.pathname.startsWith("/products") &&
    !request.nextUrl.pathname.startsWith("/recipes") &&
    !request.nextUrl.pathname.startsWith("/wellness-tips") &&
    !request.nextUrl.pathname.startsWith("/brands") &&
    !request.nextUrl.pathname.startsWith("/foods") &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    (!request.nextUrl.pathname.startsWith("/diet") || request.nextUrl.pathname === "/diet/me")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Enforce onboarding before using the diet builder
  if (
    user &&
    request.nextUrl.pathname.startsWith("/diet/me") &&
    !request.nextUrl.pathname.startsWith("/onboarding")
  ) {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("diet_type, meals_per_day, meal_slot_labels")
      .eq("user_id", user.id)
      .maybeSingle();

    const meals = Number(prefs?.meals_per_day ?? 0);
    const labelsCount = Array.isArray(prefs?.meal_slot_labels)
      ? (prefs?.meal_slot_labels?.length ?? 0)
      : 0;

    const onboardingComplete =
      !!prefs?.diet_type && meals > 0 && labelsCount === meals;

    if (!onboardingComplete) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      const backTo = request.nextUrl.pathname + request.nextUrl.search;
      url.searchParams.set("next", backTo);
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
