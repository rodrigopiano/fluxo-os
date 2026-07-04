export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold tracking-tight">FluxoOS</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu copiloto financeiro
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
