import { useEffect, useState } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";

export default function PollHistory() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get_poll_history");
    socket.on("poll_history", setHistory);
    return () => socket.off("poll_history");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16">
      <button
        className="mb-8 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-purple-200 transition"
        onClick={() => navigate("/teacher/results")}
      >
        Back to Results
      </button>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-6">Poll History</h1>
        {history.length === 0 ? (
          <div className="text-gray-500">No polls yet.</div>
        ) : (
          <div className="space-y-8">
            {history.map((poll, idx) => (
              <div key={idx} className="border-b pb-6">
                <div className="font-bold mb-2">{poll.question}</div>
                <ul>
                  {poll.options.map((opt, i) => (
                    <li key={i} className="flex items-center mb-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          poll.correctIndex === i
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></span>
                      <span>{opt}</span>
                      <span className="ml-auto font-mono text-gray-600">
                        {poll.votes && poll.votes[i] ? poll.votes[i] : 0} votes
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
