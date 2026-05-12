import { createLemonSqueezyCheckout } from "@/libs/lemonsqueezy";
import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.variantId) {
    return NextResponse.json(
      { error: "Variant ID is required" },
      { status: 400 }
    );
  } else if (!body.redirectUrl) {
    return NextResponse.json(
      { error: "Redirect URL is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { variantId, redirectUrl } = body;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    const checkoutURL = await createLemonSqueezyCheckout({
      variantId,
      redirectUrl,
      userId: profile?.id,
      email: profile?.email,
    });

    return NextResponse.json({ url: checkoutURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
