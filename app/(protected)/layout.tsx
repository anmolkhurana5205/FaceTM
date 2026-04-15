import { Navbar } from "./_components/navbar";

interface protectedLayoutProps {
  children: React.ReactNode;
}

const protectedLayout = ({ children }: protectedLayoutProps) => {
  return (
    <div className="min-h-full w-full flex flex-col gap-y-10 items-center py-10 bg-[radial-gradient(ellipse_at_top,skyblue,blue)]">
      <Navbar />
      {children}
    </div>
  );
};

export default protectedLayout;
