import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Menu({ navigation }: any){
  return (
    <View style={{ flex:1, padding:16, backgroundColor:"#fff" }}>
      <Text style={{ fontSize:20, fontWeight:"800", marginBottom:12 }}>TopDentTeam</Text>
      <View style={s.grid}>
        <Pressable style={s.tile} onPress={()=>navigation.navigate("OmluvenkyList")}><Text style={s.tileText}>Omluvenky</Text></Pressable>
        <Pressable style={s.tile} onPress={()=>navigation.navigate("EventsList")}><Text style={s.tileText}>Akce</Text></Pressable>
      </View>
    </View>
  );
}
const s = StyleSheet.create({ grid:{ flexDirection:"row", flexWrap:"wrap", gap:12 }, tile:{ width:"47%", backgroundColor:"#EAF2FF", padding:16, borderRadius:12 }, tileText:{ fontWeight:"700" } });
