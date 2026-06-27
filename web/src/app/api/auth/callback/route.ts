import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/connect", request.url));
  const accessToken = request.nextUrl.searchParams.get("access_token");
  const idToken = request.nextUrl.searchParams.get("id_token");

  if (accessToken) {
    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  if (idToken) {
    response.cookies.set({
      name: "idToken",
      value: idToken,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}
