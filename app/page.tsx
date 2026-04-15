import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginButton } from "@/components/auth/login-button";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,skyblue,blue)]">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}
        >
          🔐Auth
        </h1>
        <p className="text-white text-lg">Simple authentication service</p>
        <div>
          <LoginButton asChild mode="modal">
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}

// In this project we are using the sever action instead of API routes for the form submissions.
// This is to leverage the benefits of server actions like reduced latency, improved performance, and better developer experience.
// Hence, there are no API routes defined for authentication in this project.
