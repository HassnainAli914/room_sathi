/**
 * Register Screen
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../../constants/theme';

type UserRole = 'buyer' | 'seller';

export default function RegisterScreen() {
    const { signUp } = useAuth();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = () => {
        if (!role) {
            Alert.alert('Selection Required', 'Please choose whether you want to find or offer a room');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const newErrors: typeof errors = {};
        if (!fullName) newErrors.fullName = 'Name is required';
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleRegister = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        try {
            await signUp(email, password, fullName, role!);
            Alert.alert(
                'Account Created!',
                'Please check your email to verify your account.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => (step === 1 ? router.back() : setStep(1))}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.gray700} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            {step === 1
                                ? 'What are you looking for?'
                                : 'Enter your details to get started'}
                        </Text>
                    </View>

                    {/* Step Indicator */}
                    <View style={styles.stepIndicator}>
                        <View style={[styles.step, styles.stepActive]} />
                        <View style={[styles.step, step === 2 && styles.stepActive]} />
                    </View>

                    {step === 1 ? (
                        <View style={styles.roleSelection}>
                            <RoleCard
                                icon="search"
                                title="Find a Room"
                                description="I'm looking for a room or roommate"
                                selected={role === 'buyer'}
                                onPress={() => setRole('buyer')}
                            />
                            <RoleCard
                                icon="home"
                                title="Offer a Room"
                                description="I have a room available for rent"
                                selected={role === 'seller'}
                                onPress={() => setRole('seller')}
                            />

                            <Button
                                title="Continue"
                                onPress={handleNext}
                                size="large"
                                style={styles.button}
                                disabled={!role}
                            />
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <Input
                                label="Full Name"
                                placeholder="Enter your name"
                                value={fullName}
                                onChangeText={setFullName}
                                icon="person-outline"
                                error={errors.fullName}
                            />

                            <Input
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon="mail-outline"
                                error={errors.email}
                            />

                            <Input
                                label="Password"
                                placeholder="Create a password"
                                value={password}
                                onChangeText={setPassword}
                                isPassword
                                icon="lock-closed-outline"
                                error={errors.password}
                            />

                            <Input
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                isPassword
                                icon="lock-closed-outline"
                                error={errors.confirmPassword}
                            />

                            <Button
                                title="Create Account"
                                onPress={handleRegister}
                                loading={loading}
                                size="large"
                                style={styles.button}
                            />
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function RoleCard({
    icon,
    title,
    description,
    selected,
    onPress,
}: {
    icon: string;
    title: string;
    description: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.roleCard, selected && styles.roleCardSelected]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.roleIcon, selected && styles.roleIconSelected]}>
                <Ionicons
                    name={icon as any}
                    size={32}
                    color={selected ? Colors.white : Colors.primary}
                />
            </View>
            <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
                {title}
            </Text>
            <Text style={styles.roleDescription}>{description}</Text>
            {selected && (
                <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.xxl,
    },
    backButton: {
        marginBottom: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
    },
    stepIndicator: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xxl,
    },
    step: {
        flex: 1,
        height: 4,
        backgroundColor: Colors.gray200,
        borderRadius: BorderRadius.full,
    },
    stepActive: {
        backgroundColor: Colors.primary,
    },
    roleSelection: {
        flex: 1,
    },
    roleCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.gray200,
        alignItems: 'center',
        position: 'relative',
        ...Shadows.sm,
    },
    roleCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: '#EEF2FF',
    },
    roleIcon: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    roleIconSelected: {
        backgroundColor: Colors.primary,
    },
    roleTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    roleTitleSelected: {
        color: Colors.primary,
    },
    roleDescription: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        textAlign: 'center',
    },
    checkmark: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
    },
    form: {
        flex: 1,
    },
    button: {
        marginTop: Spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    footerText: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
    },
    footerLink: {
        fontSize: Fonts.sizes.md,
        color: Colors.primary,
        fontWeight: Fonts.weights.semibold,
        marginLeft: Spacing.xs,
    },
});
