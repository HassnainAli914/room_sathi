/**
 * About Screen
 * Creative Design: Hero section, Social Links, Version Badge
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Linking,
    Dimensions,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, Shadows, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
    const handleLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={24} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>About Us</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                style={styles.scrollView}
            >
                <View style={styles.card}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="home" size={48} color={Colors.primary} />
                        </View>
                        <Text style={styles.appName}>Room Sathi</Text>
                        <View style={styles.versionBadge}>
                            <Text style={styles.versionText}>v1.0.0 Beta</Text>
                        </View>
                    </View>

                    <Text style={styles.description}>
                        Room Sathi is your AI-powered companion for finding the perfect roommate and living space. We verify every profile and listing to ensure a safe and reliable experience.
                    </Text>

                    <Text style={styles.mission}>
                        "Our mission is to make shared living safer, easier, and more compatible for everyone."
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.socialRow}>
                        <SocialButton icon="logo-instagram" color="#E1306C" onPress={() => handleLink('https://instagram.com')} />
                        <SocialButton icon="logo-twitter" color="#1DA1F2" onPress={() => handleLink('https://twitter.com')} />
                        <SocialButton icon="logo-linkedin" color="#0077B5" onPress={() => handleLink('https://linkedin.com')} />
                        <SocialButton icon="globe-outline" color="#333" onPress={() => handleLink('https://roomsathi.com')} />
                    </View>
                </View>

                <View style={styles.linksCard}>
                    <LinkItem icon="document-text-outline" label="Terms of Service" onPress={() => router.push('/privacy')} />
                    <View style={styles.linkDivider} />
                    <LinkItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => router.push('/privacy')} />
                    <View style={styles.linkDivider} />
                    <LinkItem icon="star-outline" label="Rate App" onPress={() => { }} />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Designed & Developed by</Text>
                    <Text style={styles.footerAuthor}>Hassnain Ali</Text>
                    <Text style={styles.footerCopyright}>© 2024 Room Sathi Inc.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

function SocialButton({ icon, color, onPress }: { icon: any, color: string, onPress: () => void }) {
    return (
        <TouchableOpacity style={[styles.socialButton, { borderColor: color + '40' }]} onPress={onPress}>
            <Ionicons name={icon} size={24} color={color} />
        </TouchableOpacity>
    );
}

function LinkItem({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.linkItem} onPress={onPress}>
            <View style={styles.linkLeft}>
                <Ionicons name={icon} size={20} color={Colors.gray500} />
                <Text style={styles.linkLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingBottom: Spacing.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    scrollView: {
        marginTop: -20,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        ...Shadows.md,
        marginBottom: Spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF', // Light primary
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    appName: {
        fontSize: 28,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    versionBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    versionText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
        fontWeight: Fonts.weights.medium,
    },
    description: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray600,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.lg,
    },
    mission: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray800,
        textAlign: 'center',
        fontStyle: 'italic',
        fontWeight: Fonts.weights.medium,
        marginBottom: Spacing.lg,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: Colors.gray100,
        marginBottom: Spacing.lg,
    },
    socialRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: Colors.white,
    },
    linksCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        ...Shadows.sm,
        marginBottom: Spacing.xl,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    linkLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    linkLabel: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray800,
        fontWeight: Fonts.weights.medium,
    },
    linkDivider: {
        height: 1,
        backgroundColor: Colors.gray100,
        marginLeft: 44, // Align with text
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray400,
    },
    footerAuthor: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray700,
        marginBottom: Spacing.xs,
    },
    footerCopyright: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray400,
        marginTop: Spacing.lg,
    },
});
