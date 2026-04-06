/**
 * Notifications Screen
 * Creative Design: Clean list with gradient icons, swipe-to-dismiss feel
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

export default function NotificationsScreen() {
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            title: 'Welcome to Room Sathi! 🎉',
            message: 'Complete your profile to start finding matches today.',
            time: '2m ago',
            read: false,
            type: 'system',
            icon: 'sparkles-outline',
            color: '#8b5cf6'
        },
        {
            id: '2',
            title: 'Profile Tips',
            message: 'Adding a bio increases your match rate by 40%.',
            time: '1h ago',
            read: true,
            type: 'tip',
            icon: 'bulb-outline',
            color: '#f59e0b'
        }
    ]);

    const filtered = activeTab === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

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
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <TouchableOpacity style={styles.clearButton}>
                            <Ionicons name="checkmark-done-outline" size={24} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <View style={styles.tabWrapper}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
                        onPress={() => setActiveTab('unread')}
                    >
                        <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>Unread</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {filtered.length > 0 ? (
                    filtered.map((item) => (
                        <View key={item.id} style={[styles.card, !item.read && styles.unreadCard]}>
                            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                                <Ionicons name={item.icon as any} size={24} color={Colors.white} />
                            </View>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </View>
                                <Text style={styles.cardMessage} numberOfLines={2}>
                                    {item.message}
                                </Text>
                            </View>
                            {!item.read && <View style={styles.dot} />}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="notifications-off-outline" size={48} color={Colors.gray400} />
                        </View>
                        <Text style={styles.emptyText}>All caught up!</Text>
                        <Text style={styles.emptySubtext}>
                            You have no new notifications at the moment.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingBottom: 20,
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
    clearButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    tabContainer: {
        paddingHorizontal: Spacing.lg,
        marginTop: -25, // Overlap header
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
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: BorderRadius.full,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.medium,
        color: Colors.gray500,
    },
    activeTabText: {
        color: Colors.white,
        fontWeight: Fonts.weights.bold,
    },
    content: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        alignItems: 'center',
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unreadCard: {
        borderColor: Colors.primary + '30', // Transparent primary
        backgroundColor: '#F0F9FF',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        flex: 1,
    },
    unreadText: {
        color: Colors.primary,
    },
    timeText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray400,
        marginLeft: Spacing.sm,
    },
    cardMessage: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        lineHeight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginLeft: Spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyText: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    emptySubtext: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
        textAlign: 'center',
    },
});
