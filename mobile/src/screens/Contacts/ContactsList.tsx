import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { contacts } from "../../services/api";

type Contact = {
  id: number;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
};

const ContactsList: React.FC = () => {
  const [data, setData] = useState<Contact[]>([]);

  useEffect(() => {
    contacts
      .list()
      .then(setData)
      .catch((e) => {
        console.log("Contacts error", e);
      });
  }, []);

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      {item.position ? <Text style={styles.sub}>{item.position}</Text> : null}
      {item.phone ? <Text style={styles.text}>{item.phone}</Text> : null}
      {item.email ? <Text style={styles.text}>{item.email}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kontakty</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
      />
    </View>
  );
};

export default ContactsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  name: {
    fontWeight: "700",
    fontSize: 15,
  },
  sub: {
    color: "#666",
  },
  text: {
    color: "#333",
  },
});
