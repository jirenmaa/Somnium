import type { Dispatch, SetStateAction, RefObject } from "react";
import Link from "next/link";
import Image from "next/image";

export interface UserProps {
  menuRef: RefObject<HTMLDivElement | null>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  userImg?: string | null;
  path: "home" | "studio";
}

const User = ({ menuRef, setOpen, userImg, path }: UserProps) => {
  return (
    <div className="flex items-center justify-end gap-3">
      {path === "home" && (
        <Link
          href="/studio/create"
          className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-black transition-colors hover:bg-neutral-100 lg:flex dark:border-white/10 dark:bg-[#141414] dark:text-white dark:hover:bg-white/10"
        >
          <Image
            src="/icons/upload.svg"
            alt="upload"
            width={16}
            height={16}
            className="md:-mt-0.5 dark:invert"
          />
          <span className="md:-mt-0.5">Upload a video</span>
        </Link>
      )}

      <div ref={menuRef}>
        {/* Trigger */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex cursor-pointer items-center gap-2 rounded-full p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-white/10"
        >
          <Image
            src={userImg || "/images/dummy.jpg"}
            alt="User"
            width={42}
            height={42}
            className="aspect-square rounded-full object-cover"
          />
        </button>
      </div>
    </div>
  );
};

export default User;
