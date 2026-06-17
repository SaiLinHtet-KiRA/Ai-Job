import TopNav from "../components/TopNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a2540]">
      <TopNav />
      {children}
    </div>
  );
}
