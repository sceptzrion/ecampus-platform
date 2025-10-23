"use client";

import React from "react";

/* ========= Types ========= */
type PresensiStatus = "HADIR" | "IZIN" | "SAKIT";

type StudentLite = { id: string; name: string; nim: string } | null;

/* ========= Dummy data (contoh) ========= */
const DUMMY = {
  student: {
    name: "Muhamad Ikhsan Rizqi Yanuar",
    nim: "22106311701011",
  },
  photoUrl:
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=960&auto=format&fit=crop",
  status: "HADIR" as PresensiStatus,
  locationText:
    "Jl. H.S. Ronggowaluyo Kel. Puseurjaya Kec. Telukjambe Timur Kab. Karawang Prov. Jawa Barat",
  coords: { lat: -6.35536, lng: 107.296465 },
};

/* ========= Small UI helpers ========= */
function StatusBadge({ value }: { value: PresensiStatus }) {
  const base =
    "px-2 py-1 rounded-sm text-xs font-semibold inline-flex items-center gap-1";
  if (value === "HADIR") return <span className={`${base} bg-[#1ABC9C] text-white`}>✔ Hadir</span>;
  if (value === "IZIN") return <span className={`${base} bg-[#6658DD] text-white`}>ℹ Izin</span>;
  return <span className={`${base} bg-[#999999] text-white`}>✚ Sakit</span>;
}

/* ========= Komponen Review Dosen ========= */
export default function PresensiManualReview({
  data = DUMMY,
  onAnggapTidakHadir,
  onSelesai,
  onBack, // 👈 tambahan: handler dari parent
}: {
  data?: typeof DUMMY;
  onAnggapTidakHadir?: () => void;
  onSelesai?: () => void;
  student?: StudentLite;
  onBack?: () => void; // 👈 parent bisa ganti state/komponen
  onSubmitSuccess?: () => void;          // opsional: callback setelah simpan
}) {
  const mapSrc = data.coords
    ? `https://www.google.com/maps?q=${data.coords.lat},${data.coords.lng}&z=16&output=embed`
    : "";

  const handleAnggapTidakHadir = () => {
    console.log("Anggap Tidak Hadir:", data.student);
    onAnggapTidakHadir?.();
  };

  const handleSelesai = () => {
    console.log("Selesai (approve):", data.student);
    onSelesai?.();
  };

  const goBack = () => {
    if (onBack) onBack(); // 👈 panggil handler parent
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.photoUrl}
              alt="Foto Presensi"
              className="w-full h-auto rounded-md object-cover aspect-video"
            />
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
                <StatusBadge value={data.status} />
              </div>
            </div>

            <div className="mb-2">
              <span className="font-bold text-[#343a40]">LOKASI : </span>
              <span className="text-[#111]">{data.locationText}</span>
            </div>

            <div className="mt-2 bg-[#eef2f5] border border-gray-200 rounded-md p-3">
              <div className="aspect-[3/1] w-full overflow-hidden rounded-md bg-white border border-gray-200">
                {data.coords ? (
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

              {data.coords && (
                <div className="mt-2 text-xs text-[#6c757d]">
                  Lat: {data.coords.lat.toFixed(6)} &nbsp; Lng:{" "}
                  {data.coords.lng.toFixed(6)}
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
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-[#f1556c] text-white text-sm hover:brightness-95"
          >
            ✖ Anggap Tidak Hadir
          </button>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-[#1ABC9C] text-white text-sm hover:brightness-95"
          >
            ✓ Selesai
          </button>
        </div>
      </div>
    </>
  );
}
