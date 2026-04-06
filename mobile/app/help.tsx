/**
 * Help Center Screen
 * Creative Design: Search bar, Popular Topic Grids, Modern Accordion
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function HelpScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, '#8b5cf6']}
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
                        <Text style={styles.headerTitle}>Help Center</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.searchContainer}>
                        <Text style={styles.greeting}>How can we help you?</Text>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={Colors.gray400} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for answers..."
                                placeholderTextColor={Colors.gray400}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                style={styles.scrollView}
            >
                {/* Popular Topics Grid */}
                <Text style={styles.sectionTitle}>Popular Topics</Text>
                <View style={styles.grid}>
                    <TopicCard icon="home-outline" title="Finding Rooms" color="#60a5fa" />
                    <TopicCard icon="person-outline" title="Account" color="#f472b6" />
                    <TopicCard icon="shield-checkmark-outline" title="Safety" color="#34d399" />
                    <TopicCard icon="card-outline" title="Payments" color="#f59e0b" />
                </View>

                {/* FAQ Section */}
                <Text style={styles.sectionTitle}>Frequently Asked</Text>

                <Accordion title="How do I verified my profile?">
                    Go to Edit Profile and upload a valid government ID. Our team will verify it within 24 hours.
                </Accordion>

                <Accordion title="Is it free to list a room?">
                    Yes! Basic listings are free. You can pay to boost your listing to reach more potential roommates.
                </Accordion>

                <Accordion title="How does the AI matching work?">
                    We analyze 20+ compatibility factors including sleep schedule, cleanliness, and social habits to score matches.
                </Accordion>

                {/* Contact Support Banner */}
                <TouchableOpacity style={styles.contactBanner} activeOpacity={0.9}>
                    <View style={styles.contactContent}>
                        <Text style={styles.contactTitle}>Still stuck?</Text>
                        <Text style={styles.contactSubtitle}>Our team is here to help 24/7</Text>
                    </View>
                    <View style={styles.contactButton}>
                        <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function TopicCard({ icon, title, color }: { icon: any, title: string, color: string }) {
    return (
        <TouchableOpacity style={styles.topicCard}>
            <View style={[styles.topicIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.topicTitle}>{title}</Text>
        </TouchableOpacity>
    );
}

function Accordion({ title, children }: { title: string; children: string }) {
    const [expanded, setExpanded] = React.useState(false);

    return (
        <TouchableOpacity
            style={styles.accordion}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.8}
        >
            <View style={styles.accordionHeader}>
                <Text style={[styles.accordionTitle, expanded && styles.activeTitle]}>{title}</Text>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={expanded ? Colors.primary : Colors.gray400}
                />
            </View>
            {expanded && (
                <View style={styles.accordionBody}>
                    <View style={styles.accordionLine} />
                    <Text style={styles.accordionContent}>{children}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginRight: Spacing.md,
    },
    headerTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    searchContainer: {
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.sm,
    },
    greeting: {
        fontSize: 24,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
        marginBottom: Spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.lg,
        height: 50,
        ...Shadows.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.md,
        fontSize: Fonts.sizes.md,
        color: Colors.gray900,
    },
    scrollView: {
        marginTop: -20,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    topicCard: {
        width: (width - Spacing.lg * 2 - Spacing.md) / 2, // 2 columns
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    topicIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    topicTitle: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.medium,
        color: Colors.gray700,
    },
    accordion: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    accordionTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.medium,
        color: Colors.gray800,
        flex: 1,
        marginRight: Spacing.sm,
    },
    activeTitle: {
        color: Colors.primary,
        fontWeight: Fonts.weights.bold,
    },
    accordionBody: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    accordionLine: {
        height: 1,
        backgroundColor: Colors.gray100,
        marginBottom: Spacing.md,
    },
    accordionContent: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        lineHeight: 22,
    },
    contactBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.gray900,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginTop: Spacing.xl,
        ...Shadows.lg,
    },
    contactContent: {
        flex: 1,
    },
    contactTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
        marginBottom: 2,
    },
    contactSubtitle: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray400,
    },
    contactButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
