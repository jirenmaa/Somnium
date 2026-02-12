import Navbar from "@/components/Navbar/Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar path="home" />
      {children}
    </>
  );
};

export default Layout;
