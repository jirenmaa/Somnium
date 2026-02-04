"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

const Navbar = () => {
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
    router.push("/sign-in");
  };

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  if (!user) return null;

  return (
    <header className="sticky w-screen top-0 z-[150] w-full bg-white/20 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 border-b border-gray-20">
      <nav className="h-18 flex items-center justify-between py-3 px-2 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={32}
            height={32}
          />
          <h1 className="text-lg font-semibold hidden md:block">Somnium</h1>
        </Link>

        <div className="max-w-2xl mx-4 md:mx-auto flex-1 border border-gray-200 rounded-full flex items-center justify-between transition focus-within:border-gray-400 bg-white">
          <input
            className="w-full bg-transparent p-2.5 pl-5 outline-none border-none focus:outline-none focus:ring-0"
            type="text"
            placeholder="Search for videos, tags, folders..."
          />

          <div className="mr-5 shrink-0">
            <Image
              src="/assets/icons/search.svg"
              alt="search"
              width={20}
              height={20}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/upload"
            className="hidden md:flex items-center gap-2 border border-gray-20 rounded-full py-2 px-5 hover:bg-neutral-100 transition-colors bg-white"
          >
            <Image
              src="/assets/icons/upload.svg"
              alt="upload"
              width={16}
              height={16}
            />
            <span>Upload a video</span>
          </Link>
          <div ref={menuRef}>
            {/* Trigger */}
            <button
              onClick={() => setOpen((p) => !p)}
              className="flex items-center gap-2 rounded-full p-1 hover:bg-neutral-100"
            >
              <Image
                src={user.image || "/assets/images/default-avatar.png"}
                alt="User"
                width={40}
                height={40}
                className="aspect-square rounded-full object-cover"
              />
            </button>
          </div>
        </div>
      </nav>
      {/* Dropdown */}
      {open && (
        <div className="absolute right-4 sm:right-6 lg:right-8 top-18 w-[320px] overflow-hidden rounded-sm border border-gray-20 bg-white shadow-sm z-[999]">
          {/* User Header */}
          <div className="flex gap-3 px-4 py-4">
            <Image
              src={user.image || "/assets/images/default-avatar.png"}
              alt="User"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full aspect-square object-cover"
            />

            <div className="flex flex-col">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-neutral-500">@{user.name}</p>

              <Link
                href={`/profile/${user.id}`}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                View your channel
              </Link>
            </div>
          </div>

          <Divider />

          {/* Account Section */}
          <MenuItem label="Google Account" />

          <MenuItem
            label="Switch Account"
            rightIcon="›"
            onClick={() => console.log("Switch account")}
          />

          <Link
            href="/upload"
            className="block md:hidden overflow-y-hidden flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-neutral-100 transition"
          >
            <span>Upload a video</span>
          </Link>

          <Divider />

          <Link
            href="/studio"
            className="overflow-y-hidden flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-neutral-100 transition"
          >
            <span>Somnium Studio</span>
          </Link>

          <MenuItem label="Membership" />

          <Divider />

          {/* Preferences */}
          <MenuItem label="Your data in Somnium" />

          <MenuItem label="Appearance: Light Theme" rightIcon="›" />
          <MenuItem label="Display language: English" rightIcon="›" />
          <MenuItem label="Location: Indonesia" rightIcon="›" />

          <Divider />

          {/* Settings */}
          <MenuItem label="Settings" />

          <Divider />

          {/* Help */}
          <MenuItem label="Help" />
          <MenuItem label="Send Feedback" />

          <Divider />

          <MenuItem label="Sign Out" danger onClick={handleLogout} />
        </div>
      )}
    </header>
  );
};

export default Navbar;

function Divider() {
  return <div className="h-px bg-neutral-200" />;
}

function MenuItem({
  label,
  rightIcon,
  danger,
  onClick,
}: {
  label: string;
  rightIcon?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        overflow-y-hidden
        flex w-full items-center justify-between
        px-4 py-2.5 text-sm
        hover:bg-neutral-100 transition
        ${danger ? "text-red-600 hover:bg-red-50" : "text-neutral-800"}
      `}
    >
      <span>{label}</span>
      {rightIcon && (
        <span className="text-neutral-400 text-lg leading-none overflow-y-hidden">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
