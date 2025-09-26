import Image from "next/image"
import Sidelink from "@/components/sidebar/sidelink"

const Sidebar = () => {
  return (
    <div className="fixed w-[240px] h-full mt-[70px] py-5 bg-white">
        <Sidelink />
    </div>
  )
}

export default Sidebar