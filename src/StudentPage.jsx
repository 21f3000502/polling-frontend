// src/StudentPage.jsx
import logo from './assets/react.svg'
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <StudentRegister onRegistered={handleRegistered} />
      </div>
    );
  }

















  // Waiting for poll
  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex justify-center p-6">
          <a
            className="flex items-center gap-2 px-4 py-2 my-2 bg-purple-600 text-white rounded-full shadow hover:bg-violet-700 transition"
            type="button"
            href="/"
          >
            <img src={logo} alt="React logo" className="h-5 w-5" />
            <span>Intervue Poll</span>
          </a>
        </div>
        <div class="animate-spin rounded-full h-16 w-16 border-10 border-purple-600 border-t-transparent p-6"></div>

        <div className="text-xl font-semibold mb-4 p-6">Waiting for the teacher to ask questions..</div>

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


  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
  //     <div className="w-full max-w-xl bg-green-400 rounded shadow p-6">
  //       <div className="flex justify-between items-center mb-4">
  //         <div className="text-lg font-semibold">
  //           {minutes}:{seconds} {timer > 0 ? "Time left" : ""}
  //         </div>
  //         <button
  //           className="bg-purple-600 text-white px-3 py-1 rounded"
  //           onClick={() => setChatOpen(true)}
  //         >
  //           Message
  //         </button>
  //       </div>
  //       <div className="mb-2 text-gray-700 font-medium">Question</div>
  //       <div className="mb-4 text-xl font-bold">{poll.question}</div>
  //       {!showResults ? (
  //         <div>
  //           <div className="mb-4">
  //             {poll.options.map((opt, i) => (
  //               <label
  //                 key={i}
  //                 className={`block p-2 rounded border mb-2 cursor-pointer ${
  //                   selected === i
  //                     ? "border-purple-600 bg-purple-100"
  //                     : "border-gray-300"
  //                 } ${voted ? "opacity-50" : ""}`}
  //               >
  //                 <input
  //                   type="radio"
  //                   name="option"
  //                   value={i}
  //                   checked={selected === i}
  //                   disabled={voted}
  //                   onChange={() => setSelected(i)}
  //                   className="mr-2"
  //                 />
  //                 {opt}
  //               </label>
  //             ))}
  //           </div>
  //           <button
  //             className={`bg-purple-600 text-white px-4 py-2 rounded ${
  //               voted || selected === null ? "opacity-50 cursor-not-allowed" : ""
  //             }`}
  //             disabled={voted || selected === null}
  //             onClick={handleVote}
  //           >
  //             {voted ? "Answer Submitted" : "Submit Answer"}
  //           </button>
  //           {voted && (
  //             <div className="mt-2 text-gray-500 text-sm">
  //               Waiting for poll to end...
  //             </div>
  //           )}
  //         </div>
  //       ) : (
  //         <div>
  //           <div className="mb-2 text-gray-700 font-medium">Results</div>
  //           {poll.options.map((opt, i) => (
  //             <div key={i} className="flex items-center mb-2">
  //               <div className="w-2/3">{opt}</div>
  //               <div className="w-1/3 text-right">
  //                 {results ? results[i] : 0} vote(s){" "}
  //                 {votePercents[i] !== undefined ? `(${votePercents[i]}%)` : ""}
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       )}
  //     </div>









  //     <StudentChatPanel visible={chatOpen} onClose={() => setChatOpen(false)} />
  //   </div>
  // );
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
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

      {/* Question statement and options/results */}
      <div className="w-full max-w-xl flex flex-col bg-gray-100 rounded-2xl">
        <div className="font-medium text-white text-lg bg-gray-700 m-0 px-4 py-4 rounded-t-2xl">
          {poll.question}
        </div>
        <div className="rounded-md p-4 mb-4">
          {!showResults ? (
            poll.options.map((opt, i) => (
  <button
    key={i}
    type="button"
    disabled={voted}
    onClick={() => setSelected(i)}
    className={`
      flex items-center w-full text-left p-2 rounded border mb-2 transition-all duration-300
      ${selected === i ? "border-purple-600 bg-purple-100" : "border-gray-300"}
      ${voted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      focus:outline-none
    `}
  >
    <span
      className={`
        w-7 h-7 flex items-center justify-center rounded-full mr-3 font-semibold
        ${selected === i ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}
      `}
    >
      {i + 1}
    </span>
    <span className="truncate">{opt}</span>
  </button>
))
          ) : (
            poll.options.map((opt, i) => {
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
                  <div className={`relative w-full h-12 rounded-lg border flex items-center overflow-hidden ${isCorrect ? "border-green-400" : "border-purple-200"}`}>
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
          )}

          {!showResults && (
            <button
              className={`bg-purple-600 text-white px-4 py-2 rounded mt-2 mx-auto ${voted || selected === null ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={voted || selected === null}
              onClick={handleVote}
            >
              {voted ? "Answer Submitted" : "Submit Answer"}
            </button>
          )}
          {voted && !showResults && (
            <div className="mt-2 text-gray-500 text-sm">
              Waiting for poll to end...
            </div>
          )}
        </div>
      </div>
      {showResults && (
        <div className="p-3 font-bold text-gray-500">
          <p>Wait for Teacher to ask a new question...</p>
        </div>
      )}



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

      {/* Chat Panel */}
      <StudentChatPanel visible={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );

}
