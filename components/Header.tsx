import Image from "next/image";

import DropdownList from "./DropdownList";
import RecordScreen from "./RecordScreen";

const Header = ({ subHeader, title, userImg }: SharedHeaderProps) => {
  return (
    <header className="header">
      <section className="header-container gap-4 md:gap-0">
        <div className="details">
          {userImg && (
            <Image
              src={userImg || "/assets/images/dummy.jpg"}
              alt="user"
              width={66}
              height={66}
              className="rounded-full"
            />
          )}

          <article>
            <p>{subHeader}</p>
            <p>{title}</p>
          </article>
        </div>

        <aside className="flex flex-col md:flex-row gap-4 md:gap-4 items-center w-full md:w-96">
          <RecordScreen />
          <DropdownList />
        </aside>
      </section>
    </header>
  );
};

export default Header;
