import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { login } from "../../services/api";

export default function Login({ navigation }: any) {
  const [username, setUsername] = useState("user");
  const [password, setPassword] = useState("userpass");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await login(username, password);
      navigation.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    } catch (e: any) {
      console.log(e?.response?.data || e);
      Alert.alert("Chyba", "Neplatné přihlášení");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2A7FDB", "#0A4F9A"]}
      style={{ flex: 1, padding: 24, justifyContent: "center" }}
    >
      <Text style={s.logo}>TOPDENTTEAM</Text>
      <Text style={s.title}>Přihlášení</Text>

      <Text style={s.label}>Uživatelské jméno</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="user / admin"
        style={s.input}
        autoCapitalize="none"
      />

      <Text style={s.label}>Heslo</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Heslo"
        style={s.input}
        secureTextEntry
      />

      <Pressable style={s.btn} onPress={onLogin} disabled={loading}>
        <Text style={s.btnText}>{loading ? "Přihlašuji..." : "Přihlásit se"}</Text>
      </Pressable>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  logo: {
    color: "#E5F0FF",
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  label: { color: "#E5F0FF", fontSize: 12, marginTop: 6, marginBottom: 4 },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    marginBottom: 8,
  },
  btn: {
    backgroundColor: "#5BA2F1",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
