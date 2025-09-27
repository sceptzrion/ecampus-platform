import React from 'react'
import type { Metadata } from "next";
import LoginForm from '@/components/login/login_form';
import LoginGoogle from '@/components/login/login_google';

export const metadata: Metadata = {
  title: "Login"
};

export const LoginPage = () => {
  return (
    <>
      <h4 className='text-center mt-6 mb-9 text-[#98A6AD] text-sm'>
        Masukan email dan password Anda.
      </h4>
      <LoginForm />
      <div className="flex flex-col gap-4 mt-4.5 items-center text-sm">
        <LoginGoogle />
        <a href="#" className='text-[#6558DD] mt-3'>Lupa Password</a>
      </div>
    </>
    
  )
}

export default LoginPage