import { useState } from "react";
import { socket } from "./socket";
import { getSessionId } from "./session";

export default function StudentRegister({ onRegistered }) {
  const [name, setName] = useState("Rahul Bajaj");
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
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <span className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
            Interview Poll
          </span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">
          Let&apos;s <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-500 mb-8">
          If you&apos;re a student, you&apos;ll be able to{" "}
          <span className="font-semibold text-gray-700">
            submit your answers
          </span>
          , participate in live polls, and see how your responses compare with your classmates
        </p>
        <form onSubmit={handleRegister}>
          <div className="mb-6 text-left">
            <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
              Enter your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="off"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition-colors"
          >
            {loading ? "Joining..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
