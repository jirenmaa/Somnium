"use client";

import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
      <div className="flex h-full flex-col justify-between bg-[#7322FF] p-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
          <h1 className="text-xl font-black">Somnium</h1>
        </Link>
        <div className="hidden items-center justify-center lg:flex">
          <div className="max-w-xl text-center">
            <h1 className="text-center text-3xl font-semibold -tracking-[2px]">
              Somnium has completely changed the way our team communicates.
              Recording a quick walkthrough feels effortless — and sharing it
              takes seconds. It’s become our go-to tool for clarity and speed.
            </h1>
          </div>
        </div>
        <p>&copy; Somnium {new Date().getFullYear()}</p>
      </div>

      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}
