"use client";

import React from "react";

type NavButtonsProps = {
  active: string;
  onChange: (tab: string) => void;
};

const NavButtons = ({ active, onChange }: NavButtonsProps) => {
  const tabs = [
    { key: "rps", label: "RPS & Bahan Ajar", disabled: true },
    { key: "peserta", label: "Peserta", disabled: true },
    { key: "jurnal", label: "Jurnal Perkuliahan", disabled: true },
    { key: "presensi", label: "Presensi" },
    { key: "rekap", label: "Rekap Perkuliahan", disabled: true },
  ];

  return (
    <div className="flex w-full h-full p-6 bg-white text-sm font-semibold">
      <ul className="grid grid-rows-5 lg:grid-rows-1 lg:grid-cols-5 w-full gap-2.5">
        {tabs.map((tab) => (
          <li key={tab.key} className="flex items-center w-full h-auto">
            <button
              onClick={() => !tab.disabled && onChange(tab.key)}
              disabled={tab.disabled}
              className={`w-full h-full text-center py-2 rounded-sm transition-colors
                ${
                  tab.disabled
                    ? "bg-[#EDEFF1] text-[#6C757D] hover:bg-[#dfe3e6] disabled"
                    : active === tab.key
                    ? "bg-[#6658DE] text-white"
                    : "bg-[#EDEFF1] text-[#6C757D] hover:bg-[#dfe3e6]"
                }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavButtons;
