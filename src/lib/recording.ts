
import { DEFAULT_RECORDING_CONFIG } from "@/constants";

export async function getMediaStreams(
  useMic: boolean,
  micStatus: "granted" | "denied" = "granted",
) {
  // Screen capture (tab/system audio)
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });

  const hasDisplayAudio = displayStream.getAudioTracks().length > 0;

  let micStream: MediaStream | null = null;

  // Only request mic if user enabled it and usesr site setting allowed it
  if (useMic && micStatus == "granted") {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      console.warn("Mic permission denied — recording display audio only.");
      micStream = null;
    }
  }

  return {
    displayStream,
    micStream,
    hasDisplayAudio,
  };
}

export const createAudioMixer = (
  ctx: AudioContext,
  displayStream: MediaStream,
  micStream: MediaStream | null,
  hasDisplayAudio: boolean,
) => {
  if (!hasDisplayAudio && !micStream) return null;

  const destination = ctx.createMediaStreamDestination();
  const mix = (stream: MediaStream, gainValue: number) => {
    const source = ctx.createMediaStreamSource(stream);
    const gain = ctx.createGain();
    gain.gain.value = gainValue;
    source.connect(gain).connect(destination);
  };

  if (hasDisplayAudio) mix(displayStream, 1.0);
  if (micStream) mix(micStream, 1.2);

  return destination.stream.getAudioTracks().length > 0 ? destination : null;
};

export const setupMediaRecorder = (stream: MediaStream) => {
  try {
    return new MediaRecorder(stream, DEFAULT_RECORDING_CONFIG);
  } catch {
    return new MediaRecorder(stream);
  }
};
export const setupRecording = (
  stream: MediaStream,
  handlers: RecordingHandlers,
): MediaRecorder => {
  const recorder = new MediaRecorder(stream, DEFAULT_RECORDING_CONFIG);
  recorder.ondataavailable = handlers.onDataAvailable;
  recorder.onstop = handlers.onStop;
  return recorder;
};

export const cleanupRecording = (
  recorder: MediaRecorder | null,
  stream: MediaStream | null,
  originalStreams: MediaStream[] = [],
) => {
  if (recorder?.state !== "inactive") {
    recorder?.stop();
  }

  stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  originalStreams.forEach((s) =>
    s.getTracks().forEach((track: MediaStreamTrack) => track.stop()),
  );
};

export const createRecordingBlob = (
  chunks: Blob[],
): { blob: Blob; url: string } => {
  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  return { blob, url };
};

export const calculateRecordingDuration = (startTime: number | null): number =>
  startTime ? Math.round((Date.now() - startTime) / 1000) : 0;