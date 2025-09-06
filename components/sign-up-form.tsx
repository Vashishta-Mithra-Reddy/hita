"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export function SignUpForm({
  // className,
  // ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/agent`,
        },
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
      initial={{ opacity: 0, y: 10, scale: 0.99, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
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
                  Sign Up
                </div>
                <h1 className="text-3xl md:text-3xl font-satoshi font-bold tracking-tight text-foreground/70 dark:text-foreground/90">
                  Create a new account
                </h1>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-12 pt-6 px-4 pb-0">
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="px-2 text-sm font-medium leading-none"
                    >
                      Email
                    </Label>
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

                  <div className="space-y-2">
                    <Label
                      htmlFor="repeat-password"
                      className="px-2 text-sm font-medium leading-none"
                    >
                      Repeat Password
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
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
                        email && password && repeatPassword
                          ? "blur-0"
                          : "blur-[1.5px]"
                      }`}
                      disabled={isLoading || !email || !password || !repeatPassword}
                    >
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>

                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-primary underline-offset-4 hover:underline h-10 rounded-xl px-8 w-full"
                    >
                      Already have an account? Login
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
