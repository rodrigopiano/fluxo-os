import { signInWithGoogleAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function GoogleButton() {
  return (
    <form action={signInWithGoogleAction}>
      <Button type="submit" variant="outline" className="w-full gap-2">
        <svg viewBox="0 0 24 24" className="size-4">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.89c2.28-2.1 3.53-5.2 3.53-8.8z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-2.98c-1.08.72-2.45 1.15-4.04 1.15-3.11 0-5.75-2.1-6.69-4.92H1.29v3.09C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.31 14.34c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.69H1.29A11.96 11.96 0 0 0 0 12.06c0 1.94.46 3.77 1.29 5.37l4.02-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.69l4.02 3.09c.94-2.82 3.58-5.03 6.69-5.03z"
          />
        </svg>
        Continuar com Google
      </Button>
    </form>
  );
}
