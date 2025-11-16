import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { courses } from "../../services/api";

export default function CoursesList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    courses.list().then(setData).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kurzy</Text>

      <FlatList
        data={data}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.title}</Text>
            {item.date && <Text>{item.date}</Text>}
            {item.lecturer && <Text>Lektor: {item.lecturer}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee" },
  name: { fontWeight: "700", fontSize: 15 },
});
