// src/EndPage.jsx
import logo from './assets/react.svg'

export default function EndPage() {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="p-8 text-center">
          <div className="flex justify-center mt-10 p-10">
                    <a
                      className="flex items-center gap-2 px-4 py-2 my-2 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition"
                      type="button"
                      href="/"
                    >
                      <img src={logo} alt="React logo" className="h-5 w-5" />
                      <span>Intervue Poll</span>
                    </a>
                  </div>
          <h2 className="text-2xl font-bold mb-4 text-purple-700">The teacher has concluded the poll</h2>
          <p className="text-gray-600 mb-6">Thank you for your participation!</p>
          <a
            href="/"
            className="bg-purple-600 text-white px-6 py-2 m-10 rounded-lg font-semibold shadow hover:bg-purple-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
}
