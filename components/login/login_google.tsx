"use client"

import React from 'react'
import Image from 'next/image';

const LoginGoogle = () => {
  return (
    <>
        <p className='text-[#6C757D]'>atau</p>
        <a href="#" className='flex flex-row text-white font-bold h-[37px] w-[205px] justify-center items-center g-3 bg-[#F1556C] hover:bg-[#cd485c] rounded-sm'>
            <Image src="/google.png" alt="google" width={20} height={10} className='mr-2'/>
                Masuk dengan Google
        </a>
    </>
  )
}

export default LoginGoogle