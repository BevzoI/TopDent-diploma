import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { login, oauthExchange } from "../../services/api";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";

export default function Login({ navigation }: any){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: (Constants.expoConfig?.extra as any)?.googleClientId
  });

  const onLogin = async () => {
    try { setLoading(True as any) } catch(e){}
    try {
      setLoading(true);
      await login(email.trim(), password);
      navigation.reset({ index:0, routes:[{ name:"App" }] });
    } catch(e:any){
      Alert.alert("Login failed", e?.response?.data || e?.message || "Error");
    } finally { setLoading(false); }
  };

  const onGoogle = async () => {
    const res = await promptAsync();
    const idToken = (res as any)?.authentication?.idToken;
    if(res?.type === "success" && idToken){
      await oauthExchange("google", idToken);
      navigation.reset({ index:0, routes:[{ name:"App" }] });
    }
  };

  return (
    <LinearGradient colors={["#2A7FDB","#0A4F9A"]} style={{ flex:1, padding:24 }}>
      <Text style={{ color:"#fff", fontSize:22, fontWeight:"800", textAlign:"center", marginVertical:16 }}>Welcome Back</Text>
      <Text style={s.label}>Email*</Text>
      <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor="#BBD3F4" value={email} onChangeText={setEmail}/>
      <Text style={s.label}>Password*</Text>
      <TextInput style={s.input} placeholder="••••••••" placeholderTextColor="#BBD3F4" secureTextEntry value={password} onChangeText={setPassword}/>
      <Pressable onPress={()=>Linking.openURL("https://example.com/reset")}><Text style={s.forgot}>Forgot your password? Tap here</Text></Pressable>
      <Pressable style={s.btn} onPress={onLogin} disabled={loading}><Text style={s.btnText}>{loading?"Signing in...":"Sign in"}</Text></Pressable>
      <Text style={s.or}>Or login with</Text>
      <Pressable style={s.btnOutline} onPress={onGoogle}><Text style={s.btnOutlineText}>Google</Text></Pressable>
      <Pressable onPress={()=>navigation.navigate("Register")}><Text style={s.signup}>Don’t have an account? <Text style={{ textDecorationLine:"underline", fontWeight:"800" }}>Sign Up</Text></Text></Pressable>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  label:{ color:"#E5F0FF", fontSize:12, marginTop:6, marginBottom:4 },
  input:{ backgroundColor:"rgba(255,255,255,0.15)", borderRadius:8, paddingHorizontal:12, paddingVertical:10, color:"#fff", borderWidth:1, borderColor:"rgba(255,255,255,0.30)" },
  forgot:{ color:"#CFE2FF", fontSize:12, textAlign:"right", marginTop:6, marginBottom:10 },
  btn:{ backgroundColor:"#5BA2F1", borderRadius:10, paddingVertical:12, alignItems:"center", marginTop:6 },
  btnText:{ color:"#fff", fontWeight:"700" },
  or:{ color:"#CFE2FF", textAlign:"center", marginVertical:12 },
  btnOutline:{ borderWidth:1, borderColor:"rgba(255,255,255,0.85)", borderRadius:10, paddingVertical:10, alignItems:"center", marginBottom:8 },
  btnOutlineText:{ color:"#fff", fontWeight:"700" },
  signup:{ color:"#CFE2FF", textAlign:"center", marginTop:14 },
});
