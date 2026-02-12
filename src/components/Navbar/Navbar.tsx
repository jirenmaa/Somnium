"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useUser } from "@/hooks/useUser";

import SearchBar from "./SearchBar";
import User from "./User";
import DropdownMenu from "./DropdownMenu";

const Navbar = ({
  subname,
  path = "home",
}: {
  subname?: string;
  path: "home" | "studio";
}) => {
  const { loading, user } = useUser();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <header className="sticky top-0 z-[100] h-16 w-screen border-b border-black/10 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/40 dark:border-white/10 dark:bg-[#141414]/60 dark:supports-[backdrop-filter]:bg-[#141414]/40">
      <nav className="flex h-full items-center justify-between px-2 py-3 md:gap-4 md:px-8 lg:gap-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icons/logo.svg" alt="logo" width={32} height={32} />
          <h1 className="hidden text-xl font-semibold md:block">
            Somnium{subname}
          </h1>
        </Link>

        <SearchBar />

        {loading ? (
          <div className="md:w-60"></div>
        ) : (
          <div className="md:w-60">
            {user ? (
              <>
                <User
                  path={path}
                  menuRef={menuRef}
                  setOpen={setOpen}
                  userImg={user.avatarUrl}
                />
                {open && <DropdownMenu />}
              </>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-white/10 p-2 transition-colors hover:bg-neutral-100 md:px-3 md:pr-4 sm:ml-30 2xl:w-30 dark:hover:bg-white/5"
              >
                <Image
                  src={"/images/dummy.jpg"}
                  alt="User"
                  width={28}
                  height={28}
                  className="aspect-square rounded-full object-cover"
                />
                <p className="hidden text-[0.95rem] md:block">Sign In</p>
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
