import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home/index';
import SplashScreen from '../screens/Splash/index';
import PhoneScreen from '../screens/Auth/Phone';
import CodeScreen from '../screens/Auth/Code';
import PasswordScreen from '../screens/Auth/Password';
import ChatScreen from '../screens/chat/index';
import ProfileScreen from '../screens/Profile/index';
import EditProfile from '../screens/EditProfile/index'

import { Screen } from '../utils/Constants';

const Stack = createNativeStackNavigator();

function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Screen.SPLASH}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name={Screen.SPLASH} component={SplashScreen} />
        <Stack.Screen name={Screen.HOME} component={HomeScreen} />
        <Stack.Screen name={Screen.PHONE} component={PhoneScreen} />
        <Stack.Screen name={Screen.CODE} component={CodeScreen} />
        <Stack.Screen name={Screen.PASSWORD} component={PasswordScreen} />
        <Stack.Screen name={Screen.CHAT} component={ChatScreen} />
        <Stack.Screen name={Screen.PROFILE} component={ProfileScreen} />
        <Stack.Screen name={Screen.EDITPROFILE} component={EditProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Routes;
