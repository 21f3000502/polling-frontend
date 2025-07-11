// src/TeacherPollResults.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket";

// Avatar utilities
function getSeed(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}
function randomColor(seed) {
  const colors = [
    "#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#a78bfa", "#f87171",
    "#facc15", "#38bdf8", "#f472b6", "#fcd34d", "#c084fc", "#fca5a5"
  ];
  return colors[seed % colors.length];
}
function randomFace(seed) {
  const eyes = [
    '<circle cx="9" cy="10" r="1" fill="#333"/><circle cx="15" cy="10" r="1" fill="#333"/>',
    '<ellipse cx="9" cy="10" rx="1" ry="1.5" fill="#333"/><ellipse cx="15" cy="10" rx="1" ry="1.5" fill="#333"/>',
    '<rect x="8.5" y="9.5" width="1" height="1" fill="#333"/><rect x="14.5" y="9.5" width="1" height="1" fill="#333"/>'
  ];
  const mouths = [
    '<path d="M9 15 Q12 18 15 15" stroke="#333" stroke-width="1.5" fill="none"/>',
    '<path d="M9 16 Q12 14 15 16" stroke="#333" stroke-width="1.5" fill="none"/>',
    '<ellipse cx="12" cy="15" rx="2" ry="1" fill="#333" />'
  ];
  let e = eyes[seed % eyes.length];
  let m = mouths[seed % mouths.length];
  return e + m;
}
function avatarSVG(name, size = 32) {
  const seed = getSeed(name);
  const color = randomColor(seed);
  const face = randomFace(seed);
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `<svg class="rounded-full flex-shrink-0" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="${color}"/>
          ${face}
        </svg>`
      }}
    />
  );
}

