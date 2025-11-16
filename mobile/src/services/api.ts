import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL =
  (Constants.expoConfig?.extra as any)?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (cfg) => {
  const token = await AsyncStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ---------- AUTH ----------

export async function login(username: string, password: string) {
  const { data } = await api.post("/auth/login", { username, password });
  await AsyncStorage.setItem("token", data.access_token);
  await AsyncStorage.setItem("role", data.role);
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("role");
}

// ---------- OMLUVENKY / DOVOLENÁ ----------

export const omluvenky = {
  list: () => api.get("/omluvenky/").then((r) => r.data),
  detail: (id: number) => api.get(`/omluvenky/${id}`).then((r) => r.data),
  create: (p: {
    employee: string;
    reason: string;
    start_date: string;
    end_date: string;
    full_day?: boolean;
    type?: "absence" | "vacation";
  }) => api.post("/omluvenky/", p).then((r) => r.data),
  setStatus: (
    id: number,
    status: "pending" | "approved" | "denied"
  ) => api.post(`/omluvenky/${id}/status/${status}`).then((r) => r.data),
};

// ---------- EVENTS ----------

export const events = {
  list: () => api.get("/events/").then((r) => r.data),
  detail: (id: number) => api.get(`/events/${id}`).then((r) => r.data),
  create: (p: {
    title: string;
    date: string;
    location?: string;
    description?: string;
  }) => api.post("/events/", p).then((r) => r.data),
  setStatus: (
    id: number,
    status: "waiting" | "going" | "not_going"
  ) => api.post(`/events/${id}/status/${status}`).then((r) => r.data),
};

// ---------- COURSES ----------

export const courses = {
  list: () => api.get("/courses/").then((r) => r.data),
  detail: (id: number) => api.get(`/courses/${id}`).then((r) => r.data),
  create: (p: {
    title: string;
    description?: string;
    date?: string;
    lecturer?: string;
    location?: string;
  }) => api.post("/courses/", p).then((r) => r.data),
};

// ---------- CONTACTS ----------

export const contacts = {
  list: () => api.get("/contacts/").then((r) => r.data),
  detail: (id: number) => api.get(`/contacts/${id}`).then((r) => r.data),
  create: (p: {
    name: string;
    position?: string;
    phone?: string;
    email?: string;
  }) => api.post("/contacts/", p).then((r) => r.data),
};

// ---------- GALLERY ----------

export const gallery = {
  list: () => api.get("/gallery/").then((r) => r.data),
  detail: (id: number) => api.get(`/gallery/${id}`).then((r) => r.data),
  create: (p: { title: string; image_url: string }) =>
    api.post("/gallery/", p).then((r) => r.data),
};
