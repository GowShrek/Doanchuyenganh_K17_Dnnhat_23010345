import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { requestAuth, requestLogout } from '../config/userRequest';

const AuthContext = createContext(null);

const SECRET = import.meta.env.VITE_SECRET_CRYPTO;

const decryptUser = (encryptedData) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const isLoggedIn = Cookies.get('logged') === '1';
            if (!isLoggedIn) {
                setUser(null);
                setLoading(false);
                return;
            }
            const res = await requestAuth();
            const decrypted = decryptUser(res.metadata);
            setUser(decrypted);
        } catch {
            setUser(null);
            Cookies.remove('logged');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            await requestLogout();
        } catch {}
        Cookies.remove('logged');
        setUser(null);
        window.location.href = '/';
    }, []);

    const isAdmin = user?.role === 'admin';
    const isLibrarian = user?.role === 'librarian';
    const isReader = user?.role === 'reader';
    const isStaff = isAdmin || isLibrarian;

    return (
        <AuthContext.Provider value={{ user, loading, fetchUser, logout, isAdmin, isLibrarian, isReader, isStaff }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
