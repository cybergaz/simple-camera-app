import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import MediaScreen from './screens/MediaScreen';
import TestScreen from './screens/TestScreen';
import { RootStackParamList } from './../shared/types/navigation'; // Import the navigation types
import PreviewScreen from './screens/PreviewScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Media" component={MediaScreen} />
                <Stack.Screen name="Test" component={TestScreen} />
                <Stack.Screen name="Preview" component={PreviewScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
