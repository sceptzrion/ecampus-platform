import Footer from "@/components/footer/footerauth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen p-3 sm:p-0 flex flex-col items-center justify-center bg-[#00acc1]">
      <div className="flex flex-col w-full sm:w-[516px] md:w-[456px] xl:w-[416px] h-full mt-18 mb-24 rounded-sm p-9 bg-white">
        {children}
      </div>
      <Footer />
    </main>
  );
}
