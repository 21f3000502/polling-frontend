import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/react.svg"

export default function HomePage() {
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role === "teacher") navigate("/teacher/create");
    else navigate("/student");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2">
        <div className="flex justify-center mt-10">
          <a
            className="flex items-center gap-2 px-4 py-2 my-2 bg-violet-600 text-white rounded-full shadow hover:bg-violet-700 transition"
            type="button"
            href="/"
          >
            <img src={logo} alt="React logo" className="h-5 w-5" />
            <span>Intervue Poll</span>
          </a>
        </div>

      </div>
      <div className="flex flex-col items-center w-full">
        <h1 className="text-3xl md:text-4xl font-semibold mt-20 mb-2 text-center">
          Welcome to the <span className="font-bold">Live Polling System</span>
        </h1>
        <p className="text-gray-500 mb-8 text-center">
          Please select the role that best describes you to begin using the live polling system
        </p>
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div
            className={`border-2 rounded-lg px-8 py-6 w-72 cursor-pointer shadow-md hover:shadow-lg transition ${role === "student" ? "border-purple-500" : "border-gray-200"
              }`}
            onClick={() => setRole("student")}
          >
            <div className="font-semibold text-lg mb-2">I'm a Student</div>
            <div className="text-gray-500 text-sm">
              Submit your answers and see live poll results instantly.            </div>
          </div>
          <div
            className={`border-2 rounded-lg px-8 py-6 w-72 cursor-pointer shadow-md hover:shadow-lg transition ${role === "teacher" ? "border-purple-500" : "border-gray-200"
              }`}
            onClick={() => setRole("teacher")}
          >
            <div className="font-semibold text-lg mb-2">I'm a Teacher</div>
            <div className="text-gray-500 text-sm">
              Submit answers and view live poll results in real-time.
            </div>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-12 py-3 rounded-full font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
