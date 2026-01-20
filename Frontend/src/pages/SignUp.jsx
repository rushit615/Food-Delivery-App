import React, { useState, useEffect,useRef } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../firebase";
import { FcGoogle } from "react-icons/fc";
import backgroundImage from "../assets/Gemini_Generated_Image_txo4w7txo4w7txo4.png";
import { useFetcher } from "react-router-dom";

const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // 1. SETUP RECAPTCHA ON LOAD
  useEffect(() => {
    // 1. Clean up any existing verifier to prevent "Duplicate" error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    // Only create the verifier if it doesn't exist yet
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved, you can enable the button here if needed
          },
          "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
          },
        },
      );
    }
  }, [auth]);

  const onSignUp = async (e) => {
    e.preventDefault();

    // Validate mobile number exists
    if (!mobile || mobile.length < 10) {
      alert("Please enter a valid mobile number");
      return;
    }

    const appVerifier = window.recaptchaVerifier;
    const formMobile = "+91" + mobile;

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        formMobile,
        appVerifier,
      );
      setConfirmationResult(confirmation);
      setStep(2); // Move to OTP screen
      alert("OTP Sent!");
    } catch (error) {
      console.error("SMS Error:", error);
      alert("Failed to send OTP. Check console for details.");
    }
  };

  // 2. MOVED THIS FUNCTION OUTSIDE (It was trapped inside onSignUp)
  const onVerifyOtp = async (e) => {
    e.preventDefault(); // Good practice to prevent any default form actions
    try {
      console.log(otp);
      // A. Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      // B. Get the Token
      const idToken = await result.user.getIdToken();

      // C. Send to Backend
      console.log("fetch-post-start");
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: { firstName: firstName, lastName: lastName },
          email: email,
          password: password,
          mobile: mobile,
          role: role,
          verificationToken: idToken,
        }),
      });
      console.log("fetch-post-end");

      const data = await res.json();
      if (res.ok) {
        alert("Account Created Successfully!");
      } else {
        // 1. Check if it's an express-validator array
        if (data.errors && Array.isArray(data.errors)) {
          // This grabs the message from the FIRST error in the array
          const firstError = data.errors[0].msg;
          alert(firstError);

          // Optional: Log all errors to console for debugging
          console.log("Validation Errors:", data.errors);
        }
        // 2. Check if it's a manual server error (e.g. "User already exists")
        else if (data.message) {
          alert(data.message);
        }
        // 3. Fallback for unknown errors
        else {
          alert("An unknown error occurred.");
          console.log(data); // See what the backend actually sent
        }
      }
    } catch (error) {
      console.error("hiiiiiii");
      alert("Invalid OTP");
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setOtpTimer((prev) => {
        if(prev<=0){
          clearInterval(interval);
          return 0
        }
        return prev - 1});
      
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);
  const [ootp, setOotp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  // Handle typing inside the boxes
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...ootp];
    // Take the last character entered (ensures only 1 digit)
    newOtp[index] = value.substring(value.length - 1);
    setOotp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace and Arrow keys
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !ootp[index] && index > 0 && inputRefs.current[index - 1]) {
      // If current box is empty, move back and delete previous
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle Pasting (e.g., user pastes "123456")
  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").split("");
    if (data.length === 6) {
      setOtp(data);
      inputRefs.current[5].focus(); // Focus last box
    }
  };

  return (
    <>
      {/* 3. ADDED THE INVISIBLE RECAPTCHA CONTAINER HERE */}
      <div id="recaptcha-container"></div>

      {
        /*step === 1 ? (<>
        
        <main  className="w-screen h-screen bg-cover bg-center bg-no-repeat flex justify-center items-center absolute z-0 opacity-40"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></main>
        <main 
          className="w-screen h-screen bg-cover bg-center bg-no-repeat  flex justify-center items-center z-1 opacity-100 "
         
        >
          <div className="wrapper w-90 md:w-100 lg:w-[40%] lg:h-[83%] pb-10 border-4 border-red-800 rounded-2xl bg-gray-100 f absolute shadow-red-200 shadow-xl  "
          style={{border:`1px solid ${borderColor}`}}>
            <p className="text-4xl p-5 text-center rounded-t-xl text-white bg-linear-to-br from-red-600/80 via-red-700/80 to-red-500/80 "
          
            >
              Create an Account
            </p>
            <section className="InputFields px-10 ml-6.5 w-[90%] ">
              <form onSubmit={onSignUp} className="flex flex-col gap-5">
                <div className="fullname w-full flex justify-between mt-10 gap-3">
                
                  <input
                    type="text"
                    name="firstName" 
                    placeholder="FirstName"
                    onChange={(e)=>{setFirstName(e.target.value)}}
                    className="w-1/2 h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="LastName"
                    onChange={(e)=>{setLastName(e.target.value)}}
                    className="w-1/2 h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={(e)=>{setEmail(e.target.value)}}
                  className="w-full h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
                />
                <input
                  type="number"
                  name="mobile"
                  placeholder="Mobile"
                  onChange={(e)=>{setMobile(e.target.value)}}
                  className="w-full h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
                />
                <input
                  type="text" // Changed from text to password for security
                  name="password"
                  placeholder="PassWord"
                  onChange={(e)=>{setPassword(e.target.value)}}
                  className="w-full h-10 outline-red-500 outline-2 rounded pl-3 hover:outline-red-900 focus:outline-red-900"
                />
                <div className="rolebtns flex justify-between ">
                <button className="bg-red-400 p-2 w-[30%] rounded-2xl text-white tracking-wide hover:bg-red-500 ease-in-out duration-300 focus:bg-red-500 active:scale-97  " onClick={(e)=>{setRole(e.target.value)}} type="button" value="user">User</button>
                <button className="bg-red-400 p-2 w-[30%] rounded-2xl text-white tracking-wide hover:bg-red-500 ease-in-out duration-300 focus:bg-red-500 active:scale-97  "onClick={(e)=>{setRole(e.target.value)} } type="button" value='owner' >Owner</button>
                <button className="bg-red-400 p-2 w-[30%] rounded-2xl text-white tracking-wide hover:bg-red-500 ease-in-out duration-300 focus:bg-red-500 active:scale-97   " onClick={(e)=>{setRole(e.target.value)} } type="button" value='deliveryBoy' >Delivery Boy</button>
                
                
                
                </div>



                <button className=" mb-3 bg-linear-to-br from-red-600/80 via-red-700/80 to-red-500/80 rounded-xl w-full px-2 h-13  text-white text-xl hover:bg-red-500 ease-in-out duration-300 focus:bg-red-500 
                  
active:scale-97 hover:shadow-xl hover:shadow-red-200
                ">
                  Sign Up
                </button>
              </form>
            </section>
            <div className="or flex items-center gap-10 opacity-50 justify-center">
            <hr className="w-40" />
            <span className="text-xl ">or</span>
            <hr className="w-40" /></div>
            <button className="flex bg-cyan-500  w-[80%] h-15 text-xl tracking-wide text-red-100 rounded items-center justify-center ml-15  mt-3">
              <FcGoogle size="35" display="inline" className="mr-2" />
              
                Continue with Google
              
            </button>
          </div>
        </main></>
      ) : */ <section className="relative">
          <section
            className="w-screen h-screen bg-cover bg-center bg-no-repeat  opacity-40"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          ></section>
          <div className="otpVerifcation w-[40%] h-[40%] rounded-xl bg-gray-100 border-2 border-gray-300 flex flex-col  items-center justify-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] ">
            <div className="flex flex-col items-center justify-center space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Verify Number</h2>
        <p className="text-sm text-gray-500 mt-2">
          Enter the 6-digit code sent to your SMS.
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        {ootp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center text-xl font-bold text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        ))}
      </div>

      <button
        onClick={() => alert(`Verifying Code: ${otp.join("")}`)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        Verify Account
      </button>
      
      <p className="text-xs text-gray-400 cursor-pointer hover:text-blue-500 text-center">
        Resend Code
      </p>
    </div>
          </div>
        </section>
      }
    </>
  );
};

export default SignUp;
