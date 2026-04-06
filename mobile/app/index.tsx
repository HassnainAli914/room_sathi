/**
 * Index Screen - Splash/Welcome screen with navigation
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Colors, Spacing, Fonts } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
    const { session, loading } = useAuth();

    useEffect(() => {
        if (!loading && session) {
            router.replace('/(tabs)/home');
        }
    }, [session, loading]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.logo}>🏠</Text>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.logo}>🏠</Text>
                    <Text style={styles.title}>Room Sathi</Text>
                    <Text style={styles.subtitle}>
                        Find your perfect roommate with AI-powered matching
                    </Text>
                </View>

                <View style={styles.features}>
                    <FeatureItem
                        icon="🎯"
                        title="Smart Matching"
                        description="AI-powered compatibility scoring"
                    />
                    <FeatureItem
                        icon="🛡️"
                        title="Safety First"
                        description="Red flag detection for your security"
                    />
                    <FeatureItem
                        icon="💬"
                        title="Wingman AI"
                        description="Personalized recommendations"
                    />
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Get Started"
                        onPress={() => router.push('/(auth)/register')}
                        variant="secondary"
                        size="large"
                        style={styles.primaryButton}
                    />
                    <Button
                        title="I already have an account"
                        onPress={() => router.push('/(auth)/login')}
                        variant="ghost"
                        size="medium"
                        textStyle={styles.secondaryButtonText}
                    />
                </View>
            </View>
        </LinearGradient>
    );
}

function FeatureItem({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
    },
    loadingText: {
        color: Colors.white,
        fontSize: Fonts.sizes.lg,
        marginTop: Spacing.md,
    },
    content: {
        flex: 1,
        padding: Spacing.xxl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.huge,
    },
    logo: {
        fontSize: 80,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Fonts.sizes.xxxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: Fonts.sizes.lg,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    features: {
        marginBottom: Spacing.huge,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    featureIcon: {
        fontSize: 32,
        marginRight: Spacing.lg,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.semibold,
        color: Colors.white,
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: Fonts.sizes.sm,
        color: 'rgba(255,255,255,0.7)',
    },
    actions: {
        alignItems: 'center',
    },
    primaryButton: {
        width: '100%',
        marginBottom: Spacing.md,
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.9)',
    },
});
