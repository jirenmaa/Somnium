"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import { useUser } from "@/hooks/useUser";

const DropdownMenu = () => {
  const { user, onSignOut } = useUser();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="absolute top-16 right-4 z-[999] w-[320px] overflow-hidden rounded-sm border border-black/10 bg-white text-black shadow-sm sm:right-6 lg:right-8 dark:border-white/10 dark:bg-[#141414] dark:text-white">
      {/* User Header */}
      <div className="flex gap-3 px-4 py-4">
        <Image
          src={user?.avatarUrl || "/images/dummy.jpg"}
          alt="User"
          width={48}
          height={48}
          className="aspect-square h-12 w-12 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-black dark:text-white">
            {user?.fullName}
          </p>
          <p className="text-xs text-neutral-500 dark:text-white/50">
            @{user?.displayName}
          </p>

          <Link
            href={`/profile/${user?.id}`}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            View your channel
          </Link>
        </div>
      </div>

      <Divider />

      {/* Account Section */}
      <MenuItem label="Google Account" disabled={true} />

      <MenuItem
        label="Switch Account"
        icon="›"
        onClick={() => console.log("Switch account")}
      />

      <Divider />

      <Link
        href="/studio/create"
        className="block flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-neutral-100 lg:hidden dark:hover:bg-white/10"
      >
        <span>Upload Video</span>
      </Link>

      <Link
        href="/studio"
        className="flex w-full items-center justify-between px-4 py-3 text-sm text-neutral-800 transition hover:bg-neutral-100 dark:text-white/90 dark:hover:bg-white/10"
      >
        <span>Somnium Studio</span>
      </Link>

      <MenuItem label="Membership" />

      <Divider />

      {/* Preferences */}
      <MenuItem label="Your data in Somnium" />

      <MenuItem
        label={`Appearance: ${isDark ? "Dark Theme" : "Light Theme"}`}
        icon={isDark ? <Moon size={18} /> : <Sun size={18} />}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      />
      <MenuItem label="Display language: English" icon="›" />
      <MenuItem label="Location: Indonesia" icon="›" />

      <Divider />

      {/* Settings */}
      <MenuItem label="Settings" />

      <Divider />

      {/* Help */}
      <MenuItem label="Help" />
      <MenuItem label="Send Feedback" />

      <Divider />

      <MenuItem label="Sign Out" danger onClick={onSignOut} disabled={false} />
    </div>
  );
};

function Divider() {
  return <div className="h-px bg-neutral-200 dark:bg-white/10" />;
}

function MenuItem({
  label,
  icon,
  danger,
  onClick,
  disabled = true
}: {
  label: string;
  icon?: string | React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "text-neutral-800 hover:bg-neutral-100 dark:text-white/90 dark:hover:bg-white/10"
      } ${disabled && "!text-neutral-500"}`}
    >
      <span>{label}</span>

      {icon && (
        <span className="text-lg leading-none text-neutral-400 dark:text-white/40">
          {icon}
        </span>
      )}
    </button>
  );
}

export default DropdownMenu;
