"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { useRouter } from "next/navigation";

// Schemas
const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn("password", { email: values.email, password: values.password, flow: "signIn" });
      } else {
        await signIn("password", { name: values.name ?? "", email: values.email, password: values.password, flow: "signUp" });
      }
      // Redirect or handle success (Convex Auth usually handles redirect if configured, or we can force it)
      router.push("/");
    } catch (error) {
      console.error("Auth error:", error);
      // Show error toast (we should add toaster later)
      alert("Authentication failed. " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider);
    } catch (error) {
       console.error("Provider Auth error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-hidden p-4 sm:p-6 bg-slate-50 dark:bg-[#101622]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #135bec 0%, transparent 40%)" }}
      />

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="relative z-10 w-full max-w-100 bg-white dark:bg-[#1c2536] rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
      >
        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/20 text-blue-600">
             {/* Material Symbol 'school' placeholder - using a text fallback or lucide icon */}
             <span className="text-3xl font-bold">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">VocabMaster</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Master your words, master your world.</p>
        </div>

        {/* Toggle */}
        <div className="px-6 mb-6">
          <div className="flex w-full bg-slate-100 dark:bg-[#192233] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-bold transition-all duration-200 ${isLogin ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"}`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-bold transition-all duration-200 ${!isLogin ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"}`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-8 flex flex-col gap-5">
            {!isLogin && (
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="Enter your name"
                />
            )}

            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              iconSrc="" // Add icon later if needed
            />

            <div className="space-y-2">
                <CustomFormField
                fieldType={FormFieldType.PASSWORD}
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                />
                 {isLogin && (
                    <div className="flex justify-end">
                        <a className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors" href="#">
                            Forgot Password?
                        </a>
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6" disabled={isLoading}>
              {isLoading ? "Processing..." : (isLogin ? "Log In" : "Sign Up")}
            </Button>

            {/* Socials */}
            <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-[#1c2536] text-slate-500 dark:text-slate-400">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" onClick={() => handleProviderSignIn("google")} className="w-full dark:bg-[#192233] dark:border-slate-800 dark:text-white">
                    Google
                </Button>
                <Button variant="outline" type="button" onClick={() => handleProviderSignIn("github")} className="w-full dark:bg-[#192233] dark:border-slate-800 dark:text-white">
                    GitHub
                </Button>
            </div>

          </form>
        </Form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#101622]/50 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                By continuing, you agree to our <a className="font-medium text-blue-600 hover:underline" href="#">Terms of Service</a> and <a className="font-medium text-blue-600 hover:underline" href="#">Privacy Policy</a>.
            </p>
        </div>

      </motion.div>
    </div>
  );
}
