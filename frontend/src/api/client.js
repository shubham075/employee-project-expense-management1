const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const authStore = {
  get accessToken() {
    return localStorage.getItem("accessToken");
  },
  get refreshToken() {
    return localStorage.getItem("refreshToken");
  },
  setTokens(tokens) {
    localStorage.setItem("accessToken", tokens.access_token);
    localStorage.setItem("refreshToken", tokens.refresh_token);
  },
  clear() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
  },
};

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return response.ok ? null : Promise.reject(new Error(response.statusText));
  }

  const payload = await response.json();
  if (!response.ok || payload?.success === false) {
    const message = payload?.message || response.statusText || "Request failed";
    throw new Error(message);
  }
  return payload?.data ?? payload;
}

async function refreshAccessToken() {
  if (!authStore.refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: authStore.refreshToken }),
  });
  const tokens = await parseResponse(response);
  authStore.setTokens(tokens);
  return tokens.access_token;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (authStore.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authStore.accessToken}`);
  }

  const request = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: isFormData || typeof options.body === "string" ? options.body : JSON.stringify(options.body),
    });

  let response = await request();
  if (response.status === 401 && authStore.refreshToken) {
    const token = await refreshAccessToken();
    headers.set("Authorization", `Bearer ${token}`);
    response = await request();
  }

  return parseResponse(response);
}

export const api = {
  auth: {
    login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
    logout: (refreshToken) => apiRequest("/auth/logout", { method: "POST", body: { refresh_token: refreshToken } }),
    me: () => apiRequest("/auth/me"),
    forgotPassword: (email) => apiRequest("/auth/forgot-password", { method: "POST", body: { email } }),
    resetPassword: (token, newPassword) =>
      apiRequest("/auth/reset-password", { method: "POST", body: { token, new_password: newPassword } }),
  },
  roles: {
    list: (query = "") => apiRequest(`/roles${query}`),
    create: (payload) => apiRequest("/roles", { method: "POST", body: payload }),
    update: (id, payload) => apiRequest(`/roles/${id}`, { method: "PUT", body: payload }),
    remove: (id) => apiRequest(`/roles/${id}`, { method: "DELETE" }),
  },
  users: crud("/users"),
  projects: crud("/projects"),
  tasks: {
    ...crud("/tasks"),
    updateStatus: (id, status) => apiRequest(`/tasks/${id}/status`, { method: "PATCH", body: { status } }),
  },
  expenses: {
    ...crud("/expenses"),
    decide: (id, status) => apiRequest(`/expenses/${id}/decision`, { method: "PATCH", body: { status } }),
    uploadBill: (id, file) => {
      const body = new FormData();
      body.append("file", file);
      return apiRequest(`/expenses/${id}/bill`, { method: "POST", body });
    },
  },
  notifications: {
    list: (query = "") => apiRequest(`/notifications${query}`),
    create: (payload) => apiRequest("/notifications", { method: "POST", body: payload }),
    markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
  },
  reports: {
    dashboard: () => apiRequest("/dashboard/summary"),
    expenses: () => apiRequest("/reports/expenses"),
    projects: () => apiRequest("/reports/projects"),
  },
};

function crud(basePath) {
  return {
    list: (query = "") => apiRequest(`${basePath}${query}`),
    get: (id) => apiRequest(`${basePath}/${id}`),
    create: (payload) => apiRequest(basePath, { method: "POST", body: payload }),
    update: (id, payload) => apiRequest(`${basePath}/${id}`, { method: "PUT", body: payload }),
    remove: (id) => apiRequest(`${basePath}/${id}`, { method: "DELETE" }),
  };
}

export { authStore };

