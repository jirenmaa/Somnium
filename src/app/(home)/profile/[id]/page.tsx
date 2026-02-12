import ProfileWrapper from "./ProfileWrapper";

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { filter?: string; query?: string };
}) {
  const { id: userId } = await params;
  const { query, filter } = await searchParams;

  return (
    <div className="m-4 md:m-8">
      <ProfileWrapper userId={userId} filter={filter} query={query} />
    </div>
  );
}
