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

  // Helper to calculate percentage for each option
  const getPercentages = (votes) => {
    const total = votes.reduce((sum, v) => sum + v, 0);
    return total === 0
      ? votes.map(() => 0)
      : votes.map((v) => Math.round((v / total) * 100));
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center py-10">
      <div className="w-full max-w-2xl">
        <div className="w-full flex justify-between  ">
          <h1 className="text-4xl font-light mb-8 text-purple-600">
            View <span className="font-bold">Poll History</span>

          </h1>
          <a href="/teacher/create" className="bg-purple-600 text-lg text-white max-h-min p-2 rounded-sm font-semibold shadow transition hover:bg-purple-700" > + Ask a Question</a>
        </div>

        {history.length === 0 ? (
          <div className="text-gray-500 text-center">No polls yet.</div>
        ) : (
          history.map((poll, idx) => {
            const percentages = getPercentages(poll.votes || []);
            return (
              <div key={idx} className="mb-10">
                <h2 className="text-xl font-semibold mb-2">
                  Question {idx + 1}
                </h2>
                <div className="bg-gray-700 rounded-t-lg p-4 text-white font-semibold">
                  {poll.question}
                </div>










                <div className="border rounded-b-lg p-4 bg-white space-y-3">
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
                        <div className={`relative w-full h-12 rounded-lg border flex items-center overflow-hidden ${isCorrect ? "border-green-400" : "border-purple-200"}`}>
                          <div
                            className={`absolute left-0 top-0 h-full ${barBg} transition-all duration-500`}
                            style={{
                              width: `${percentages[i]}%`,
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
                            {percentages[i]}%
                          </span>
                        </div>
                      </div>
                    );
                  })}


                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
