"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Video } from "lucide-react";

import { ICONS } from "@/constants";
import { useScreenRecording } from "@/hooks/useRecording";

const RecordScreen = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    micStatus,
    toggleMic,
    isRecording,
    recordedBlob,
    recordedVideoUrl,
    recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useScreenRecording();

  const micDenied = micStatus.status === "denied";
  const micOn = micStatus.toggled;

  const micConfig = micDenied
    ? {
        icon: ICONS.micDenied,
        title:
          "Microphone access is blocked. Enable it in your browser site settings to record voice.",
        buttonClass: "bg-yellow-500 hover:bg-yellow-600",
      }
    : micOn
      ? {
          icon: ICONS.micOn,
          title: "Microphone is enabled",
          buttonClass: "bg-[var(--sb)] hover:bg-rose-600",
        }
      : {
          icon: ICONS.micOff,
          title: "Microphone is disabled",
          buttonClass: "bg-rose-600 hover:bg-[var(--sb)]",
        };

  const closeModal = () => {
    resetRecording();
    setIsOpen(!isOpen);
  };

  const handleStart = async () => {
    resetRecording();
    await startRecording();
  };

  const recordAgain = async () => {
    resetRecording();
    await startRecording();

    if (recordedVideoUrl && videoRef.current) {
      videoRef.current.src = recordedVideoUrl;
    }
  };

  const goToUpload = async () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    sessionStorage.setItem(
      "recordedVideo",
      JSON.stringify({
        url,
        name: "screen-recording.webm",
        type: recordedBlob.type,
        size: recordedBlob.size,
        duration: recordingDuration,
      }),
    );

    router.push("/studio/create");
    closeModal();
  };

  return (
    <div className="w-full md:w-auto">
      <button
        className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-[var(--sb)] px-5 py-3 transition-colors hover:bg-[var(--sb-hover)] sm:w-48"
        onClick={() => setIsOpen(true)}
      >
        <Image src={ICONS.record} alt="record" width={16} height={16} />
        <span className="text-white">Record a video</span>
      </button>

      {isOpen && (
        <section className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="bg-gray-40 shadow-20 absolute inset-0 z-[210] backdrop-blur-xs"
            onClick={() => setIsAsking(true)}
          />

          {isAsking && (
            <>
              <div className="absolute z-[240] rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#171717]">
                <div className="flex flex-col gap-6">
                  <div className="flex max-w-xs flex-col items-center gap-2.5 text-center">
                    <Video className="light:invert" />
                    <p className="text-red-400">
                      You are about to quit this recording session, are you
                      sure?
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-4 text-sm">
                    <button className="cursor-pointer rounded bg-[var(--sb)] p-2.5 px-4 text-white transition-colors hover:bg-[var(--sb-hover)]">
                      Continue Upload
                    </button>
                    <button
                      className="cursor-pointer rounded border border-black/10 p-2.5 px-4 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:hover:bg-neutral-100/10"
                      onClick={() => setIsAsking(false)}
                    >
                      Continue Recording
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-40 shadow-20 absolute inset-0 z-[230] backdrop-blur-xs" />
            </>
          )}

          <div className="relative z-[220] w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-[#171717] mx-4 lg:mx-0 ">
            <figure className="mb-4 flex items-center justify-between">
              <h3 className="light:text-dark-100 text-xl font-bold">
                Screen Recording
              </h3>
              <button
                onClick={closeModal}
                className="hover:bg-gray-20 cursor-pointer rounded-full p-2 transition-colors dark:hover:bg-white/10"
              >
                <Image
                  src={ICONS.close}
                  alt="close"
                  width={20}
                  height={20}
                  className="dark:invert"
                />
              </button>
            </figure>

            <section className="flex w-full items-center justify-center overflow-hidden rounded-lg">
              {isRecording ? (
                <article className="flex flex-col items-center gap-2">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
                  <span className="light:text-dark-100 text-base font-medium">
                    Recording in progress
                  </span>
                </article>
              ) : recordedVideoUrl ? (
                <video
                  ref={videoRef}
                  src={recordedVideoUrl}
                  controls
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="text-base font-medium text-black dark:text-gray-100">
                  Click record to start capturing your screen
                </p>
              )}
            </section>

            <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-4">
              {!isRecording && !recordedVideoUrl && (
                <button
                  onClick={handleStart}
                  className="flex cursor-pointer items-center gap-2 rounded-4xl bg-[var(--sb)] px-6 py-2.5 font-medium text-white hover:bg-[var(--sb-hover)]"
                >
                  <Image
                    src={ICONS.record}
                    alt="record"
                    width={16}
                    height={16}
                  />
                  Record Video
                </button>
              )}
              <button
                onClick={toggleMic}
                className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full ${micConfig.buttonClass}`}
              >
                <Image
                  src={micConfig.icon}
                  alt="microphone"
                  width={24}
                  height={24}
                  title={micConfig.title}
                />
              </button>

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex cursor-pointer items-center gap-2 rounded-4xl bg-red-500 px-6 py-2.5 font-medium text-white"
                >
                  <Image
                    src={ICONS.record}
                    alt="record"
                    width={16}
                    height={16}
                  />
                  Stop Record
                </button>
              )}

              {recordedVideoUrl && (
                <>
                  <button
                    onClick={recordAgain}
                    className="cursor-pointer rounded-4xl bg-neutral-300 px-6 py-2.5 font-medium text-black transition-colors hover:bg-gray-200 dark:bg-gray-100 dark:bg-neutral-100/10 dark:text-white dark:hover:bg-neutral-100/20"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={goToUpload}
                    className="flex cursor-pointer items-center gap-2 rounded-4xl bg-[var(--sb)] px-6 py-2.5 font-medium text-white"
                  >
                    <Image
                      src={ICONS.upload}
                      alt="upload"
                      width={16}
                      height={16}
                      className="invert"
                    />
                    Continue to Upload
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default RecordScreen;
