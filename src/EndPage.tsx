// src/EndPage.jsx
export default function EndPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Session Ended</h2>
        <p className="text-gray-600 mb-6">
          The poll session has ended. Thank you for participating!
        </p>
        <a
          href="/"
          className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-purple-700 transition"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}
