import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Menu from "../screens/Dashboard/Menu";
import OmluvenkyList from "../screens/Omluvenky/List";
import OmluvenkaDetail from "../screens/Omluvenky/Detail";
import OmluvenkaNew from "../screens/Omluvenky/New";
import EventsList from "../screens/Events/List";
import EventDetail from "../screens/Events/Detail";
import EventNew from "../screens/Events/New";

const Stack = createNativeStackNavigator();
export default function AppStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name="Menu" component={Menu} options={{ title: "TopDentTeam" }}/>
      <Stack.Screen name="OmluvenkyList" component={OmluvenkyList} options={{ title: "Omluvenky" }}/>
      <Stack.Screen name="OmluvenkaDetail" component={OmluvenkaDetail}/>
      <Stack.Screen name="OmluvenkaNew" component={OmluvenkaNew}/>
      <Stack.Screen name="EventsList" component={EventsList} options={{ title: "Akce" }}/>
      <Stack.Screen name="EventDetail" component={EventDetail}/>
      <Stack.Screen name="EventNew" component={EventNew}/>
    </Stack.Navigator>
  );
}
