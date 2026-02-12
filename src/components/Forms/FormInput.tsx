import Image from "next/image";

const FileInput = ({
  id,
  accept,
  file,
  previewUrl,
  inputRef,
  onChange,
  onReset,
  type,
  className,
}: FileInputProps & { className?: string }) => {
  return (
    <section className={className}>
      <input
        type="file"
        id={id}
        accept={accept}
        ref={inputRef}
        hidden
        onChange={onChange}
      />

      {!previewUrl ? (
        <figure
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100 transition-colors hover:bg-neutral-200 md:gap-4 dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          <Image
            src="/icons/upload.svg"
            alt="upload"
            width={24}
            height={24}
            className="w-4 opacity-80 md:h-5 md:w-5 dark:invert"
          />
          <p className="text-xs text-neutral-700 sm:text-sm dark:text-neutral-300">
            Click to upload your {id}
          </p>
        </figure>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            {type === "video" ? (
              <video
                src={previewUrl}
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={previewUrl}
                alt="image"
                fill
                className="object-cover"
              />
            )}

            <button
              type="button"
              onClick={onReset}
              className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-white/80 p-2 text-neutral-900 backdrop-blur hover:bg-white dark:bg-neutral-900/80 dark:text-white dark:hover:bg-neutral-900"
            >
              <Image
                src="/icons/close.svg"
                alt="close"
                width={16}
                height={16}
                className="dark:invert"
              />
            </button>
          </div>

          <p className="truncate rounded-md bg-neutral-100 px-3 py-1.5 text-sm text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
            {file?.name}
          </p>
        </div>
      )}
    </section>
  );
};

export default FileInput;
