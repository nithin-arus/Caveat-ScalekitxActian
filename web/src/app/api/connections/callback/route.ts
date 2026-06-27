import { NextResponse } from "next/server";
import { verifyGmailConnection } from "@/lib/scalekitAgent";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authRequestId = url.searchParams.get("authRequestId") ?? url.searchParams.get("auth_request_id");
  const identifier = url.searchParams.get("identifier");
  const appUrl = process.env.RENDER_EXTERNAL_URL || process.env.CAVEAT_APP_URL || "https://caveat-scalekitxactian-yt9v.onrender.com";

  if (!authRequestId || !identifier) {
    return NextResponse.redirect(`${appUrl}/?connection=missing_params`);
  }

  try {
    await verifyGmailConnection(authRequestId, identifier);
    return NextResponse.redirect(`${appUrl}/?connection=connected`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(`${appUrl}/?connection=error&message=${encodeURIComponent(message)}`);
  }
}
