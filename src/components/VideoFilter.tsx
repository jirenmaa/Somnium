"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { FILTER_OPTIONS } from "@/constants";

const VideoFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter") || "latest";

  const currentLabel =
    FILTER_OPTIONS.find((opt) => opt.value === currentFilter)?.label ||
    "Most Recent";

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);

    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-auto">
      <button
        className="flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm transition-colors hover:bg-neutral-100 sm:w-48 dark:border-white/10 dark:bg-[#141414] dark:text-white dark:hover:bg-white/10"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <figure className="flex items-center gap-2">
          <Image
            src="/icons/hamburger.svg"
            alt="menu"
            width={18}
            height={18}
            className="dark:invert"
          />
          <span>{currentLabel}</span>
        </figure>

        <Image
          src="/icons/arrow-down.svg"
          alt="arrow"
          width={20}
          height={20}
          className={`transition-transform dark:invert ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="absolute top-11 z-30 mt-2 w-full overflow-hidden rounded-lg border border-black/10 shadow-lg dark:border-white/10 dark:bg-[#141414]">
          {FILTER_OPTIONS.map((option) => {
            const active = option.value === currentFilter;

            return (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-black text-white dark:bg-white/10 dark:text-white"
                    : "hover:bg-neutral-100 dark:hover:bg-white/10"
                }`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default VideoFilter;
