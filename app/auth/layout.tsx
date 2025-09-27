export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid place-items-center bg-[#00acc1]">
      <div className="w-full max-w-md rounded-xl bg-white border p-6 shadow">
        {children}
      </div>
    </main>
  );
}
