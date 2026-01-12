// src/lib/api.js
const SESSION_KEY = "kr_session";

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function request(path, { method = "GET", body } = {}) {
  const session = getSession();

  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export const api = {
  // auth
  login: (username, password) => request("/api/auth/login", { method: "POST", body: { username, password } }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),

  // profile (me)
  getProfile: () => request("/api/profile"),
  updateProfile: (payload) => request("/api/profile", { method: "PUT", body: payload }),

  // departments
  listDepartments: () => request("/api/departments"),
  createDepartment: (payload) => request("/api/departments", { method: "POST", body: payload }),
  updateDepartment: (id, payload) => request(`/api/departments/${id}`, { method: "PUT", body: payload }),
  deleteDepartment: (id) => request(`/api/departments/${id}`, { method: "DELETE" }),

  // users (admin)
  createUser: (payload) => request("/api/users", { method: "POST", body: payload }),
  listUsers: () => request("/api/users"),
  updateUser: (id, payload) => request(`/api/users/${id}`, { method: "PUT", body: payload }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: "DELETE" }),

  // reports
  createReport: (payload) => request("/api/reports", { method: "POST", body: payload }),
  listReports: () => request("/api/reports"),
  reviewReport: (id) => request(`/api/reports/${id}/review`, { method: "PATCH" }),
};
