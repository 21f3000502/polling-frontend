import { useState } from "react";
import { socket } from "./socket";
import { getSessionId } from "./session";
import logo from './assets/react.svg'

export default function StudentRegister({ onRegistered }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    const sessionId = getSessionId();
    socket.emit("register_student", { name, sessionId });

    socket.once("student_registered", ({ name }) => {
      setLoading(false);
      onRegistered(name);
    });
    socket.once("kicked_out", () => {
      setLoading(false);
      window.location.href = "/kicked";
    });
    socket.once("error", (msg) => {
      setLoading(false);
      setError(msg);
    });
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="p-6  text-center">
          <div className="flex justify-center m-10">
                  <a
                    className="flex items-center gap-2 px-4 py-2 my-2 bg-violet-600 text-white rounded-full shadow hover:bg-violet-700 transition"
                    type="button"
                    href="/"
                  >
                    <img src={logo} alt="React logo" className="h-5 w-5" />
                    <span>Intervue Poll</span>
                  </a>
                </div>
        
        <h1 className="text-3xl font-semibold mb-2">
          Let&apos;s <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-500 my-4 w-2/3 mx-auto text-center">
          If you&apos;re a student, you&apos;ll be able to{" "}
          <span className="font-semibold text-gray-700">
            submit your answers
          </span>
          , participate in live polls, and see how your responses compare with your classmates
        </p>
        <form onSubmit={handleRegister}>
          <div className="mb-6 text-center">
            <label htmlFor="name" className="block px-5 text-gray-700 mb-2 font-medium">
              Enter your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="off"
              placeholder="Your Name"
              onChange={e => setName(e.target.value)}
              className="w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition-colors"
          >
            {loading ? "Joining..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
