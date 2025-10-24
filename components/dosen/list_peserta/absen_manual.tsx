"use client";

import React, { useEffect, useState } from "react";

/* ========= Types dari API ========= */
type PresensiStatus = "HADIR" | "IZIN" | "SAKIT" | null;

type DetailManual = {
  student: { name: string; nim: string };
  status: PresensiStatus;
  photoUrl: string | null;
  locationText: string | null;
  coords: { lat: number; lng: number } | null;
  dummy: boolean;
};

/* ========= Komponen Dinamis: fetch detail + aksi ========= */
export default function PresensiManualReview({
  sessionId,
  userId,
  onAnggapTidakHadir,
  onSelesai,
  onBack,
}: {
  sessionId: number;
  userId: number;
  onAnggapTidakHadir?: () => void;
  onSelesai?: () => void;
  onBack?: () => void;
}) {
  const [data, setData] = useState<DetailManual | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // fetch detail
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/attendance/manual/${sessionId}/${userId}`, { cache: "no-store" });
        const json: DetailManual = await res.json();
        if (!alive) return;
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [sessionId, userId]);

  const handleAnggapTidakHadir = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/attendance/manual/${sessionId}/${userId}/absent`, { method: "POST" });
      // aman walau non-JSON
      const ok = res.headers.get("content-type")?.includes("application/json")
        ? (await res.json())?.ok
        : res.ok;
      if (!ok) throw new Error("Gagal set absent");
      onAnggapTidakHadir?.();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan status tidak hadir.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelesai = () => onSelesai?.();
  const goBack = () => onBack?.();

  // guards
  const lat = typeof data?.coords?.lat === "number" ? data!.coords!.lat : null;
  const lng = typeof data?.coords?.lng === "number" ? data!.coords!.lng : null;
  const hasCoords = lat != null && lng != null;
  const mapSrc = hasCoords ? `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed` : "";

  if (loading) {
    return (
      <div className="w-full bg-white rounded-md p-4">
        <div className="text-gray-500">Memuat detail presensi…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full bg-white rounded-md p-4">
        <div className="text-red-600">Data tidak ditemukan.</div>
      </div>
    );
  }

  const StatusBadge = ({ value }: { value: Exclude<PresensiStatus, null> }) => {
    const base = "px-2 py-1 rounded-sm text-xs font-semibold inline-flex items-center gap-1";
    if (value === "HADIR") return <span className={`${base} bg-[#1ABC9C] text-white`}>✔ Hadir</span>;
    if (value === "IZIN")  return <span className={`${base} bg-[#6658DD] text-white`}>ℹ Izin</span>;
    return <span className={`${base} bg-[#999999] text-white`}>✚ Sakit</span>;
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#343a40]">Presensi Manual</h3>
        <button
          type="button"
          onClick={goBack}
          className="px-3 py-1.5 rounded-md bg-yellow-400 text-sm hover:bg-yellow-500 text-white"
        >
          Kembali
        </button>
      </div>

      <div className="w-full bg-white rounded-md p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* FOTO */}
          <div className="rounded-md bg-[#f3f6f8] p-3 h-fit">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt="Foto Presensi"
                className="w-full h-auto rounded-md object-cover aspect-video"
              />
            ) : (
              <div className="aspect-video w-full grid place-content-center text-gray-400">
                (Tidak ada foto)
              </div>
            )}
          </div>

          {/* DETAIL KANAN */}
          <div>
            <div className="mb-3">
              <div className="text-sm font-bold text-[#343a40]">Nama</div>
              <div className="text-[#111]">{data.student.name}</div>

              <div className="mt-2 text-sm font-bold text-[#343a40]">NPM</div>
              <div className="text-[#111]">{data.student.nim}</div>
            </div>

            <div className="mb-3">
              <div className="text-sm font-bold text-[#343a40]">Presensi</div>
              <div className="mt-1 flex items-center gap-2">
                {data.status ? <StatusBadge value={data.status} /> : <span className="text-xs text-gray-500">Belum ada</span>}
              </div>
            </div>

            <div className="mb-2">
              <span className="font-bold text-[#343a40]">LOKASI : </span>
              <span className="text-[#111]">{data.locationText ?? "(Tidak ada lokasi)"}</span>
            </div>

            <div className="mt-2 bg-[#eef2f5] border border-gray-200 rounded-md p-3">
              <div className="aspect-[3/1] w-full overflow-hidden rounded-md bg-white border border-gray-200">
                {hasCoords ? (
                  <iframe
                    title="map"
                    className="h-full w-full"
                    src={mapSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="h-full w-full grid place-content-center text-gray-400 text-sm">
                    Peta tidak tersedia
                  </div>
                )}
              </div>

              {hasCoords && (
                <div className="mt-2 text-xs text-[#6c757d]">
                  Lat: {lat!.toFixed(6)} &nbsp; Lng: {lng!.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleAnggapTidakHadir}
            disabled={submitting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-[#f1556c] text-white text-sm hover:brightness-95 disabled:opacity-60"
          >
            ✖ Anggap Tidak Hadir
          </button>
          <button
            type="button"
            onClick={handleSelesai}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-[#1ABC9C] text-white text-sm hover:brightness-95"
          >
            ✓ Selesai
          </button>
        </div>
      </div>
    </>
  );
}
