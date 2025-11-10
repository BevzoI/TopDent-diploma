import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { events } from "../../services/api";

export default function EventsList({ navigation }: any){
  const [data, setData] = useState<any[]>([]);
  useEffect(()=>{ events.list().then(setData).catch(()=>{}); },[]);
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:"700", marginBottom:8 }}>Akce</Text>
      <Pressable onPress={()=>navigation.navigate("EventNew")}><Text style={{ color:"#0A4F9A" }}>Nová akce</Text></Pressable>
      <FlatList data={data} keyExtractor={i=>String(i.id)} renderItem={({item})=>(
        <Pressable onPress={()=>navigation.navigate("EventDetail", { id:item.id })} style={{ paddingVertical:10, borderBottomWidth:1, borderColor:"#eee" }}>
          <Text style={{ fontWeight:"700" }}>{item.title}</Text>
          <Text style={{ color:"#666" }}>{new Date(item.date).toLocaleString()}</Text>
        </Pressable>
      )}/>
    </View>
  );
}
