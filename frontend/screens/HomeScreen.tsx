import React from 'react';
import { View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../shared/types/navigation'; // Import the navigation types
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp
import { useAuth } from '../context/AuthContext';

// Define the navigation prop type for the HomeScreen
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const { signOut } = useAuth();
    const navigation = useNavigation<HomeScreenNavigationProp>();

    return (
        <View style={{ flex: 1, justifyContent: 'center', gap: 50, alignItems: 'center' }}>
            <Button title="Capture Media" onPress={() => navigation.navigate('Media')} />
            <Button title="Sign Out" onPress={() => signOut()} />
        </View>
    );
};

export default HomeScreen;
