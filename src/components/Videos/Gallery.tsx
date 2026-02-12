import VideoItem from "./VideoItem";

import { DUMMY_VIDEOS } from "@/constants";

const Gallery = () => {
  return (
    <div className="grid grid-cols-1 gap-0.5 lg:grid-cols-2 2xl:grid-cols-4">
      {DUMMY_VIDEOS.map((video) => (
        <VideoItem video={video} key={video.id} />
      ))}
    </div>
  );
};

export default Gallery;
