import Client from "@/components/StudioClient";

export default function Page() {
  return (
    <div className="col-span-12 lg:col-span-10">
      <header className="border-b border-black/10 bg-[#0a0a0a] dark:border-white/10">
        <h1 className="p-8 text-4xl font-bold">Your Channel</h1>

        <nav className="mt-4 flex gap-8 px-8 text-sm text-neutral-500">
          {["Videos", "Shorts", "Podcasts"].map((tab) => (
            <button
              key={tab}
              className={`cursor-pointer px-2.5 pb-2 transition-colors ${
                tab === "Videos"
                  ? "border-b-2 border-neutral-500 font-medium text-black dark:text-white dark:hover:text-white"
                  : "!cursor-not-allowed"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <Client />
    </div>
  );
}
