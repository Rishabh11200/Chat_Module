import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

export type AllNavList = {
  LatestChat: {
    from: string;
    to: string;
    title: string;
    senderName: string;
  };
  First: undefined;
  Eg: {
    from: number;
    to: number;
    title?: string;
  };
  AllChat: {userName: any};
};

const Stack = createNativeStackNavigator<AllNavList>();

import First from '../Screens/First';
import Eg from '../Screens/eg';
import AllChat from '../Screens/AllChat';
import LatestChat from '../Screens/LatestChat';

export default function Navigation(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{orientation: 'all'}}>
        <Stack.Screen name="First" component={First} />
        <Stack.Screen
          name="Eg"
          component={Eg}
          options={({route}) => ({title: route.params.title})}
        />
        <Stack.Screen name="AllChat" component={AllChat} />
        <Stack.Screen
          name="LatestChat"
          component={LatestChat}
          options={({route}) => ({title: route.params.title})}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
