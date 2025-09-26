"use client"

import Image from "next/image";
import Link from "next/link";

const Navlink = () => {
  return (
    <>
        <ul className="flex text-[#6C757D] text-[14px] leading-1.5 font-normal">
            <li className="text-[14px] px-[15px] flex flex-row gap-1 items-center">
                <Link href="#" className="flex flex-row gap-1 items-center">
                    <Image src="/calender.png" alt="calender" width={18} height={18}/>
                    <span>2025/2026 Ganjil</span>
                </Link>
            </li>
            <li className="text-[14px] px-[15px] flex items-center">
                <Link href="#" className="flex flex-row gap-1 items-center">
                    <Image src="/id.png" alt="bahasa" width={23.81} height={16}/>
                    <span>id</span>
                </Link>
            </li>
            <li className="text-[14px] px-[15px] flex items-center">
                <Link href="#" className="flex flex-row gap-1 items-center">
                    <Image src="/lock.png" alt="prodi" width={15} height={15}/>
                    <span>Mahasiswa (IF)</span>
                </Link>
            </li>
            <li className="text-[14px] px-[15px] flex items-center">
                <Link href="#" className="flex flex-row gap-1 items-center">
                    <Image className="rounded-full" src="/pas_foto.jpg" alt="foto" width={32} height={32}/>
                    <span>MUHAMAD IKHSAN RIZQI YANUAR</span>
                    <Image src="/dropdown.png" alt="dropdown" width={10} height={10}/>
                </Link>
            </li>
        </ul>
    </>
  )
}

export default Navlink