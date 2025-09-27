import Footer from "@/components/footer/footerauth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#00acc1]">
      <div className="flex flex-col w-[416px] h-full mt-18 mb-24 rounded-sm p-9 bg-white">
        {children}
      </div>
      <Footer />
    </main>
  );
}
