import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans">
      <div className="text-center max-w-2xl px-6">
        <div className="w-12 h-12 bg-blue-700 rounded-md mx-auto mb-6 flex items-center justify-center">
          <div className="w-3 h-8 bg-white rounded-sm"></div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Quantan Intelligence Terminal
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          The elite AI-powered equity research analyst.
        </p>
        <Link 
          href="/login"
          className="inline-block bg-gray-900 text-white font-semibold px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
