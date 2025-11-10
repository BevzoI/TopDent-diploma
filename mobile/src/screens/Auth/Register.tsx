import React, { useState } from "react";
import { Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { register } from "../../services/api";

export default function Register({ navigation }: any){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    try { await register(email.trim(), password); Alert.alert("Účet vytvořen","Nyní ověřte telefon"); navigation.navigate("PhoneVerify"); }
    catch(e:any){ Alert.alert("Chyba", e?.response?.data || e?.message || "Error"); }
  };

  return (
    <LinearGradient colors={["#2A7FDB","#0A4F9A"]} style={{ flex:1, padding:24 }}>
      <Text style={{ color:"#fff", fontSize:22, fontWeight:"800", textAlign:"center", marginVertical:16 }}>Vytvořte si účet</Text>
      <Text style={s.label}>Email*</Text>
      <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#BBD3F4"/>
      <Text style={s.label}>Password*</Text>
      <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#BBD3F4" secureTextEntry/>
      <Pressable style={s.btn} onPress={onSubmit}><Text style={s.btnText}>Vytvořit účet</Text></Pressable>
    </LinearGradient>
  );
}
const s = StyleSheet.create({ label:{ color:"#E5F0FF", fontSize:12, marginTop:6, marginBottom:4 }, input:{ backgroundColor:"rgba(255,255,255,0.15)", borderRadius:8, paddingHorizontal:12, paddingVertical:10, color:"#fff", borderWidth:1, borderColor:"rgba(255,255,255,0.30)" }, btn:{ backgroundColor:"#5BA2F1", borderRadius:10, paddingVertical:12, alignItems:"center", marginTop:12 }, btnText:{ color:"#fff", fontWeight:"700" } });
