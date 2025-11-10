import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Splash({ navigation }: any){
  return (
    <LinearGradient colors={["#2A7FDB","#0A4F9A"]} style={{ flex:1, padding:24, justifyContent:"space-between" }}>
      <View/>
      <View style={{ alignItems:"center" }}>
        <Image source={{ uri:"https://i.imgur.com/1bX5QH6.png"}} style={{ width:96, height:96, marginBottom:16 }}/>
        <Text style={{ color:"#fff", fontWeight:"800", letterSpacing:1 }}>TOPDENTTEAM</Text>
      </View>
      <Pressable style={s.btn} onPress={()=>navigation.navigate("Login")}><Text style={s.btnText}>Přihlásit se</Text></Pressable>
    </LinearGradient>
  );
}
const s = StyleSheet.create({ btn:{ backgroundColor:"#5BA2F1", paddingVertical:12, borderRadius:10 }, btnText:{ color:"#fff", textAlign:"center", fontWeight:"700" } });
