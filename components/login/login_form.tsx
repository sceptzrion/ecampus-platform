"use client";

import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

type LoginResponse =
  | { ok: true; user: { id: number; name: string; email: string; role: string } }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Tampilkan pesan bila user diarahkan dari halaman yang butuh login
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUnauthorized = params.get("unauthorized") === "1";
    const flagged = sessionStorage.getItem("preLoginRedirect") === "1";

    if (fromUnauthorized || flagged) {
      setErrorMsg("Anda harus login terlebih dahulu.");
      sessionStorage.removeItem("preLoginRedirect");
    }
  }, []);

  const validate = () => {
    if (!email.trim() || !EMAIL_RE.test(email)) {
      return "Format email tidak valid.";
    }
    if (!password || password.length < 6) {
      return "Password minimal 6 karakter.";
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as LoginResponse;

      if (!res.ok || !("ok" in data) || data.ok === false) {
        setErrorMsg((data as any)?.error || "Email atau password salah.");
        setPassword("");
        return;
      }

      // Simpan sesi login (sementara di localStorage untuk demo)
      localStorage.setItem("authUser", JSON.stringify(data.user));

      const lowerEmail = email.toLowerCase();

      // ====== 🌟 Tambahan logika redirect berdasarkan domain ======
      if (lowerEmail.endsWith("@admin.unsika.ac.id")) {
        router.push("/admin/dashboard");
      } else if (lowerEmail.endsWith("@staff.unsika.ac.id")) {
        router.push("/dosen/dashboard");
      } else if (lowerEmail.endsWith("@student.unsika.ac.id")) {
        router.push("/dashboard/dashboard-akademik");
      } else {
        router.push("/dashboard/dashboard-akademik");
      }
      // ============================================================

    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Alert error */}
      {errorMsg && (
        <div
          role="alert"
          className="flex flex-col bg-[#F1556C2E] text-[#A93C4C] pl-5 pr-3 pt-5 pb-5.5 gap-1.5 mb-4 rounded-sm"
        >
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-bold">Whops</h2>
            <button
              onClick={() => setErrorMsg(null)}
              aria-label="Tutup peringatan"
              className="p-1 rounded hover:bg-[#f2c6cc66] transition"
            >
              <Image src="/close.png" alt="" width={20} height={20} />
            </button>
          </div>
          <p className="text-sm mb-2">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-[#6C757D]">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Masukan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#ced4da] rounded-sm px-3.5 py-1.75 text-sm text-[#6C757D] focus:outline-none"
            autoComplete="username"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-[#6C757D]">
            Password
          </label>
          <div className="flex flex-row">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Masukan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#ced4da] rounded-l-sm px-3.5 py-1.75 text-sm text-[#6C757D] w-full focus:outline-none"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="flex items-center px-3.5 bg-[#F7F7F7] border-b border-t border-r border-[#ced4da] rounded-r-sm"
            >
              <Image
                src="/password.png"
                alt={showPassword ? "hide password" : "show password"}
                width={18}
                height={18}
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="text-[#6658dd] py-1.75 rounded-xs bg-[#e3e1f9] text-sm hover:text-white hover:bg-[#6658dd] hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </>
  );
};

export default LoginForm;
