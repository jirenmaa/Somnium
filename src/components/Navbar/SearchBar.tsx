import Image from "next/image";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const doSearch = useCallback(
    (q?: string) => {
      const query = (q ?? value).trim();
      // navigate to home with query param - empty query returns home
      if (query.length > 0) {
        router.push(`/?query=${encodeURIComponent(query)}`);
      } else {
        router.push(`/`);
      }
    },
    [router, value],
  );

  return (
    <div
      className={`mx-4 flex max-w-2xl flex-1 items-center justify-between rounded-full border border-gray-200 bg-white transition focus-within:border-gray-400 md:mx-auto dark:border-white/10 dark:bg-[#141414] dark:focus-within:border-white/30`}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            doSearch();
          }
        }}
        className={`w-full border-none bg-transparent p-2.5 pl-5 text-black outline-none placeholder:text-gray-400 focus:ring-0 focus:outline-none dark:text-white dark:placeholder:text-white/40 text-sm sm:text-base`}
        type="text"
        placeholder="Search for videos, tags, folders..."
        aria-label="Search"
      />

      <button
        type="button"
        onClick={() => doSearch()}
        className="mr-5 shrink-0 opacity-70 dark:opacity-80"
        aria-label="Search"
      >
        <Image
          src="/icons/search.svg"
          alt="search"
          width={20}
          height={20}
          className="dark:invert"
        />
      </button>
    </div>
  );
}

export default SearchBar;
