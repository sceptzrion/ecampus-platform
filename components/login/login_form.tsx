"use client"

import Image from 'next/image'

const LoginForm = () => {
  return (
    <form action="/dashboard/dashboard-akademik" className='flex flex-col gap-6 w-full'>
        <div className="flex flex-col gap-2">
            <label htmlFor="email" className='text-sm font-semibold text-[#6C757D]'>Email</label>
            <input type="email" id="email" placeholder='Masukan email Anda' className='border border-[#ced4da] rounded-sm px-3.5 py-1.75 text-sm text-[#6C757D] focus:outline-none' />
        </div>
        <div className="flex flex-col gap-2">
            <label htmlFor="password" className='text-sm font-semibold text-[#6C757D]'>Password</label>
            <div className="flex flex-row">
                <input type="password" id="password" placeholder='Masukan password Anda' className='border border-[#ced4da] rounded-l-sm px-3.5 py-1.75 text-sm text-[#6C757D] w-full focus:outline-none' />
                <div className="flex items-center px-3.5 bg-[#F7F7F7] border-b border-t border-r border-[#ced4da] rounded-r-sm">
                  <Image src="/password.png" alt="show password" width={18} height={18} className=''/>
                </div>
            </div>
        </div>
        <button type="submit" className=' text-[#6658dd] py-1.75 rounded-xs bg-[#e3e1f9] text-sm hover:text-white hover:bg-[#6658dd] hover:cursor-pointer'>Masuk</button>
    </form>
  )
}

export default LoginForm