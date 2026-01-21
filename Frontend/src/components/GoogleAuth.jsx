// frontend/components/GoogleLoginButton.jsx
import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; 
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ mobile, role, serverUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    // Validation: Ensure prerequisites for registration are met
    if (!mobile) {
      setError("Mobile number is required to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. OAuth Interaction
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // 2. Token Extraction
      // Crucial: Get the JWT ID token to send to the backend
      const idToken = await result.user.getIdToken();

      // 3. API Handshake
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          token: idToken,
          role,
          mobile
        },
        { withCredentials: true } // Essential for receiving the HttpOnly cookie
      );

      // 4. State Update
    
      navigate("/dashboard");

    } catch (err) {
      console.error("Auth Error:", err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled.");
      } else {
        setError(err.response?.data?.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className={`w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.64 2 12.2 2C6.7 2 2 6.5 2 12s4.7 10 10 10c4.1 0 7.75-2.58 9.35-7.9z" /></svg>
        )}
        {loading ? "Processing..." : "Continue with Google"}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};

export default GoogleLoginButton;