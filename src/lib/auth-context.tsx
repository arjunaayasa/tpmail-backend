'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/services/api';
import { LoginRequest, LoginResponse } from '@/lib/types';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if token exists on mount
        const token = Cookies.get('access_token');
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        const response = await api.post<LoginResponse>('/admin/login', credentials);
        const { access_token, expires_in } = response.data;

        // Store token in cookie (expires in seconds converted to days)
        Cookies.set('access_token', access_token, {
            expires: expires_in / 86400,
            sameSite: 'strict'
        });

        setIsAuthenticated(true);
    };

    const logout = () => {
        Cookies.remove('access_token');
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
