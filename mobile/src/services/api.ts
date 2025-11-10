import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = (Constants.expoConfig?.extra as any)?.apiUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (cfg) => {
  const token = await AsyncStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export async function login(username: string, password: string){
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  const { data } = await api.post("/auth/login", form, { headers: {"Content-Type":"application/x-www-form-urlencoded"} });
  await AsyncStorage.setItem("token", data.access_token);
  return data;
}

export async function register(email: string, password: string){
  const { data } = await api.post("/auth/register", { email, password });
  return data;
}

export async function sendPhoneCode(phone: string){
  const { data } = await api.post("/auth/phone/send", { phone });
  return data;
}

export async function verifyPhone(phone: string, code: string){
  const { data } = await api.post("/auth/phone/verify", { phone, code });
  return data;
}

export async function oauthExchange(provider: "google"|"apple", id_token: string){
  const { data } = await api.post("/auth/oauth", { provider, id_token });
  await AsyncStorage.setItem("token", data.access_token);
  return data;
}

export const omluvenky = {
  list: () => api.get("/omluvenky/").then(r=>r.data),
  create: (p:{title:string;reason?:string}) => api.post("/omluvenky/", p).then(r=>r.data),
  setStatus: (id:number, status:"approved"|"denied"|"pending") => api.post(`/omluvenky/${id}/status/${status}`).then(r=>r.data),
};

export const events = {
  list: () => api.get("/events/").then(r=>r.data),
  create: (p:{title:string;date:string;description?:string}) => api.post("/events/", p).then(r=>r.data),
};
