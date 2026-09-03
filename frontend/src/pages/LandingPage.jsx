// Description: Landing page component for Key2Enable, featuring a welcoming message and a call-to-action button.
import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '../assets/k2e-logo.png';

function Landing() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (isSignedIn) {
      navigate('/student/dashboard'); // or teacher route
    } else {
      navigate('/dashboard'); // fallback route
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-tr from-[#e0f2fe] via-white to-[#f0f9ff]">
      <img
        src={logo}
        alt="Key2Enable"
        className="w-44 md:w-52 mb-6 drop-shadow-sm"
      />

      <h1 className="text-4xl md:text-5xl font-extrabold text-[#0072e5] mb-4 tracking-tight">
        Empowering Every Learner
      </h1>

      <p className="text-lg text-gray-700 max-w-xl mb-8 leading-relaxed">
        Welcome to Key2Enable's dashboard. Supporting inclusive learning through technology, one step at a time.
      </p>

      <Button
        onClick={handleStart}
        className="bg-gradient-to-r from-[#0072e5] via-[#339CFF] to-[#66c7ff] text-white px-6 py-3 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
      >
        Get Started
      </Button>
    </div>
  );
}

export default Landing;
