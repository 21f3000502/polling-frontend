// src/StudentPage.jsx

import { useState, useEffect } from "react";
import { socket } from "./socket";
import { getSessionId } from "./session";
import StudentChatPanel from "./StudentChatPanel.jsx";
import StudentRegister from "./StudentRegister";
import { useNavigate } from "react-router-dom";

export default function StudentPage() {
  const [registered, setRegistered] = useState(false);
  const [name, setName] = useState("");
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  // Registration logic
  const handleRegistered = (studentName) => {
    setName(studentName);
    setRegistered(true);
  };

  // Poll and chat logic
  useEffect(() => {
    socket.on("new_poll", (data) => {
      setPoll(data);
      setSelected(null);
      setVoted(false);
      setResults(null);
      setShowResults(false);
      setTimer(data.timer || 60);
    });

    socket.on("poll_results", ({ votes }) => setResults(votes));

    socket.on("poll_ended", () => {
      setTimer(0);
      setShowResults(true);
    });

    socket.on("kicked_out", () => {
      window.location.href = "/kicked";
    });

    socket.on("session_closed", () => {
      navigate("/end");
    });

    return () => {
      socket.off("new_poll");
      socket.off("poll_results");
      socket.off("poll_ended");
      socket.off("kicked_out");
      socket.off("session_closed");
    };
  }, [navigate]);

  // Timer countdown
  useEffect(() => {
    if (!poll || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [poll, timer]);

  // Submit answer
  const handleVote = () => {
    if (selected === null || !poll) return;
    socket.emit("submit_answer", {
      pollId: poll.id,
      optionIndex: selected,
      sessionId: getSessionId()
    });
    setVoted(true);
    // Do not setShowResults(true) here; wait for poll_ended event
  };

  // Registration screen
  if (!registered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <StudentRegister onRegistered={handleRegistered} />
        <div className="mt-4 text-gray-600 text-sm">
          You can chat with others while you wait.
        </div>
      </div>
    );
  }

  // Waiting for poll
  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold mb-4">Waiting for the teacher to start a poll...</div>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded shadow"
          onClick={() => setChatOpen(true)}
        >
          Open Chat
        </button>
        <StudentChatPanel visible={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    );
  }

  // Timer display
  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  // Results display
  const totalVotes = results ? results.reduce((a, b) => a + b, 0) : 0;
  const votePercents = results
    ? results.map((v) => (totalVotes ? Math.round((v / totalVotes) * 100) : 0))
    : [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">
            {minutes}:{seconds} {timer > 0 ? "Time left" : ""}
          </div>
          <button
            className="bg-purple-600 text-white px-3 py-1 rounded"
            onClick={() => setChatOpen(true)}
          >
            Message
          </button>
        </div>
        <div className="mb-2 text-gray-700 font-medium">Question</div>
        <div className="mb-4 text-xl font-bold">{poll.question}</div>
        {!showResults ? (
          <div>
            <div className="mb-4">
              {poll.options.map((opt, i) => (
                <label
                  key={i}
                  className={`block p-2 rounded border mb-2 cursor-pointer ${
                    selected === i
                      ? "border-purple-600 bg-purple-100"
                      : "border-gray-300"
                  } ${voted ? "opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="option"
                    value={i}
                    checked={selected === i}
                    disabled={voted}
                    onChange={() => setSelected(i)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
            <button
              className={`bg-purple-600 text-white px-4 py-2 rounded ${
                voted || selected === null ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={voted || selected === null}
              onClick={handleVote}
            >
              {voted ? "Answer Submitted" : "Submit Answer"}
            </button>
            {voted && (
              <div className="mt-2 text-gray-500 text-sm">
                Waiting for poll to end...
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-2 text-gray-700 font-medium">Results</div>
            {poll.options.map((opt, i) => (
              <div key={i} className="flex items-center mb-2">
                <div className="w-2/3">{opt}</div>
                <div className="w-1/3 text-right">
                  {results ? results[i] : 0} vote(s){" "}
                  {votePercents[i] !== undefined ? `(${votePercents[i]}%)` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <StudentChatPanel visible={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
