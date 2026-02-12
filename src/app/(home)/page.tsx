import Header from "@/components/Header";
import InfiniteVideos from "@/components/Videos/Infinite";

async function Homepage({ searchParams }: SearchParams) {
  const { query, filter } = await searchParams;

  return (
    <div className="m-4 md:m-8">
      <Header title="Public Library" subHeader="All Videos are displayed" />
      <InfiniteVideos query={query} filter={filter} />
    </div>
  );
}

export default Homepage;
