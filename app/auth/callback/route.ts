import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * OAuth callback handler.
 * After user signs in with Google/GitHub, Supabase redirects here with a code.
 * We exchange the code for a session and redirect back to the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError.message);
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Successfully authenticated — redirect to home
    return NextResponse.redirect(`${origin}/`);
  }

  // No code provided — redirect to home
  return NextResponse.redirect(`${origin}/`);
}
