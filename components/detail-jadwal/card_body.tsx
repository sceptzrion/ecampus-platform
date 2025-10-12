import React from "react";

type CardItem = {
  label: string;
  value: string;
};

const leftCard: CardItem[] = [
  { label: "Kode Jadwal", value: "2515520028" },
  { label: "Mata Kuliah", value: "CAPSTONE PROJECT (FIK61575)" },
  { label: "Kelas", value: "251-7A-22" },
];

const rightCard: CardItem[] = [
  { label: "Dosen", value: "Sofi Defiyanti, S.Kom., M.Kom" },
  { label: "Ruang dan Waktu", value: "FASILKOM 4.79-5, Senin 07:30 - 10:00" },
  { label: "Pertemuan Terlaksana", value: "7 Kali" },
];

const CardSection = ({ items }: { items: CardItem[] }) => (
  <div className="bg-white p-6 flex flex-col gap-4 border-t-2 border-cyan-500 rounded-t-md">
    {items.map((item, idx) => (
      <div
        key={idx}
        className={`flex flex-col gap-2.5 ${idx === items.length - 1 ? "mb-3" : ""}`}
      >
        <h2 className="text-[#343A40] text-[15px] font-bold">{item.label}</h2>
        <p className="text-[#6c757d] text-sm">{item.value}</p>
      </div>
    ))}
  </div>
);

const CardBody = () => {
  return (
    <div className="grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-6">
      <CardSection items={leftCard} />
      <CardSection items={rightCard} />
    </div>
  );
};

export default CardBody;
