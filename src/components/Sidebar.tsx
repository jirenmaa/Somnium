"use client";

import Image from "next/image";
import Link from "next/link";

import { useUser } from "@/hooks/useUser";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const { user } = useUser();

  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden lg:block lg:col-span-2 border-r border-black/10 dark:border-white/10">
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-2 border-b border-black/10 p-4 py-6 dark:border-white/10">
          <Image
            src={user?.avatarUrl || "/images/dummy.jpg"}
            width={60}
            height={60}
            alt="Avatar"
            className="border-dark/10 mx-auto h-36 w-36 rounded-full border dark:border-white/10"
          />
          <h1 className="text-center text-2xl font-semibold">
            {user?.displayName || user?.fullName}
          </h1>
          <p className="text-center text-[0.95rem] text-neutral-500">
            {user?.email}
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <Link
            href="/studio"
            className={`transistion-colors flex items-center gap-2 rounded-md border border-black/10 px-4 py-3 text-[0.95rem] hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-zinc-100/10 ${pathname === "/studio" && "bg-zinc-100/10"}`}
          >
            <Image
              src="/icons/library.svg"
              width={20}
              height={20}
              alt="library"
              className="dark:invert"
            />
            Manage Videos
          </Link>
          <Link
            href="/studio/create"
            className={`transistion-colors flex items-center gap-2 rounded-md border border-black/10 px-4 py-3 text-[0.95rem] hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-zinc-100/10 ${pathname === "/studio/create" && "bg-zinc-100/10"}`}
          >
            <Image
              src="/icons/upload.svg"
              width={20}
              height={20}
              alt="upload"
              className="dark:invert"
            />
            Upload Video
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
