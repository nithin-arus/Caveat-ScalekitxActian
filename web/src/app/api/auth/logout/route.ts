import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  response.cookies.delete("idToken");
  return response;
}
