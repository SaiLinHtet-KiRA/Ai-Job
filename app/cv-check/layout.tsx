import TopNav from "../components/TopNav";

export default function CVCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />

      {children}
    </>
  );
}
