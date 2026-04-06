/**
 * Terms & Privacy Screen
 * Creative Design: Tabbed interface content reading
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function PrivacyScreen() {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

    return (
        <View style={styles.container}>
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
                        <Text style={styles.headerTitle}>Legal</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <View style={styles.tabWrapper}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
                        onPress={() => setActiveTab('privacy')}
                    >
                        <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
                        onPress={() => setActiveTab('terms')}
                    >
                        <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>Terms of Service</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                style={styles.scrollView}
            >
                <View style={styles.card}>
                    {activeTab === 'privacy' ? (
                        <>
                            <Text style={styles.lastUpdated}>Last Updated: December 28, 2024</Text>

                            <SectionTitle title="1. Information We Collect" />
                            <Paragraph>
                                We collect information you provide directly to us, such as your name, email address, profile photo, and living preferences when you create an account or update your profile.
                            </Paragraph>

                            <SectionTitle title="2. How We Use Your Data" />
                            <Paragraph>
                                We use your info to provide matched recommendations, facilitate contact between users, and improve our matchmaking AI. Your safety is our priority.
                            </Paragraph>

                            <SectionTitle title="3. Data Sharing" />
                            <Paragraph>
                                We do not sell your personal data. We only share contact details with other users when you explicitly initiate contact or accept a match request.
                            </Paragraph>
                        </>
                    ) : (
                        <>
                            <Text style={styles.lastUpdated}>Effective Date: January 1, 2025</Text>

                            <SectionTitle title="1. Acceptance of Terms" />
                            <Paragraph>
                                By accessing or using Room Sathi, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
                            </Paragraph>

                            <SectionTitle title="2. User Conduct" />
                            <Paragraph>
                                You agree to use the app responsibly. Harassment, hate speech, or fraudulent listings will result in immediate account termination.
                            </Paragraph>

                            <SectionTitle title="3. Content Ownership" />
                            <Paragraph>
                                You retain rights to photos you upload, but grant us a license to display them on the platform.
                            </Paragraph>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function SectionTitle({ title }: { title: string }) {
    return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Paragraph({ children }: { children: string }) {
    return <Text style={styles.paragraph}>{children}</Text>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingBottom: 20,
        height: 120,
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
    tabContainer: {
        paddingHorizontal: Spacing.lg,
        marginTop: -30,
        marginBottom: Spacing.lg,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.full,
        padding: 4,
        ...Shadows.md,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: BorderRadius.full,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.medium,
        color: Colors.gray600,
    },
    activeTabText: {
        color: Colors.white,
        fontWeight: Fonts.weights.bold,
    },
    scrollView: {
        marginTop: 0,
    },
    content: {
        padding: Spacing.lg,
        paddingTop: 0,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        ...Shadows.sm,
        minHeight: 400,
    },
    lastUpdated: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray400,
        fontStyle: 'italic',
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
    },
    paragraph: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        lineHeight: 24,
        marginBottom: Spacing.md,
    },
});
