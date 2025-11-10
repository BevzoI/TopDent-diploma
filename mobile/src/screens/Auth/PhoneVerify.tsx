import React, { useState } from "react";
import { Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { sendPhoneCode, verifyPhone } from "../../services/api";

export default function PhoneVerify({ navigation }: any){
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <LinearGradient colors={["#2A7FDB","#0A4F9A"]} style={{ flex:1, padding:24 }}>
      <Text style={{ color:"#fff", fontSize:22, fontWeight:"800", textAlign:"center", marginVertical:16 }}>Ověření telefonu</Text>
      <Text style={s.label}>Telefon</Text>
      <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="+420 777 777 777" placeholderTextColor="#BBD3F4"/>
      {!sent ? (
        <Pressable style={s.btn} onPress={async()=>{ try{ await sendPhoneCode(phone); setSent(True as any) }catch(e:any){ Alert.alert("Chyba", e?.response?.data || e?.message) } }}><Text style={s.btnText}>Odeslat ověřovací kód</Text></Pressable>
      ) : (
        <>
          <Text style={s.label}>Kód</Text>
          <TextInput style={s.input} value={code} onChangeText={setCode} placeholder="123456" placeholderTextColor="#BBD3F4"/>
          <Pressable style={s.btn} onPress={async()=>{ try{ await verifyPhone(phone, code); Alert.alert("Ověřeno","Telefon ověřen"); navigation.reset({ index:0, routes:[{ name:"App" }] }); }catch(e:any){ Alert.alert("Chyba", e?.response?.data || e?.message) } }}><Text style={s.btnText}>Ověřit</Text></Pressable>
        </>
      )}
    </LinearGradient>
  );
}
const s = StyleSheet.create({ label:{ color:"#E5F0FF", fontSize:12, marginTop:6, marginBottom:4 }, input:{ backgroundColor:"rgba(255,255,255,0.15)", borderRadius:8, paddingHorizontal:12, paddingVertical:10, color:"#fff", borderWidth:1, borderColor:"rgba(255,255,255,0.30)" }, btn:{ backgroundColor:"#5BA2F1", borderRadius:10, paddingVertical:12, alignItems:"center", marginTop:12 }, btnText:{ color:"#fff", fontWeight:"700" } });
