import logo from '../assets/k2e-logo.png';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-700">
      <img src={logo} alt="Key2Enable Logo" className="w-56 mb-6 drop-shadow-md" />
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 bg-lime-500 rounded-full animate-bounce" />
      </div>
      <p className="mt-4 text-sm font-medium">Empowering every learner… Just a moment!</p>
    </div>
  );
}