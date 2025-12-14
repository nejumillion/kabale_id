export default function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mb-4 text-lg">Page not found</p>
        <a href="/" className="text-primary hover:underline">
          Return to home
        </a>
      </div>
    </div>
  );
}
