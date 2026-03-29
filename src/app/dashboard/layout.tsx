export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="w-60 bg-zinc-900 p-4">
        <p className="text-white font-bold">FinScribe AI</p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
