import Header from "@/components/Header";
import InfiniteVideos from "@/components/InfiniteVideos";

const Page = async ({ searchParams }: SearchParams) => {
  const { query, filter } = await searchParams;

  return (
    <main className="wrapper page">
      <Header title="All videos" subHeader="Public Library" />

      <InfiniteVideos query={query} filter={filter} />
    </main>
  );
};

export default Page;
