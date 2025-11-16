import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Menu({ navigation }: any) {
  const Tile = ({ label, screen }: { label: string; screen: string }) => (
    <Pressable
      style={s.tile}
      onPress={() => navigation.navigate(screen)}
    >
      <Text style={s.tileText}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12 }}>
        TopDentTeam
      </Text>
      <View style={s.grid}>
        <Tile label="Omluvenky" screen="OmluvenkyList" />
        <Tile label="Akce" screen="EventsList" />
        <Tile label="Kurzy" screen="CoursesList" />
        <Tile label="Kontakty" screen="ContactsList" />
        <Tile label="Fotogalerie" screen="GalleryList" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "45%",
    backgroundColor: "#E6F0FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tileText: { fontWeight: "700" },
});
