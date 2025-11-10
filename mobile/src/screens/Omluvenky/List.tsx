import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { omluvenky } from "../../services/api";

export default function OmluvenkyList({ navigation }: any){
  const [data, setData] = useState<any[]>([]);
  useEffect(()=>{ omluvenky.list().then(setData).catch(()=>{}); },[]);
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:"700", marginBottom:8 }}>Omluvenky</Text>
      <Pressable onPress={()=>navigation.navigate("OmluvenkaNew")}><Text style={{ color:"#0A4F9A" }}>Nová omluvenka</Text></Pressable>
      <FlatList data={data} keyExtractor={i=>String(i.id)} renderItem={({item})=>(
        <Pressable onPress={()=>navigation.navigate("OmluvenkaDetail", { id:item.id })} style={{ paddingVertical:10, borderBottomWidth:1, borderColor:"#eee" }}>
          <Text style={{ fontWeight:"700" }}>{item.title}</Text>
          <Text style={{ color:"#666" }}>{item.status}</Text>
        </Pressable>
      )}/>
    </View>
  );
}
