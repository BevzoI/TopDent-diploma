import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "../screens/Auth/Splash";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import PhoneVerify from "../screens/Auth/PhoneVerify";
import Onboarding from "../screens/Onboarding/Onboarding";

const Stack = createNativeStackNavigator();
export default function AuthStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="Onboarding" component={Onboarding}/>
      <Stack.Screen name="Splash" component={Splash}/>
      <Stack.Screen name="Login" component={Login}/>
      <Stack.Screen name="Register" component={Register}/>
      <Stack.Screen name="PhoneVerify" component={PhoneVerify}/>
    </Stack.Navigator>
  );
}