export default function TeacherPollResults() {
  const [poll, setPoll] = useState(null);
  const [votes, setVotes] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();
  const messagesPaneRef = useRef();

  // Redirect to create poll if no poll exists
  useEffect(() => {
    socket.emit("get_current_poll");
    socket.on("new_poll", (data) => {
      setPoll(data);
      setVotes(data.votes || Array(data.options.length).fill(0));
      setTimer(data.timer || 60);
      setTimerRunning(true);
      // setMessages([]);
    });
    socket.emit("get_participants");
    socket.on("participants", (list) => setParticipants(list));

    return () => {
      socket.off("new_poll");
      socket.off("participants");
    };
  }, []);

  // If poll is null after initial check, redirect to create poll
  useEffect(() => {
    if (poll === null) {
      const timeout = setTimeout(() => {
        navigate("/teacher/create");
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [poll, navigate]);

  // Socket.io event handlers for poll updates and chat
  useEffect(() => {
    socket.on("poll_results", ({ pollId, votes: newVotes }) => {
      setVotes(newVotes);
    });
    socket.on("poll_ended", () => {
      setTimer(0);
      setTimerRunning(false);
    });
    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        if (messagesPaneRef.current) {
          messagesPaneRef.current.scrollTop = messagesPaneRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => {
      socket.off("poll_results");
      socket.off("poll_ended");
      socket.off("chat_message");
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (!timerRunning || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  const totalVotes = votes.reduce((a, b) => a + b, 0) || 1;
  const votePercents = votes.map((v) => Math.round((v / totalVotes) * 100));

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit("chat_message", chatInput.trim());
    setChatInput("");
  };

  const handleKick = (sessionId) => {
    socket.emit("kick_participant", sessionId);
  };

  const handleAskNew = () => navigate("/teacher/create");
  const handleViewHistory = () => navigate("/teacher/history");

  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  // If poll is null, do not render anything (redirect handled above)
  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* Centered View Poll History */}
      <div className="flex max-w-xl pt-6 m-6 self-end ">
        <button
          className="flex items-center gap-2 bg-purple-200 text-purple-800 px-5 py-2 rounded-full font-medium shadow hover:bg-purple-300 transition w-full"
          onClick={handleViewHistory}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          View Poll history
        </button>
      </div>
      {/* Timer and Question label */}
      <div className="flex flex-row-reverse justify-between items-center w-full max-w-xl mb-2 mt-6">
        <span className="text-sm font-semibold text-red-500 flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
          {minutes}:{seconds}
        </span>
        <span className="text-lg font-semibold">Question</span>
      </div>
      {/* Question statement and options */}
      <div className="w-full max-w-xl flex flex-col bg-gray-100 rounded-2xl">
        <div className="font-medium text-white text-lg bg-gray-700 m-0 px-4 py-4 rounded-t-2xl">{poll.question}</div>
        <div className="rounded-md p-4 mb-4">
          {poll.options.map((opt, i) => {
            const isCorrect = poll.correctIndex === i;
            let barBg = "";
            let numBg = "";
            let txtColor = "text-gray-900";
            if (isCorrect) {
              barBg = "bg-green-400 text-white";
              numBg = "bg-green-600 text-white border-2 border-green-500";
            } else if (i === 0) {
              barBg = "bg-purple-400 text-white";
              numBg = "bg-purple-600 text-white";
            } else if (i === 1) {
              barBg = "bg-purple-400 text-white";
              numBg = "bg-purple-500 text-white";
            } else if (i === 2) {
              barBg = "bg-purple-400 text-white";
              numBg = "bg-purple-500 text-white";
            } else {
              barBg = "bg-purple-400 text-white";
              numBg = "bg-purple-500 text-white";
            }
            return (
              <div className="mb-4" key={i}>
                <div className={`relative w-full h-12 rounded-lg border flex items-center overflow-hidden ${isCorrect ? "border-green-400" : "border-purple-200"
                  }`}>
                  <div
                    className={`absolute left-0 top-0 h-full ${barBg} transition-all duration-500`}
                    style={{
                      width: `${votePercents[i]}%`,
                      zIndex: 0
                    }}
                  ></div>
                  <span
                    className={`flex items-center z-10 relative pl-4 font-semibold select-none ${txtColor}`}
                    style={{ minWidth: 0, whiteSpace: "nowrap" }}
                  >
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full mr-3 font-semibold ${numBg}`}>
                      {i + 1}
                    </span>
                    <span className="truncate">{opt}</span>
                  </span>
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 z-10 text-gray-800 font-bold text-xl select-none">
                    {votePercents[i]}%
                  </span>
                </div>
              </div>
            );
          })
          }
        </div>
      </div>
      {/* Ask a new question Button */}
      <div className="flex-row text-center justify-center mt-4 w-full max-w-xl">
        <button
          className={`bg-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow transition ${timer === 0 ? "hover:bg-purple-700" : "opacity-50 cursor-not-allowed"
            }`}
          onClick={timer === 0 ? handleAskNew : undefined}
          disabled={timer !== 0}
        >
          + Ask a new question
        </button>
        <p className="text-sm text-gray-400 p-4 justify-center">The button will be enabled when the poll ends or when all students have submitted their answers.

        </p>
      </div>
      {/* Floating Message Button (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          className="flex items-center gap-2 px-5 py-5 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-800 transition font-semibold text-base"
          onClick={() => setChatOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
      {/* Messaging/Participants Pane */}
      {chatOpen && (
        <div className="fixed bottom-28 right-8 w-96 max-w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 z-50">
          {/* Header with Tabs */}
          <div className="flex items-center justify-between bg-white rounded-x-xl rounded-t-xl border-gray-400 border-1 px-4 py-3">
            <div className="flex gap-4">
              <button
                className={`font-semibold text-lg pb-1 focus:outline-none ${activeTab === "messages"
                  ? "text-gray-600 border-b-2 border-purple-600"
                  : "text-gray-400"
                  }`}
                onClick={() => setActiveTab("messages")}
              >
                Messages
              </button>
              <button
                className={`font-semibold text-lg pb-1 focus:outline-none ${activeTab === "participants"
                  ? "text-gray-600 border-b-2 border-purple-600"
                  : "text-gray-400"
                  }`}
                onClick={() => setActiveTab("participants")}
              >
                Participants
              </button>
            </div>
            <button
              className="text-purple hover:text-purple-200 transition"
              onClick={() => setChatOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Tab Content */}
          {activeTab === "messages" && (
            
            <>
              <div
                ref={messagesPaneRef}
                className="flex flex-col gap-3 px-4 py-3 h-64 overflow-y-auto bg-gray-50"
              >
                {messages.map((msg, idx) => {
                  const isYou = msg.socketId === "You";
                  return (
                    <div
                      className={`flex items-start gap-2 ${isYou ? "justify-end" : ""}`}
                      key={idx}
                    >
                      {!isYou && avatarSVG(msg.sender, 32)}
                      <div>
                        <div className={`text-sm ${isYou ? "text-right" : ""} text-gray-700 font-semibold`}>
                          {msg.sender}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-2xl ${isYou
                            ? "bg-purple-600 text-white rounded-br-sm"
                            : "bg-purple-100 text-purple-900 rounded-bl-sm"
                            }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                      {isYou && avatarSVG(msg.sender, 32)}
                    </div>
                  );
                })}
              </div>
              <form
                className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200"
                onSubmit={handleChatSend}
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-full font-semibold"
                >
                  Send
                </button>
              </form>
            </>
          )}
          {activeTab === "participants" && (
            <div className="px-4 py-3 h-64 overflow-y-auto bg-gray-50">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 text-gray-700 font-semibold">Name</th>
                    <th className="py-2 text-gray-700 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.filter(p => p.name !== "You").map((p, idx) => (
                    <tr className="border-t" key={p.sessionId}>
                      <td className="py-2 flex items-center gap-2">
                        {avatarSVG(p.name, 24)}
                        {p.name}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          className="text-purple-600 hover:underline font-semibold"
                          onClick={() => handleKick(p.sessionId)}
                        >
                          Kick out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
