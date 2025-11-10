import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { events } from "../../services/api";
export default function EventNew({ navigation }: any){
  const [title, setTitle] = useState(""); const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:"700", marginBottom:8 }}>Nová akce</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Název" style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginBottom:10 }}/>
      <TextInput value={date} onChangeText={setDate} placeholder="2025-11-10T10:00:00" style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginBottom:10 }}/>
      <TextInput value={description} onChangeText={setDescription} placeholder="Popis" style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginBottom:10 }}/>
      <Pressable onPress={async()=>{ try{ await events.create({ title, date, description }); Alert.alert("Uloženo"); navigation.goBack(); }catch(e:any){ Alert.alert("Chyba", e?.message||"Error"); } }} style={{ backgroundColor:"#0A4F9A", padding:12, borderRadius:10 }}><Text style={{ color:"#fff", textAlign:"center", fontWeight:"700" }}>Uložit</Text></Pressable>
    </View>
  );
}
