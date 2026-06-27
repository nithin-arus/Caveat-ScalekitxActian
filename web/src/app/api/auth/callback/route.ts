import { NextResponse, type NextRequest } from "next/server";
import { getScalekitClient } from "@/lib/scalekit";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const accessToken = request.nextUrl.searchParams.get("access_token");
  const idToken = request.nextUrl.searchParams.get("id_token");
  const code = request.nextUrl.searchParams.get("code");

  if (code && !accessToken) {
    try {
      const client = await getScalekitClient();
      const redirectUri = new URL("/api/auth/callback", request.url).toString();
      const result = await client.authenticateWithCode?.(code, redirectUri);
      const tokens = result as { accessToken?: string; access_token?: string; idToken?: string; id_token?: string } | undefined;
      const nextAccessToken = tokens?.accessToken ?? tokens?.access_token;
      const nextIdToken = tokens?.idToken ?? tokens?.id_token;

      if (nextAccessToken) {
        response.cookies.set({
          name: "accessToken",
          value: nextAccessToken,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }

      if (nextIdToken) {
        response.cookies.set({
          name: "idToken",
          value: nextIdToken,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }

      return response;
    } catch (error) {
      return Response.json(
        {
          error: "Scalekit callback is ready for SDK wiring, but the SDK connection is not installed/configured yet.",
          detail: error instanceof Error ? error.message : String(error),
        },
        { status: 501 }
      );
    }
  }

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
