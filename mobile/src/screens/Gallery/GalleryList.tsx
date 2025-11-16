import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { gallery } from "../../services/api";

export default function GalleryList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    gallery.list().then(setData).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fotogalerie</Text>

      <FlatList
        data={data}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image_url }} style={styles.img} />
            <Text style={styles.caption}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  item: { marginBottom: 16 },
  img: { width: "100%", height: 180, borderRadius: 8, backgroundColor: "#ddd" },
  caption: { marginTop: 4, fontWeight: "600" },
});
