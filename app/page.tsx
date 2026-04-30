import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginButton } from "@/components/auth/login-button";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className,
          )}
        >
          FaceTM
        </h1>
        <p className="text-lg text-blue-300">PAY VIA FACE</p>
        <div>
          <LoginButton asChild mode="modal">
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5! text-white hover:bg-white/30! hover:text-white backdrop-blur-md!"
            >
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
