import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Menu from "../screens/Dashboard/Menu";

import OmluvenkyList from "../screens/Omluvenky/List";
import OmluvenkaDetail from "../screens/Omluvenky/Detail";
import OmluvenkaNew from "../screens/Omluvenky/New";

import EventsList from "../screens/Events/List";
import EventDetail from "../screens/Events/Detail";
import EventNew from "../screens/Events/New";

import CoursesList from "../screens/Courses/CoursesList";
import ContactsList from "../screens/Contacts/ContactsList";
import GalleryList from "../screens/Gallery/GalleryList";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Menu"
        component={Menu}
        options={{ title: "TopDentTeam" }}
      />

      <Stack.Screen
        name="OmluvenkyList"
        component={OmluvenkyList}
        options={{ title: "Omluvenky" }}
      />

      <Stack.Screen
        name="OmluvenkaDetail"
        component={OmluvenkaDetail}
        options={{ title: "Detail omluvenky" }}
      />

      <Stack.Screen
        name="OmluvenkaNew"
        component={OmluvenkaNew}
        options={{ title: "Nová omluvenka" }}
      />

      <Stack.Screen
        name="EventsList"
        component={EventsList}
        options={{ title: "Akce" }}
      />

      <Stack.Screen
        name="EventDetail"
        component={EventDetail}
        options={{ title: "Detail akce" }}
      />

      <Stack.Screen
        name="EventNew"
        component={EventNew}
        options={{ title: "Nová akce" }}
      />

      <Stack.Screen
        name="CoursesList"
        component={CoursesList}
        options={{ title: "Kurzy" }}
      />

      <Stack.Screen
        name="ContactsList"
        component={ContactsList}
        options={{ title: "Kontakty" }}
      />

      <Stack.Screen
        name="GalleryList"
        component={GalleryList}
        options={{ title: "Fotogalerie" }}
      />
    </Stack.Navigator>
  );
}