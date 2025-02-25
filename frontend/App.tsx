import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import NavigationContent from './navigation/AppNavigator';

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <NavigationContent />
            </NavigationContainer>
        </AuthProvider>
    );
}
