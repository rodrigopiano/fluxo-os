"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null; info?: string | null };

const INVALID_PASSWORD_MESSAGE =
  "Sua senha contém um caractere não suportado (comum ao colar de um app de notas com marcador de lista, tipo \"• senha\"). Digite a senha novamente sem colar.";

/** Supabase's auth API rejects passwords with characters outside Latin-1 (code point > 255). */
function hasUnsupportedPasswordCharacters(password: string): boolean {
  return Array.from(password).some((char) => char.codePointAt(0)! > 255);
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (hasUnsupportedPasswordCharacters(password)) {
    return { error: INVALID_PASSWORD_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada." };
    }
    return { error: "E-mail ou senha incorretos." };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (hasUnsupportedPasswordCharacters(password)) {
    return { error: INVALID_PASSWORD_MESSAGE };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: "Não foi possível criar sua conta. Tente outro e-mail." };
  }

  if (!data.session) {
    return {
      error: null,
      info: "Conta criada! Confirme seu e-mail para poder entrar.",
    };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const headersList = await headers();
  const origin = headersList.get("origin") ?? `https://${headersList.get("host")}`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return {
    error: null,
    info: "Se esse e-mail estiver cadastrado, enviamos um link para redefinir sua senha.",
  };
}

export async function updatePasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (hasUnsupportedPasswordCharacters(password)) {
    return { error: INVALID_PASSWORD_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Não foi possível atualizar a senha. Peça um novo link e tente de novo." };
  }

  redirect("/dashboard");
}
