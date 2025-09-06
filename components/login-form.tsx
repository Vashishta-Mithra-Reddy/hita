"use client";

// import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export function LoginForm({
  // className,
  // ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/agent");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main
        initial={{ opacity: 0, y: 10, scale:0.99, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, scale:1, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }} 
        className="flex-grow flex flex-col justify-center items-center"
    >
      <section className="mx-auto w-full p-4 h-full max-w-4xl flex flex-col">
        <div className="flex flex-col gap-4 relative overflow-hidden items-center md:pt-12 justify-start min-h-dvh">
          <div className="w-full max-w-lg">
            <div className="rounded-3xl p-6 bg-card border-2 border-dashed transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col">
              {/* Header */}
              <div className="text-center flex flex-col items-center gap-3 px-4 py-10 bg-[#30b0f8]/5 dark:border-transparent rounded-2xl w-full border border-blue-200">  
                <div className="text-white inline-flex items-center rounded-full border font-semibold transition-colors border-transparent bg-[#30b0f8]/50 dark:bg-[#5bc4f9]/60 text-primary-foreground px-3.5 py-1 text-sm">
                  Login
                </div>
                <h1 className="text-3xl md:text-3xl font-satoshi font-bold tracking-tight text-foreground/70 dark:text-foreground/90">
                  Welcome back
                </h1>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-12 pt-6 px-4 pb-0">
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="px-2 text-sm font-medium leading-none"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="hita@wellness.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="md:w-80 h-12 rounded-xl border-blue-200 dark:border-blue-200/30 focus:border-blue-400 px-4"
                      />
                    </div>
                    {/* <p className="text-[0.8rem] text-muted-foreground px-2.5">
                      Enter the email address associated with your account
                    </p> */}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="px-2 text-sm font-medium leading-none"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-blue-200 dark:border-blue-200/30 focus:border-blue-400 placeholder:text-foreground/20 px-4 text-2xl"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  )}

                  <div className="flex flex-col gap-4">
                    <Button
                      type="submit"
                      className={`h-10 rounded-xl px-8 py-6 mt-4 text-base w-full font-satoshi bg-[#30b0f8]/70 dark:bg-[#5bc4f9]/80 hover:bg-[#30b0f8]/90 transition-all duration-500 text-white ${
                        email && password ? "blur-0" : "blur-[1.5px]"
                      }`}
                      disabled={isLoading || !email || !password}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>


                    <Link
                      href="/auth/sign-up"
                      className="inline-flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-primary underline-offset-4 hover:underline h-10 rounded-xl px-8 w-full"
                    >
                      Don&apos;t have an account? Sign up
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          {/* <footer className="max-w-lg flex flex-col w-full">
            <div className="flex flex-col gap-4">
              <div className="text-sm text-center text-muted-foreground">
                By proceeding, you agree to our{" "}
                <Link href="/terms-conditions" className="font-medium">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-medium">
                  Privacy Policy
                </Link>
                .
              </div>
              <p className="text-xs text-muted-foreground text-center">
                All Rights Reserved © 2025{" "}
                <Link href="/" className="font-medium">
                  hita.v19.tech
                </Link>
              </p>
            </div>
          </footer> */}
        </div>
      </section>
    </motion.main>
  );
}
