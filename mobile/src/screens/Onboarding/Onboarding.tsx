import React from "react";
import { View, Text, Pressable } from "react-native";

export default function Onboarding({ navigation }: any){
  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      <Text style={{ fontSize:22, fontWeight:"800" }}>Onboarding</Text>
      <Pressable onPress={()=>navigation.navigate("Splash")}><Text style={{ color:"#0A4F9A", marginTop:16 }}>Začít</Text></Pressable>
    </View>
  );
}
