export const STUDIO_PAGE_SIZE = 5;

// Maximum number of requests allowed within the defined time window
export const RATE_LIMIT_MAX_REQUESTS = 5
// Time window for rate limiting (in seconds)
export const RATE_LIMIT_WINDOW_SECONDS = "60 s"

export const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_THUMBNAIL_SIZE = 3 * 1024 * 1024; // 3MB

export const ICONS = {
  record: "/icons/record.svg",
  close: "/icons/close.svg",
  upload: "/icons/upload.svg",
  micOn: "/icons/mic-on.svg",
  micOff: "/icons/mic-off.svg",
  micDenied: "/icons/mic-denied.svg",
};

export const DEFAULT_VIDEO_CONFIG = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30 },
};

export const DEFAULT_RECORDING_CONFIG = {
  mimeType: "video/webm;codecs=vp9,opus",
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
};

export const FILTER_OPTIONS = [
  { label: "Most Recent", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Viewed", value: "views" },
];

// Credit: https://peach.blender.org/about/
//         https://telecommunication-telemedia-assessment.github.io/
export const VIDEO_URL_FALLBACK = "https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/bigbuck_bunny_8bit_2000kbps_1080p_60.0fps_h264.mp4"
