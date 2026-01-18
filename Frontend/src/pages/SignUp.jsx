import React from "react";
import { FcGoogle } from "react-icons/fc";
import backgroundImage from "../assets/Gemini_Generated_Image_txo4w7txo4w7txo4.png";
const SignUp = () => {
  return (
    <>
      <main
        className="w-screen h-screen bg-cover bg-center bg-no-repeat flex justify-center items-center opacity-60"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="wrapper w-90 md:w-100 lg:w-1/2  lg:h-[70%] border-4 border-red-800 rounded-2xl bg-white  ">
          <p className="text-4xl p-5 text-center rounded-t-xl  text-white bg-linear-to-br from-red-600/80 via-red-700/80 to-red-500/8b0  ">
            Create an Account
          </p>
          <section className="InputFields  px-4.5   ">
            <form action="" className="flex flex-col gap-4">
              <div className="fullname w-full flex justify-between mt-10 gap-3">
                <input
                  type="text"
                  placeholder="FirstName"
                  className="w-1/2 h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
                />
                <input
                  type="text"
                  placeholder="LastName"
                  className="w-1/2 h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="w-full h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
              />
              <input
                type="number"
                placeholder="Mobile"
                className="w-full h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
              />
              <input
                type="text"
                placeholder="PassWord"
                className="w-full h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
              />
              <button className="text-black shadow-lg bg-sky-500 hover:bg-sky-700 hover:text-black">
                Sign Up
              </button>
            </form>
          </section>
          <hr />
          <span>or</span>
          <button>
            <FcGoogle size="20" display="inline" />
            <span className="w-50 h-30 bg-white text-black rounded-xl  ">
              Continue with Google
            </span>
          </button>
        </div>
      </main>
    </>
  );
};

export default SignUp;
