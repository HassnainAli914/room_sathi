/**
 * Preferences Screen
 * Creative Design: Gradient Header, Card-based settings, Animated toggles look
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function PreferencesScreen() {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [locationServices, setLocationServices] = useState(true);
    const [biometric, setBiometric] = useState(false);

    return (
        <View style={styles.container}>
            {/* Creative Header */}
            <LinearGradient
                colors={[Colors.primary, '#6366f1']}
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
                        <Text style={styles.headerTitle}>Settings</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={styles.headerBanner}>
                        <Text style={styles.bannerTitle}>Personalize Your Experience</Text>
                        <Text style={styles.bannerSubtitle}>Customize how Room Sathi works for you</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                style={styles.scrollView}
            >
                <View style={styles.sectionContainer}>
                    <SectionTitle icon="phone-portrait-outline" title="App Experience" />
                    <View style={styles.card}>
                        <SettingItem
                            label="Dark Mode"
                            subLabel="Easier on the eyes at night"
                            icon="moon"
                            color="#818cf8"
                            value={darkMode}
                            onValueChange={setDarkMode}
                        />
                        <Divider />
                        <SettingItem
                            label="Location Services"
                            subLabel="Better room recommendations"
                            icon="location"
                            color="#34d399"
                            value={locationServices}
                            onValueChange={setLocationServices}
                        />
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <SectionTitle icon="notifications-outline" title="Notifications" />
                    <View style={styles.card}>
                        <SettingItem
                            label="Email Updates"
                            subLabel="Weekly digests and matches"
                            icon="mail"
                            color="#f472b6"
                            value={emailNotifs}
                            onValueChange={setEmailNotifs}
                        />
                        <Divider />
                        <SettingItem
                            label="Push Alerts"
                            subLabel="Instant messages and new rooms"
                            icon="notifications"
                            color="#fbbf24"
                            value={pushNotifs}
                            onValueChange={setPushNotifs}
                        />
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <SectionTitle icon="shield-checkmark-outline" title="Security" />
                    <View style={styles.card}>
                        <SettingItem
                            label="Biometric Login"
                            subLabel="FaceID / TouchID"
                            icon="finger-print"
                            color="#60a5fa"
                            value={biometric}
                            onValueChange={setBiometric}
                        />
                        <Divider />
                        <TouchableOpacity style={styles.linkRow}>
                            <View style={[styles.iconBox, { backgroundColor: '#fca5a5' }]}>
                                <Ionicons name="key-outline" size={20} color={Colors.white} />
                            </View>
                            <View style={styles.linkTextContainer}>
                                <Text style={styles.settingLabel}>Change Password</Text>
                                <Text style={styles.settingSubLabel}>Update your login credentials</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.sectionContainer, { paddingBottom: 40 }]}>
                    <TouchableOpacity style={styles.dangerButton}>
                        <Text style={styles.dangerText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function SectionTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
    return (
        <View style={styles.sectionTitleContainer}>
            <Ionicons name={icon} size={18} color={Colors.gray500} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
}

function SettingItem({
    label,
    subLabel,
    icon,
    color,
    value,
    onValueChange
}: {
    label: string,
    subLabel: string,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    value: boolean,
    onValueChange: (val: boolean) => void
}) {
    return (
        <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: color }]}>
                    <Ionicons name={icon} size={20} color={Colors.white} />
                </View>
                <View>
                    <Text style={styles.settingLabel}>{label}</Text>
                    <Text style={styles.settingSubLabel}>{subLabel}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: Colors.gray200, true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.gray200}
            />
        </View>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slightly different background
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
    headerBanner: {
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.sm,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: Fonts.sizes.md,
        color: 'rgba(255,255,255,0.9)',
    },
    scrollView: {
        marginTop: -20, // Overlap effect
        paddingTop: 20,
    },
    content: {
        padding: Spacing.lg,
    },
    sectionContainer: {
        marginBottom: Spacing.xl,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.xs,
        gap: Spacing.xs,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray500,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        ...Shadows.sm,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    settingSubLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray100,
        marginVertical: Spacing.md,
        width: '100%',
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        gap: Spacing.md,
    },
    linkTextContainer: {
        flex: 1,
    },
    dangerButton: {
        backgroundColor: '#fee2e2',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    dangerText: {
        color: '#ef4444',
        fontWeight: Fonts.weights.bold,
        fontSize: Fonts.sizes.md,
    },
});
