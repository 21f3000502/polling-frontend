import { useEffect, useState, useRef } from "react";
import { socket } from "./socket";
import React from "react";

export default function StudentChatPanel({ visible, onClose }) {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("messages");
  const [chatInput, setChatInput] = useState("");
  const messagesPaneRef = useRef();

  useEffect(() => {
    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        if (messagesPaneRef.current) {
          messagesPaneRef.current.scrollTop = messagesPaneRef.current.scrollHeight;
        }
      }, 100);
    });
    socket.on("participants", (list) => setParticipants(list));
    socket.emit("get_participants");
    return () => {
      socket.off("chat_message");
      socket.off("participants");
    };
  }, []);

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit("chat_message", chatInput.trim());
    setChatInput("");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-28 right-8 w-96 max-w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 z-50">
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
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      {activeTab === "messages" && (
        <>
          <div
            ref={messagesPaneRef}
            className="flex flex-col gap-3 px-4 py-3 h-64 overflow-y-auto bg-gray-50"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div>
                  <div className="text-sm text-gray-700 font-semibold">{msg.sender}</div>
                  <div className="bg-purple-100 text-purple-900 px-4 py-2 rounded-2xl rounded-bl-sm">{msg.text}</div>
                </div>
              </div>
            ))}
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
          <ul>
            {participants.map((p, idx) => (
              <li key={idx} className="py-2 text-gray-700 font-semibold">
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
