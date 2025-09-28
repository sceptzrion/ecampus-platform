import Image from "next/image"
import Navlink from "@/components/navbar/navlink"

const Navbar = () => {
  return (
    <div className="fixed top-0 z-[9999] w-full bg-white">
        <div className="flex items-center justify-between pr-2 h-18">
            <div className="flex flex-row h-auto">
                <p className="flex w-[240px] gap-1 text-[14px] justify-center items-center flex-row text-[#7669E0]">
                    <Image src="/logo_usk.png" alt="logo" width={28.73} height={35} priority/>
                    SISKA
                </p>
                <div className="px-4 items-center flex">
                    <Image src="/burger_menu.png" alt="menu" width={24} height={24} />
                </div>
            </div>
            <Navlink />
        </div>
    </div>
  )
}

export default Navbar