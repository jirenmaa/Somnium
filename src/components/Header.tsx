import Image from "next/image";

import RecordScreen from "./Recording";
import VideoFilter from "./VideoFilter";

const Header = ({ title, subHeader, userImg }: SharedHeaderProps) => {
  return (
    <header className="my-8 mt-12 flex w-full flex-col items-start justify-between gap-4 sm:flex-row md:gap-0">
      <div className="flex gap-6">
        {userImg && (
          <Image
            src={userImg || "/images/dummy.jpg"}
            alt="user"
            width={100}
            height={100}
            className="rounded-full border border-black/10 dark:border-white/10"
          />
        )}

        <div className="flex flex-col gap-2.5">
          <p className="text-3xl font-bold tracking-tight">{title}</p>
          <p className="text-neutral-500">{subHeader}</p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto md:flex-row">
        {!userImg && <RecordScreen />}
        <VideoFilter />
      </div>
    </header>
  );
};

export default Header;
