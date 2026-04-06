/**
 * Auth Context - Global authentication state
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'buyer' | 'seller';
    avatar_url: string | null;
    // Extended profile fields (from profiles table)
    age?: number | null;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    city?: string | null;
    university?: string | null;
    monthly_budget_min?: number | null;
    monthly_budget_max?: number | null;
    preferred_location?: string | null;
    cleanliness?: 'very_clean' | 'clean' | 'moderate' | 'relaxed' | null;
    sleep_schedule?: 'early_bird' | 'night_owl' | 'flexible' | null;
    study_habits?: 'quiet_studier' | 'group_studier' | 'flexible' | null;
    food_preference?: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference' | null;
    noise_tolerance?: 'silent' | 'low' | 'moderate' | 'high' | null;
    smoking?: 'smoker' | 'non_smoker' | 'outdoor_only' | null;
    guests_allowed?: boolean | null;
    pets_allowed?: boolean | null;
    move_in_date?: string | null;
    contact_preference?: 'phone' | 'email' | 'whatsapp' | 'any' | null;
    phone_number?: string | null;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await loadProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadProfile = async (userId: string) => {
        try {
            // 1. Try to load from cache first
            const cachedProfile = await AsyncStorage.getItem(`profile_${userId}`);
            if (cachedProfile) {
                setProfile(JSON.parse(cachedProfile));
            }

            // 2. Fetch fresh data
            const data = await api.getCurrentUser(userId);

            // 3. Update state and cache
            if (data.user) {
                setProfile(data.user);
                await AsyncStorage.setItem(`profile_${userId}`, JSON.stringify(data.user));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, fullName: string, role: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role,
                },
            },
        });
        if (error) throw error;
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;

        // Check if user exists in database
        if (data.user) {
            try {
                const response = await api.getProfile(data.user.id);
                if (!response?.data?.user) {
                    // Only warn - don't auto-logout for potential network issues
                    console.warn('Profile may not exist, keeping session to retry');
                }
            } catch (err: any) {
                // Check error type - only logout for explicit 404
                const isNotFound = err.response?.status === 404;
                const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
                const isNetworkError = err.code === 'ERR_NETWORK' || err.message?.includes('Network Error');

                if (isNotFound) {
                    await supabase.auth.signOut();
                    throw new Error('User not found. Please sign up first.');
                }

                // For timeout/network errors, keep session - Supabase auth is valid
                if (isTimeout || isNetworkError) {
                    console.warn('Network issue during login, keeping session:', err.message);
                    return; // Profile will load from cache
                }

                console.warn('Profile check warning:', err);
            }
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // Clear cache on sign out if desired, or keep it. Keeping it allows quick re-login view.
        // Usually good to clear sensitive data if not on personal device, but for now specific clearing isn't requested.
        // To be safe/clean:
        if (user) {
            await AsyncStorage.removeItem(`profile_${user.id}`);
        }
        setProfile(null);
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        // Update via API
        await api.updateProfile(user.id, data);
        // Reload profile
        await loadProfile(user.id);
    };

    const refreshProfile = async () => {
        if (!user) return;
        await loadProfile(user.id);
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                profile,
                loading,
                signUp,
                signIn,
                signOut,
                updateProfile,
                refreshProfile,
            }}
        >
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
