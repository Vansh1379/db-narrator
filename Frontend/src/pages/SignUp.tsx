import { SignUp } from "@clerk/clerk-react";
import { Database } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">DB RAG Analytics</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Get started with AI-powered database analytics
            </p>
          </div>
          
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/workspace"
          />
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;

