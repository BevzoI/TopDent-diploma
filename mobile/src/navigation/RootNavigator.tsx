import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

const Stack = createNativeStackNavigator();

export default function RootNavigator(){
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  useEffect(()=>{ (async()=>{ const t = await AsyncStorage.getItem("token"); setIsAuth(!!t); setLoading(false); })(); },[]);
  if(loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false }}>
        {isAuth ? <Stack.Screen name="App" component={AppStack}/> : <Stack.Screen name="Auth" component={AuthStack}/>}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
