import Image from "next/image";

const FileInput = ({
  id,
  label,
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
    <section className="file-input">
      <label htmlFor={id} className="md:text-base text-sm">{label}</label>
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
          className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-100 hover:bg-neutral-200 transition-colors border border-gray-20 flex items-center justify-center gap-2 md:gap-4 cursor-pointer"
        >
          <Image
            src="/assets/icons/upload.svg"
            alt="upload"
            width={24}
            height={24}
            className="w-4 md:w-6 w-4 md:h-6"
          />
          <p className="text-xs sm:text-sm md:text-base">Click to upload your {id}</p>
        </figure>
      ) : (
        <div className="flex flex-col gap-0.5 pr-[1px] pb-[1px]">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            {type === "video" ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-cover"
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
              className="absolute top-2 right-2 bg-neutral-300 opacity-80 hover:opacity-100 text-white p-2 rounded-full cursor-pointer z-[10]"
            >
              <Image
                src="/assets/icons/close.svg"
                alt="close"
                width={16}
                height={16}
              />
            </button>
          </div>
          <p className="rounded-md bg-dark-100 text-white px-3 py-1.5 text-sm truncate z-[9]">
            {file?.name}
          </p>
        </div>
      )}
    </section>
  );
};

export default FileInput;
