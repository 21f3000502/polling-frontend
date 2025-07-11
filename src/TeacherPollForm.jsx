import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket";
import logo from './assets/react.svg'

const DEFAULT_TIMER = 60;
const TIMER_OPTIONS = [60, 30, 90];

export default function TeacherPollForm() {
  const [question, setQuestion] = useState("");
  const [timer, setTimer] = useState(DEFAULT_TIMER);
  const [options, setOptions] = useState([
    { text: "", correct: true },
    { text: "", correct: false },
  ]);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("teacher_signup", { name: "Teacher" });
    socket.on("teacher_signed_up", () => { });
    socket.on("new_poll", () => navigate("/teacher/results"));
    socket.on("error", (msg) => setError(msg));
    return () => {
      socket.off("teacher_signed_up");
      socket.off("new_poll");
      socket.off("error");
    };
  }, [navigate]);

  const handleOptionTextChange = (i, value) => {
    setOptions(options.map((opt, idx) => idx === i ? { ...opt, text: value } : opt));
  };

  const handleCorrectChange = (i, isCorrect) => {
    setOptions(options.map((opt, idx) =>
      idx === i ? { ...opt, correct: isCorrect } : { ...opt, correct: false }
    ));
  };

  const addOption = () => setOptions([...options, { text: "", correct: false }]);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    setError("");
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    if (options.length < 2 || options.some(opt => !opt.text.trim())) {
      setError("Please provide at least two options and fill all option fields.");
      return;
    }
    if (!options.some(opt => opt.correct)) {
      setError("Please mark one option as correct.");
      return;
    }
    const pollData = {
      question,
      options: options.map(opt => opt.text),
      timer,
      correctIndex: options.findIndex(opt => opt.correct)
    };
    socket.emit("create_poll", pollData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 w-full">
      <form
        className="bg-white p-8 w-full max-w-3xl mt-20"
        onSubmit={handleAskQuestion}
        autoComplete="off"
      >
        <a
          className="flex items-center gap-2 px-4 py-2 my-2 w-40 bg-violet-600 text-white rounded-full shadow hover:bg-violet-700 transition"
          type="button"
          href="/"
        >
          <img src={logo} alt="React logo" className="h-5 w-5" />
          <span>Intervue Poll</span>
        </a>

        <h1 className="text-3xl font-semibold mb-2">
          Let’s <strong>Get Started</strong>
        </h1>
        <p className="text-gray-500 mb-8">
          you’ll have the ability to create and manage polls, ask questions, and monitor your students’ responses in real-time.
        </p>
        {error && <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>}
        <div className="mb-6">
          <div className="flex items-center mb-2 justify-between">
            <label className="block font-medium mb-2" htmlFor="question">
              Enter your question
            </label>
            <select
              className="ml-2 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-200"
              value={timer}
              onChange={e => setTimer(Number(e.target.value))}
            >
              {TIMER_OPTIONS.map(sec => (
                <option key={sec} value={sec}>{sec} seconds</option>
              ))}
            </select>
          </div>
          <textarea
            id="question"
            rows={2}
            maxLength={100}
            className="max-w-3xl border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none bg-gray-200 w-full h-40"
            placeholder="Type your question here..."
            value={question}
            onChange={handleQuestionChange}
          />
          <div className="text-right text-xs text-gray-400">{charCount}/100</div>
        </div>
        <div>
          <div className="flex font-semibold mb-2">
            <div className="w-1/2 py-2">Edit Options</div>
            <div className="w-1/2 py-2">Is it Correct?</div>
          </div>
          {options.map((opt, i) => (
            <div className="flex items-center mb-3" key={i}>
              <div className="w-1/2">
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionTextChange(i, e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 w-full bg-gray-200"
                  placeholder={`Option ${i + 1}`}
                />
              </div>
              <div className="w-1/2 flex items-center space-x-2 ml-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`correct${i}`}
                    className="accent-purple-600"
                    checked={opt.correct}
                    onChange={() => handleCorrectChange(i, true)}
                  />
                  <span className="ml-1 text-sm">Yes</span>
                </label>
                <label className="flex items-center ml-4">
                  <input
                    type="radio"
                    name={`correct${i}`}
                    className="accent-purple-600"
                    checked={!opt.correct}
                    onChange={() => handleCorrectChange(i, false)}
                  />
                  <span className="ml-1 text-sm">No</span>
                </label>
              </div>
            </div>
          ))}
          <button
            className="text-purple-600 text-sm font-medium mt-2 hover:underline"
            type="button"
            onClick={addOption}
          >
            + Add More option
          </button>
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="bg-purple-600 text-white px-8 py-2 rounded-full font-semibold shadow hover:bg-purple-700 transition"
          >
            Ask Question
          </button>
        </div>
        
      </form>
    </div>
  );
}
