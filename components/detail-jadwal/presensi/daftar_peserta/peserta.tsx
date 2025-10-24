"use client";

import React from "react";
import Image from "next/image";
import Table, { Session, Student } from "@/components/detail-jadwal/presensi/presensi_table";

export default function Peserta({
  sessions,
  students,
  currentUserNim,
  onManual,
}: {
  sessions: Session[];
  students: Student[];
  currentUserNim: string;
  onManual?: (s: { id: string; name: string; nim: string }) => void;
}) {
  return (
    <div className="max-w-full bg-white">
      <div className="flex flex-col p-6 bg-white rounded-sm gap-3">
        <div className="flex flex-row items-center gap-2.5 bg-[#F3F7F9] p-3 mb-2 text-[15px] font-bold">
          <Image src="/peserta.png" alt="Peserta" width={13} height={15} />
          <p>PESERTA</p>
        </div>

        <div className="flex flex-row gap-1">
          <a className="flex flex-row gap-1.5 text-white items-center bg-[#6658DD] hover:bg-[#4d41c6] py-2 px-3.5 rounded-sm">
            <Image src="/print.png" alt="Print" width={14} height={16} />
            <p className="text-sm font-medium">Cetak DHD</p>
          </a>
          <a className="flex flex-row gap-1.5 text-white items-center bg-[#1ABC9C] hover:bg-[#169b7e] py-2 px-3.5 rounded-sm">
            <Image src="/print.png" alt="Print" width={14} height={16} />
            <p className="text-sm font-medium">Cetak DHM</p>
          </a>
        </div>

        <div className="w-full overflow-x-auto">
          <Table
            sessions={sessions}
            students={students}
            currentUserNim={currentUserNim}
            onManual={onManual}
          />
        </div>
      </div>
    </div>
  );
}
