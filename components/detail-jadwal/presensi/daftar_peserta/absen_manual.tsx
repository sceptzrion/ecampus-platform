"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PresensiStatus = "HADIR" | "IZIN" | "SAKIT" | null;

type StudentLite = { id: string; name: string; nim: string } | null;

/* =========================
   Modal Konfirmasi
   ========================= */
function ConfirmModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" role="dialog" aria-modal>
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onCancel}
      />
      {/* Dialog */}
      <div
        className={[
          "relative z-[1001] w-[90%] max-w-md rounded-xl bg-white border border-gray-200 shadow-xl",
          "transition-all duration-200",
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2",
        ].join(" ")}
      >
        <div className="pt-6 flex justify-center">
          <div className="h-10 w-10 rounded-full grid place-content-center bg-green-100 text-green-600">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1 14-4-4 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 7Z" />
            </svg>
          </div>
        </div>
        <div className="px-6 pb-6 text-center">
          <h3 className="mt-3 text-lg font-bold text-gray-900">{title}</h3>
          {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-white" />
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-1 rounded-md bg-green-600 text-white px-4 py-2 text-sm hover:bg-green-700"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-white" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   AbsenManual
   ========================= */
export default function AbsenManual({
  student,
  onBack,
  onSubmitSuccess,
}: {
  student?: StudentLite;                 // opsional, tampilkan identitas bila ada
  onBack?: () => void;                   // opsional: kembali ke daftar
  onSubmitSuccess?: () => void;          // opsional: callback setelah simpan
}) {
  const router = useRouter();

  // Kamera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [cameraOn, setCameraOn] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const startingRef = useRef(false); // guard cegah start overlap

  // Presensi
  const [status, setStatus] = useState<PresensiStatus>(null);

  // Lokasi / Map (panel kanan)
  const [loc, setLoc] = useState<{ lat: number; lng: number; acc?: number } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [locLabel, setLocLabel] = useState<string>(""); // “Kecamatan, Kota”

  // Modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* ====== UTIL: Benar2 matikan kamera ====== */
  const stopStream = () => {
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
    }
    setStream(null);
  };

  /* ====== Start kamera (anti-interrupt) ====== */
  const startCamera = async (fm: "environment" | "user") => {
    if (startingRef.current) return; // cegah double start
    startingRef.current = true;
    try {
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
      if (stream) {
        stream.getTracks().forEach((t) => {
          try { t.stop(); } catch {}
        });
        setStream(null);
      }

      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: fm }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(s);

      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = s;

        await new Promise<void>((resolve) => {
          const handler = () => {
            v.removeEventListener("loadedmetadata", handler);
            resolve();
          };
          v.addEventListener("loadedmetadata", handler, { once: true });
        });

        try { await v.play(); } catch {}
      }
      setCameraOn(true);
    } catch (e: any) {
      alert(`Tidak bisa akses kamera: ${e?.message ?? e}`);
      setCameraOn(false);
    } finally {
      startingRef.current = false;
    }
  };

  /* ====== Effects ====== */
  useEffect(() => {
    if (cameraOn) startCamera(facing);
    return () => {
      // Unmount: matikan kamera demi privasi
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing]);

  // Privasi tambahan: matikan saat tab disembunyikan / pindah halaman
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stopStream();
        setCameraOn(false);
      }
    };
    const onPageHide = () => {
      stopStream();
      setCameraOn(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  /* ====== Handlers kamera ====== */
  const switchCamera = () => {
    if (!cameraOn || photoUrl) return;
    setFacing((p) => (p === "environment" ? "user" : "environment"));
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;

    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // MIRROR hasil foto yang DISIMPAN (selfie)
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, w, h);
    ctx.restore();

    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    setPhotoUrl(dataUrl);

    // Matikan kamera setelah ambil gambar
    stopStream();
    setCameraOn(false);
  };

  const retakePhoto = () => {
    setPhotoUrl(null);
    startCamera(facing);
  };

  const turnOffCamera = () => {
    stopStream();
    setCameraOn(false);
  };

  const turnOnCamera = () => {
    startCamera(facing);
  };

  /* ====== Lokasi + Reverse Geocoding ====== */
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung browser ini.");
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLoc({ lat: latitude, lng: longitude, acc: accuracy });
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, { headers: { "Accept-Language": "id" } });
          const data = await res.json();
          const a = data?.address || {};
          const kec =
            a.city_district || a.suburb || a.village || a.town || a.municipality || a.county;
          const kota = a.city || a.town || a.municipality || a.state_district || a.county || a.state;
          const label = [kec, kota].filter(Boolean).join(", ");
          setLocLabel(label || "Lokasi berhasil diambil");
        } catch {
          setLocLabel("Lokasi berhasil diambil");
        }
        setLoadingLoc(false);
      },
      (err) => {
        setLoadingLoc(false);
        alert(`Gagal mendapatkan lokasi: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const mapSrc = loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=16&output=embed` : "";

  /* ====== Submit Guard ====== */
  const canSubmit = Boolean(photoUrl && status && locLabel);

  const goBack = () => {
    stopStream();                 // privasi
    if (onBack) onBack();
    else router.back();           // fallback
  };

  const doSubmit = () => {
    // Contoh payload
    console.log({
      student,
      status,
      photo: photoUrl?.slice(0, 64) + "...",
      lokasi: { ...loc, label: locLabel },
    });

    setConfirmOpen(false);
    stopStream();

    if (onSubmitSuccess) onSubmitSuccess(); // kembali via parent state
    else router.back();                     // fallback: kembali ke halaman sebelumnya
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) setConfirmOpen(true);
  };

  const displayName = student?.name ?? "MUHAMAD IKHSAN RIZQI YANUAR";
  const displayNim = student?.nim ?? "2210631170131";

  return (
    <form onSubmit={onSubmit} className="w-full">
      {/* Header + tombol kembali */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Presensi Manual</h3>
        <button
          type="button"
          onClick={goBack}
          className="px-3 py-1.5 rounded-md bg-yellow-400 text-sm hover:bg-yellow-500 text-white"
        >
          Kembali
        </button>
      </div>

      <div className="w-full bg-white rounded-lg px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ============ KIRI: Kamera / Foto ============ */}
          <div className="place-self-center w-full rounded-md p-4 bg-[#f3f6f8]">
            <div className="relative aspect-square lg:aspect-video w-full rounded-md bg-black overflow-hidden">
              {/* Switch kamera (pojok kanan atas) */}
              <button
                type="button"
                onClick={switchCamera}
                title="Ganti Kamera"
                disabled={!cameraOn || Boolean(photoUrl)}
                className="absolute top-2 right-2 z-20 rounded-full bg-white/90 text-gray-700 border border-gray-300 px-3 py-1 text-xs hover:bg-white disabled:opacity-50"
              >
                Refresh
              </button>

              {/* Konten area: foto > video > placeholder */}
              {photoUrl ? (
                // Foto sudah mirror dari canvas, jadi TIDAK perlu transform lagi
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Captured" className="h-full w-full object-contain" />
              ) : cameraOn ? (
                // Live preview kamera mirror biar enak selfie
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover transform scale-x-[-1]"
                  playsInline
                  muted
                />
              ) : (
                <div className="h-full w-full grid place-content-center text-gray-400 text-sm">
                  Kamera dimatikan
                </div>
              )}
            </div>

            {/* Tombol kamera */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Kiri: Ambil Gambar -> Ambil Ulang */}
              {photoUrl ? (
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="rounded-md bg-white text-gray-700 border border-gray-300 py-2 text-sm hover:bg-gray-50"
                >
                  Ambil Ulang
                </button>
              ) : (
                <button
                  type="button"
                  onClick={takePhoto}
                  disabled={!cameraOn}
                  className="rounded-md bg-white text-gray-700 border border-gray-300 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Ambil Gambar
                </button>
              )}

              {/* Kanan: Matikan/Nyalakan Kamera — disembunyikan saat sudah ada foto */}
              {!photoUrl &&
                (cameraOn ? (
                  <button
                    type="button"
                    onClick={turnOffCamera}
                    className="rounded-md bg-white text-gray-700 border border-gray-300 py-2 text-sm hover:bg-gray-50"
                  >
                    Matikan Kamera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={turnOnCamera}
                    className="rounded-md bg-white text-gray-700 border border-gray-300 py-2 text-sm hover:bg-gray-50"
                  >
                    Nyalakan Kamera
                  </button>
                ))}
            </div>

            {/* Canvas tersembunyi untuk capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* ============ KANAN: Info, Presensi, Lokasi + MAP ============ */}
          <div className="space-y-4">
            {/* Info + Presensi */}
            <div className="space-y-1">
              <div className="font-bold text-gray-900">Nama</div>
              <div className="text-gray-700">{displayName}</div>

              <div className="font-bold text-gray-900 pt-2">NPM</div>
              <div className="text-gray-700">{displayNim}</div>

              <div className="font-bold text-gray-900 pt-2">Presensi</div>
              <div className="flex items-center gap-2">
                {(["HADIR", "IZIN", "SAKIT"] as const).map((opt) => {
                  const active = status === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setStatus(opt)}
                      className={[
                        "text-[11px] px-2 py-0.5 rounded-sm border",
                        active
                          ? "bg-[#6658dd] text-white font-semibold border-blue-600"
                          : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300",
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lokasi + Map */}
            <div>
              <div className="font-bold text-gray-900">
                LOKASI : <span className="font-normal">{locLabel || "Ambil Lokasi Terkini"}</span>
              </div>

              <div className="mt-2 bg-[#eef2f5] border border-gray-200 rounded-md p-4">
                <div className="aspect-square lg:aspect-[3/1] w-full overflow-hidden rounded-md bg-white border border-gray-200">
                  {loc ? (
                    <iframe
                      title="live-map"
                      className="h-full w-full"
                      src={mapSrc}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="h-full w-full grid place-content-center text-gray-400 text-sm">
                      Map belum tersedia
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  {loc ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <div><span className="font-semibold">Lat:</span> {loc.lat.toFixed(6)}</div>
                      <div><span className="font-semibold">Lng:</span> {loc.lng.toFixed(6)}</div>
                      {typeof loc.acc === "number" && (
                        <div><span className="font-semibold">Akurasi:</span> ±{Math.round(loc.acc)} m</div>
                      )}
                    </div>
                  ) : (
                    <div>Koordinat belum diambil.</div>
                  )}
                </div>

                <div className="flex justify-center mt-3">
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={loadingLoc}
                    className="px-3 py-1 rounded-md bg-white text-gray-700 border border-gray-300 text-xs hover:bg-gray-50 disabled:opacity-60"
                  >
                    {loadingLoc ? "Mengambil..." : "Ambil Lokasi Terkini"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              "w-full rounded-md py-2 text-sm font-medium transition-colors",
              canSubmit
                ? "bg-[#6658dd] text-[#fff] hover:bg-[#5748c8]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed",
            ].join(" ")}
            title={!canSubmit ? "Lengkapi foto, presensi, dan lokasi terlebih dahulu" : "Kirim"}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <ConfirmModal
        open={confirmOpen}
        title="Apakah Anda Ingin Mengisi Presensi Hari ini?"
        description="Segala Perubahan Perubahan Akan Tersimpan!"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
      />
    </form>
  );
}
