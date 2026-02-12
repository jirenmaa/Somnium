import { getMyVideos } from "@/actions/videos";

import Client from "@/components/StudioClient";
import EmptyVideo from "@/components/EmptyVideo";

type Props = {
  query?: string;
  filter?: string;
};

export default async function Page({ query, filter }: Props) {
  const result = await getMyVideos(query, filter);

  // Handle error response
  if (result.error) {
    return (
      <div className="col-span-12 lg:col-span-10">
        <header className="border-b border-black/10 dark:border-white/10">
          <h1 className="p-8 text-4xl font-bold">Your Channel</h1>
        </header>
        <div className="flex h-auto w-full items-center justify-center py-8 text-red-600">
          {result.error.message}
        </div>
      </div>
    );
  }

  const videos = result.data ?? [];

  return (
    <div className="col-span-12 lg:col-span-10">
      <header className="border-b border-black/10 dark:border-white/10">
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

      {videos.length === 0 ? (
        <EmptyVideo
          path="studio"
          message="You doesn't have any videos upload. Get started by creating your first video."
        />
      ) : (
        <Client userVideos={videos} />
      )}
    </div>
  );
}
