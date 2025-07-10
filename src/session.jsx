// src/session.jsx
export function getSessionId() {
  let id = sessionStorage.getItem("poll_session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("poll_session_id", id);
  }
  return id;
}
