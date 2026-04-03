export function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("vesit-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("vesit-session-id", id);
  }
  return id;
}

export function getUserName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("vesit-user-name") || "";
}

export function setUserName(name) {
  if (typeof window === "undefined") return;
  localStorage.setItem("vesit-user-name", name);
}
