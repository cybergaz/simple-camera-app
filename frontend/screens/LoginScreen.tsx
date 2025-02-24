import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = () => {
    const { signIn, signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Simple Camera App</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                }}
                secureTextEntry
                editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setEmail('');
                    setPassword('');
                }}
                disabled={loading}
            >
                <Text style={[styles.switchText, loading && styles.textDisabled]}>
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 40,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        backgroundColor: '#007AFF80',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    switchButton: {
        marginTop: 20,
        padding: 10,
    },
    switchText: {
        color: '#007AFF',
        fontSize: 14,
    },
    textDisabled: {
        color: '#007AFF80',
    },
});
