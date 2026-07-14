import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookiesList = cookies();
  const token = cookiesList.get("token");

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    hasToken: !!token?.value,
    tokenValue: token?.value ? token.value.substring(0, 20) + "..." : null,
    env: process.env.NODE_ENV,
    message: "API funcionando"
  });
}
