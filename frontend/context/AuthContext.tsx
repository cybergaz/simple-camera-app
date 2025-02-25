import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

type User = {
    id: number;
    email: string;
};

type AuthContextType = {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const signUp = async (email: string, password: string) => {
        // Check if user already exists
        const response = await
            axios.post(
                `http://${process.env.EXPO_PUBLIC_SERVER_HOST}:${process.env.EXPO_PUBLIC_SERVER_PORT}/auth/signup`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
        console.log(response.data);
        // const { data: existingUser } = await supabase
        //     .from('users')
        //     .select()
        //     .eq('email', email)
        //     .single();
        //
        // if (!response) {
        // }
        //
        // const { data, error } = await supabase
        //     .from('users')
        //     .insert([{ email, password }])
        //     .select()
        //     .single();
        // console.log(data)

        // if (error) {
        //     throw new Error('Failed to create account');
        // }
        //
        if (response.status === 401) {
            throw new Error('Email already registered');
        }

        if (response.status === 201) {
            setUser({ id: response.data.user.id, email: response.data.user.email });
        } else {
            throw new Error('Failed to create account');
        }
    };

    const signIn = async (email: string, password: string) => {

        const response = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_HOST}:${process.env.EXPO_PUBLIC_SERVER_PORT}/auth/signin`, { email, password }, { headers: { 'Content-Type': 'application/json' } });

        if (response.status === 401) {
            throw new Error('Invalid email or password');
        }

        if (response.status === 200) {
            setUser({ id: response.data.user.id, email: response.data.user.email });
        } else {
            throw new Error('something went wrong');
        }
    };

    const signOut = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
