"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/session";

export async function login(
  _previous: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const pin = String(formData.get("pin") ?? "");
  if (!process.env.APP_PIN || pin !== process.env.APP_PIN) {
    return { error: "That PIN isn't right. Try again." };
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, "ok", authCookieOptions());
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  redirect("/login");
}
