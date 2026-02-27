export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Agency Portal</h1>
        <p className="text-lg text-muted-foreground">
          Build your AI team member through conversation, not forms.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a 
            href="/sign-in"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Sign In
          </a>
          <a 
            href="/sign-up"
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}
