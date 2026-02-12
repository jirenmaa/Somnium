"use client";

import { useState } from "react";
import Image from "next/image";

import { signIn } from "@/lib/auth/client";

import SignInForm from "@/components/Forms/SignIn";
import SignUpForm from "@/components/Forms/SignUp";

type Tab = "sign-in" | "sign-up";

export default function AuthTabs() {
  const [tab, setTab] = useState<Tab>("sign-in");

  const handleGoogleLogin = async () => {
    return await signIn.social({ provider: "google" });
  };

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-xl bg-white p-8 shadow-[0_0_40px_rgba(0,0,0,0.15)]">
        <div className="mb-6 flex border border-black/10 rounded">
          <button
            className={`flex-1 cursor-pointer p-4 text-sm font-medium text-neutral-800 ${
              tab === "sign-in" && "text-white rounded-l bg-[var(--sb)]"
            }`}
            onClick={() => setTab("sign-in")}
          >
            Sign In
          </button>

          <button
            className={`flex-1 cursor-pointer p-4 text-sm font-medium text-neutral-800 ${
              tab === "sign-up" && "text-white rounded-r bg-[var(--sb)]"
            }`}
            onClick={() => setTab("sign-up")}
          >
            Sign Up
          </button>
        </div>
        {tab === "sign-in" ? <SignInForm /> : <SignUpForm />}
        <div className="mt-2.5">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 py-3 text-black transition-colors hover:bg-neutral-50"
          >
            <Image
              src="/icons/google.svg"
              alt="google"
              width={20}
              height={20}
            />
            <span className="font-medium">Continue With Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
