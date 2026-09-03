import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '../assets/k2e-logo.png';
import useRegisterTeacher from '@/utils/useRegisterTeacher';

function RolePending() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useRegisterTeacher();
  const handleSignOut = () => {
    signOut(() => navigate('/'));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-tr from-[#e0f2fe] via-white to-[#f0f9ff]">
      <img
        src={logo}
        alt="Key2Enable"
        className="w-44 md:w-52 mb-6 drop-shadow-sm"
      />

      <h1 className="text-4xl md:text-5xl font-extrabold text-[#0072e5] mb-4 tracking-tight">
        Role Assignment Pending
      </h1>

      <p className="text-lg text-gray-700 max-w-xl mb-8 leading-relaxed">
        Your role is being assigned by an admin. Please come back and sign-in in 2 hours.
        
        If you think this is taking too long, please contact your administrator.
      </p>

      <Button
        onClick={handleSignOut}
        className="bg-gradient-to-r from-[#0072e5] via-[#339CFF] to-[#66c7ff] text-white px-6 py-3 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
      >
        Sign Out
      </Button>
    </div>
  );
}

export default RolePending;
