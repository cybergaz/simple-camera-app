import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import PreviewScreen from '../screens/PreviewScreen';
import CameraScreen from '../screens/CameraScreen';
import GalleryScreen from '../screens/GalleryScreen';
import { RootStackParamList } from '../../shared/types/navigation';
import { AuthProvider, useAuth } from '../context/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();

export default function NavigationContent() {
    const { user } = useAuth();

    // if (loading) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //             <ActivityIndicator size="large" />
    //         </View>
    //     );
    // }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
                <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Preview" component={PreviewScreen} />
                    <Stack.Screen name="Media" component={CameraScreen} />
                    <Stack.Screen
                        name="Gallery"
                        component={GalleryScreen}
                        options={{
                            title: 'Gallery',
                            headerStyle: {
                                backgroundColor: '#2196F3',
                            },
                            headerTintColor: '#fff',
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
