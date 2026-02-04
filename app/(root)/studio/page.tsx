import { getUserStudioData } from "@/lib/actions/user";

import StudioClient from "./client";


export default async function StudioPage() {
  const data = await getUserStudioData();

  return <StudioClient initialVideos={data.videos} />;
}
