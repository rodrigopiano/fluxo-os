"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState: AuthState = { error: null };

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Defina uma nova senha</CardTitle>
        <CardDescription>Escolha uma senha nova para sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
