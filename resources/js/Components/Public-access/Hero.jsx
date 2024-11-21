import React from 'react';
import PrimaryButton from '../PrimaryButton';
import { Head, Link } from '@inertiajs/react';

const Hero = () => {
  return (
    <div
      className="w-full min-h-screen bg-black text-white flex items-center justify-center"
      style={{
        backgroundImage: "url('/images/Background(Home).png')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
      }}
    >
      <div className="text-center text-[32px] sm:text-[55px] font-semibold">
        {/* Welcome to text with animation */}
        <h1 className="inline-block welcome-to text-white mr-2">
          Welcome to{' '}
        </h1>

        {/* DANUMA with separate animation */}
        <h1 className="inline-block danuma text-[#FC9C02]">
          DANUMA
        </h1>

        {/* Institute text with animation */}
        <h2 className="mt-[-10px] institute text-white">
          Institute
        </h2>

        {/* Login Button with animation */}
        <PrimaryButton
          className="mt-5 sm:mt-10 sm:w-40 font-bold text-lg lg:text-xl md:text-xl py-2 px-4 rounded-xl shadow-[0_0_5px_#FC9C02] hover:shadow-[0_0_10px_#FC9C02,0_0_20px_#FC9C02] login-button"
          style={{
            backgroundColor: '#FC9C02',
            borderColor: '#FC9C02',
          }}
        >
          <Link
            href={route('login')}
            className="w-full flex justify-center items-center"
          >
            Login
          </Link>
        </PrimaryButton>

        <br />
        <Link
          href={route('register')}
          className="text-[16px] sm:text-[20px] mt-4 block"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default Hero;
