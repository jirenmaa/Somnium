"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ICONS } from "@/constants";
import { useScreenRecording } from "@/hooks/useScreenRecording";

const RecordScreen = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
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
          buttonClass: "bg-[var(--tone)] hover:bg-rose-600",
        }
      : {
          icon: ICONS.micOff,
          title: "Microphone is disabled",
          buttonClass: "bg-rose-600 hover:bg-[var(--tone)]",
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

    router.push("/upload");
    closeModal();
  };

  return (
    <div className="record w-full md:w-auto">
      <button
        className="w-full md:w-auto primary-btn justify-center md:justify-start"
        onClick={() => setIsOpen(true)}
      >
        <Image src={ICONS.record} alt="record" width={16} height={16} />
        <span>Record a video</span>
      </button>

      {isOpen && (
        <section className="dialog">
          <div className="overlay-record" onClick={closeModal} />
          <div className="dialog-content">
            <figure>
              <h3>Screen Recording</h3>
              <button onClick={closeModal} className="transition-colors">
                <Image src={ICONS.close} alt="close" width={20} height={20} />
              </button>
            </figure>

            <section>
              {isRecording ? (
                <article>
                  <div></div>
                  <span>Recording in progress</span>
                </article>
              ) : recordedVideoUrl ? (
                <video ref={videoRef} src={recordedVideoUrl} controls />
              ) : (
                <p>Click record to start capturing your screen</p>
              )}
            </section>

            <div className="record-box">
              {!isRecording && !recordedVideoUrl && (
                <button onClick={handleStart} className="record-start">
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
                className={`w-11 h-11 flex items-center justify-center rounded-full ${micConfig.buttonClass}`}
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
                <button onClick={stopRecording} className="record-stop">
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
                  <button onClick={recordAgain} className="record-again">
                    Record Again
                  </button>
                  <button onClick={goToUpload} className="record-upload">
                    <Image
                      src={ICONS.upload}
                      alt="upload"
                      width={16}
                      height={16}
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
