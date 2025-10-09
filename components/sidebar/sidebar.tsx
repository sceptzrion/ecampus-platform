import Image from "next/image"
import Sidelink from "@/components/sidebar/sidelink"

const Sidebar = () => {
  return (
    <div className="w-[240px] h-auto min-h-screen mt-[70px] py-5 bg-white">
        <Sidelink />
    </div>
  )
}

export default Sidebar