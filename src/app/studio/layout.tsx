import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar subname="Studio" path="studio" />
      <main className="grid min-h-[calc(100svh-4rem)] grid-cols-12">
        <Sidebar />
        {children}
      </main>
    </>
  );
};

export default Layout;
