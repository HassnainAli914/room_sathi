/**
 * Analytics Screen - Seller Dashboard with Stats & Charts
 * Creative design with cards, progress bars, and insights
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

interface AnalyticsData {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalInquiries: number;
    totalMatches: number;
    conversionRate: number;
    weeklyViews: number[];
    topPerforming: {
        title: string;
        views: number;
        inquiries: number;
    }[];
    recentActivity: {
        type: 'view' | 'inquiry' | 'match';
        listing: string;
        time: string;
    }[];
}

export default function AnalyticsScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

    // Mock data for demo
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalListings: 5,
        activeListings: 4,
        totalViews: 1247,
        totalInquiries: 89,
        totalMatches: 23,
        conversionRate: 7.1,
        weeklyViews: [45, 62, 58, 81, 92, 78, 103],
        topPerforming: [
            { title: '2BHK near IIT Delhi', views: 342, inquiries: 28 },
            { title: 'Cozy PG for Students', views: 256, inquiries: 19 },
            { title: 'Spacious Apartment', views: 198, inquiries: 15 },
        ],
        recentActivity: [
            { type: 'inquiry', listing: '2BHK near IIT Delhi', time: '2 hours ago' },
            { type: 'view', listing: 'Cozy PG for Students', time: '3 hours ago' },
            { type: 'match', listing: '2BHK near IIT Delhi', time: '5 hours ago' },
            { type: 'view', listing: 'Spacious Apartment', time: '6 hours ago' },
            { type: 'inquiry', listing: 'Cozy PG for Students', time: '8 hours ago' },
        ],
    });

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            // In production, fetch from API
            // const response = await api.getSellerAnalytics(user?.id, timeRange);
            // setAnalytics(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics().then(() => setRefreshing(false));
    };

    const getMaxViewValue = () => Math.max(...analytics.weeklyViews);

    const renderStatCard = (
        icon: string,
        label: string,
        value: string | number,
        change?: string,
        color: string = Colors.primary
    ) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            {change && (
                <View style={styles.changeContainer}>
                    <Ionicons
                        name={change.startsWith('+') ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={change.startsWith('+') ? '#22c55e' : '#ef4444'}
                    />
                    <Text style={[
                        styles.changeText,
                        { color: change.startsWith('+') ? '#22c55e' : '#ef4444' }
                    ]}>{change}</Text>
                </View>
            )}
        </View>
    );

    const renderMiniChart = () => {
        const maxValue = getMaxViewValue();
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Weekly Views</Text>
                <View style={styles.chart}>
                    {analytics.weeklyViews.map((value, index) => (
                        <View key={index} style={styles.chartBarContainer}>
                            <View style={styles.chartBarWrapper}>
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    style={[
                                        styles.chartBar,
                                        { height: `${(value / maxValue) * 100}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.chartLabel}>{days[index]}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.chartLegend}>
                    <Text style={styles.chartLegendText}>
                        Total: {analytics.weeklyViews.reduce((a, b) => a + b, 0)} views this week
                    </Text>
                </View>
            </View>
        );
    };

    const renderTopPerforming = () => (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Ionicons name="trophy" size={20} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Top Performing Listings</Text>
            </View>
            {analytics.topPerforming.map((listing, index) => (
                <View key={index} style={styles.performingItem}>
                    <View style={styles.performingRank}>
                        <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.performingInfo}>
                        <Text style={styles.performingTitle} numberOfLines={1}>
                            {listing.title}
                        </Text>
                        <View style={styles.performingStats}>
                            <View style={styles.performingStat}>
                                <Ionicons name="eye-outline" size={14} color={Colors.gray500} />
                                <Text style={styles.performingStatText}>{listing.views}</Text>
                            </View>
                            <View style={styles.performingStat}>
                                <Ionicons name="chatbubble-outline" size={14} color={Colors.gray500} />
                                <Text style={styles.performingStatText}>{listing.inquiries}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.performingProgress}>
                        <View style={[
                            styles.progressFill,
                            { width: `${(listing.views / analytics.topPerforming[0].views) * 100}%` }
                        ]} />
                    </View>
                </View>
            ))}
        </View>
    );

    const renderRecentActivity = () => (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Ionicons name="notifications" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            {analytics.recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                    <View style={[
                        styles.activityIcon,
                        {
                            backgroundColor:
                                activity.type === 'view' ? '#dbeafe' :
                                    activity.type === 'inquiry' ? '#d1fae5' : '#fef3c7'
                        }
                    ]}>
                        <Ionicons
                            name={
                                activity.type === 'view' ? 'eye' :
                                    activity.type === 'inquiry' ? 'chatbubble' : 'heart'
                            }
                            size={16}
                            color={
                                activity.type === 'view' ? '#3b82f6' :
                                    activity.type === 'inquiry' ? '#10b981' : '#f59e0b'
                            }
                        />
                    </View>
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>
                            <Text style={styles.activityType}>
                                {activity.type === 'view' ? 'New view' :
                                    activity.type === 'inquiry' ? 'New inquiry' : 'New match'}
                            </Text>
                            {' on '}
                            <Text style={styles.activityListing}>{activity.listing}</Text>
                        </Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderConversionCard = () => (
        <View style={styles.conversionCard}>
            <View style={styles.conversionHeader}>
                <Ionicons name="analytics" size={24} color="#8b5cf6" />
                <Text style={styles.conversionTitle}>Conversion Rate</Text>
            </View>
            <View style={styles.conversionContent}>
                <Text style={styles.conversionValue}>{analytics.conversionRate}%</Text>
                <Text style={styles.conversionSubtext}>
                    of viewers sent inquiries
                </Text>
            </View>
            <View style={styles.conversionProgress}>
                <View style={[styles.conversionFill, { width: `${analytics.conversionRate}%` }]} />
            </View>
            <View style={styles.conversionBreakdown}>
                <View style={styles.conversionStat}>
                    <Text style={styles.conversionStatValue}>{analytics.totalViews}</Text>
                    <Text style={styles.conversionStatLabel}>Views</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={Colors.gray400} />
                <View style={styles.conversionStat}>
                    <Text style={styles.conversionStatValue}>{analytics.totalInquiries}</Text>
                    <Text style={styles.conversionStatLabel}>Inquiries</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={Colors.gray400} />
                <View style={styles.conversionStat}>
                    <Text style={styles.conversionStatValue}>{analytics.totalMatches}</Text>
                    <Text style={styles.conversionStatLabel}>Matches</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Analytics</Text>
                        <TouchableOpacity style={styles.filterButton}>
                            <Ionicons name="options-outline" size={22} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Time Range Selector */}
                    <View style={styles.timeSelector}>
                        {(['week', 'month', 'all'] as const).map((range) => (
                            <TouchableOpacity
                                key={range}
                                style={[
                                    styles.timeOption,
                                    timeRange === range && styles.timeOptionActive
                                ]}
                                onPress={() => setTimeRange(range)}
                            >
                                <Text style={[
                                    styles.timeOptionText,
                                    timeRange === range && styles.timeOptionTextActive
                                ]}>
                                    {range === 'week' ? 'This Week' :
                                        range === 'month' ? 'This Month' : 'All Time'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Quick Stats Grid */}
                <View style={styles.statsGrid}>
                    {renderStatCard('home', 'Listings', analytics.activeListings, undefined, '#10b981')}
                    {renderStatCard('eye', 'Views', analytics.totalViews.toLocaleString(), '+12%', '#3b82f6')}
                    {renderStatCard('chatbubble', 'Inquiries', analytics.totalInquiries, '+8%', '#8b5cf6')}
                    {renderStatCard('heart', 'Matches', analytics.totalMatches, '+15%', '#ec4899')}
                </View>

                {/* Weekly Views Chart */}
                {renderMiniChart()}

                {/* Conversion Rate Card */}
                {renderConversionCard()}

                {/* Top Performing Listings */}
                {renderTopPerforming()}

                {/* Recent Activity */}
                {renderRecentActivity()}

                {/* Tips Card */}
                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb" size={24} color="#f59e0b" />
                        <Text style={styles.tipsTitle}>Pro Tips</Text>
                    </View>
                    <Text style={styles.tipText}>
                        💡 Add more photos to your listings to increase views by up to 40%
                    </Text>
                    <Text style={styles.tipText}>
                        📍 Include nearby landmarks and transport info for better visibility
                    </Text>
                    <Text style={styles.tipText}>
                        💰 Competitive pricing attracts more quality inquiries
                    </Text>
                </View>
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
        paddingBottom: Spacing.md,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
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
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
    },
    timeOption: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    timeOptionActive: {
        backgroundColor: Colors.white,
    },
    timeOptionText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.medium,
        color: 'rgba(255,255,255,0.8)',
    },
    timeOptionTextActive: {
        color: '#10b981',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    statCard: {
        width: (width - Spacing.lg * 2 - Spacing.md) / 2,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        alignItems: 'center',
        ...Shadows.sm,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    statLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        marginTop: 2,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
        gap: 2,
    },
    changeText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: Fonts.weights.semibold,
    },
    chartContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    chartTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.md,
    },
    chart: {
        flexDirection: 'row',
        height: 120,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    chartBarContainer: {
        flex: 1,
        alignItems: 'center',
    },
    chartBarWrapper: {
        width: 24,
        height: 100,
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    chartBar: {
        width: '100%',
        borderRadius: 12,
    },
    chartLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
        marginTop: Spacing.xs,
    },
    chartLegend: {
        marginTop: Spacing.md,
        alignItems: 'center',
    },
    chartLegendText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
    },
    conversionCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    conversionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    conversionTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    conversionContent: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    conversionValue: {
        fontSize: 48,
        fontWeight: Fonts.weights.bold,
        color: '#8b5cf6',
    },
    conversionSubtext: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
    },
    conversionProgress: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    conversionFill: {
        height: '100%',
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
    },
    conversionBreakdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    conversionStat: {
        alignItems: 'center',
    },
    conversionStatValue: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    conversionStatLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
    },
    sectionCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray100,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    performingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        gap: Spacing.md,
    },
    performingRank: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.bold,
        color: '#f59e0b',
    },
    performingInfo: {
        flex: 1,
    },
    performingTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
    },
    performingStats: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: 2,
    },
    performingStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    performingStatText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
    },
    performingProgress: {
        width: 60,
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10b981',
        borderRadius: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        gap: Spacing.md,
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray700,
    },
    activityType: {
        fontWeight: Fonts.weights.semibold,
    },
    activityListing: {
        color: Colors.gray900,
        fontWeight: Fonts.weights.medium,
    },
    activityTime: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray400,
        marginTop: 2,
    },
    tipsCard: {
        backgroundColor: '#fef3c7',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    tipsTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: '#92400e',
    },
    tipText: {
        fontSize: Fonts.sizes.sm,
        color: '#92400e',
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
});
