/**
 * Home Screen - Main dashboard with search and quick recommendations
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Dimensions,
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { RoomCard } from '../../components/RoomCard';
import { Button } from '../../components/Button';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { profile, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecommendations = useCallback(async () => {
        if (!user) return;
        try {
            const data = await api.getRecommendations(user.id, 6);
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecommendations();
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push({
                pathname: '/(tabs)/listings',
                params: { search: searchQuery },
            });
        }
    };

    const isBuyer = profile?.role === 'buyer';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>
                                Hello, {profile?.full_name?.split(' ')[0] || 'there'} 👋
                            </Text>
                            <Text style={styles.subtitle}>
                                {isBuyer ? 'Find your perfect room' : 'Manage your listings'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.avatarButton}
                            onPress={() => router.push('/(tabs)/profile')}
                        >
                            {profile?.avatar_url ? (
                                <Image
                                    source={{ uri: profile.avatar_url }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Ionicons name="person" size={24} color={Colors.primary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.gray400} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by location, university..."
                            placeholderTextColor={Colors.gray400}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        <TouchableOpacity onPress={handleSearch}>
                            <Ionicons name="arrow-forward-circle" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <QuickAction
                        icon="location-outline"
                        label="Nearby"
                        onPress={() => router.push('/(tabs)/listings')}
                    />
                    <QuickAction
                        icon="cash-outline"
                        label="Budget"
                        onPress={() => router.push('/(tabs)/listings')}
                    />
                    <QuickAction
                        icon="star-outline"
                        label="Top Rated"
                        onPress={() => router.push('/(tabs)/listings')}
                    />
                    <QuickAction
                        icon="sparkles-outline"
                        label="AI Match"
                        onPress={() => router.push('/(tabs)/listings')}
                    />
                </View>

                {/* Recommendations Section */}
                {isBuyer && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>🎯 Recommended for You</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/listings')}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Finding your matches...</Text>
                            </View>
                        ) : recommendations.length > 0 ? (
                            <FlatList
                                data={recommendations}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalList}
                                keyExtractor={(item) => item.listing.id}
                                renderItem={({ item }) => (
                                    <View style={styles.horizontalCard}>
                                        <RoomCard
                                            listing={item.listing}
                                            compatibilityScore={item.compatibility_score}
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/listing/[id]',
                                                    params: { id: item.listing.id },
                                                })
                                            }
                                        />
                                    </View>
                                )}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="home-outline" size={48} color={Colors.gray300} />
                                <Text style={styles.emptyText}>No recommendations yet</Text>
                                <Text style={styles.emptySubtext}>
                                    Complete your profile to get personalized matches
                                </Text>
                                <Button
                                    title="Complete Profile"
                                    onPress={() => router.push('/(tabs)/profile')}
                                    variant="outline"
                                    size="small"
                                    style={styles.emptyButton}
                                />
                            </View>
                        )}
                    </View>
                )}

                {/* Seller Quick Stats */}
                {!isBuyer && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📊 Your Dashboard</Text>
                        <View style={styles.statsGrid}>
                            <StatCard title="Active Listings" value="3" icon="home" />
                            <StatCard title="Total Views" value="127" icon="eye" />
                            <StatCard title="Inquiries" value="8" icon="chatbubbles" />
                            <StatCard title="Matches" value="5" icon="heart" />
                        </View>
                        <Button
                            title="Add New Listing"
                            onPress={() => router.push('/(tabs)/profile')}
                            size="large"
                            style={styles.addListingButton}
                        />
                    </View>
                )}

                {/* Tips Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💡 Quick Tips</Text>
                    <View style={styles.tipCard}>
                        <Ionicons name="bulb" size={24} color={Colors.warning} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Complete Your Profile</Text>
                            <Text style={styles.tipText}>
                                A complete profile helps us find better matches for you!
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function QuickAction({
    icon,
    label,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.quickAction} onPress={onPress}>
            <View style={styles.quickActionIcon}>
                <Ionicons name={icon} size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View style={styles.statCard}>
            <Ionicons name={icon} size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
        borderBottomLeftRadius: BorderRadius.xxl,
        borderBottomRightRadius: BorderRadius.xxl,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    subtitle: {
        fontSize: Fonts.sizes.md,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    avatarButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        ...Shadows.md,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        fontSize: Fonts.sizes.md,
        color: Colors.gray900,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.md,
    },
    quickAction: {
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    quickActionLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray700,
        fontWeight: Fonts.weights.medium,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
    },
    seeAll: {
        fontSize: Fonts.sizes.sm,
        color: Colors.primary,
        fontWeight: Fonts.weights.medium,
    },
    horizontalList: {
        paddingRight: Spacing.lg,
    },
    horizontalCard: {
        marginRight: Spacing.md,
        width: (width - Spacing.lg * 3) / 2,
    },
    loadingContainer: {
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xxl,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    emptyText: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray700,
        marginTop: Spacing.md,
    },
    emptySubtext: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
    emptyButton: {
        marginTop: Spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginTop: Spacing.md,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        ...Shadows.sm,
    },
    statValue: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginTop: Spacing.sm,
    },
    statTitle: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        marginTop: Spacing.xs,
    },
    addListingButton: {
        marginTop: Spacing.lg,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginTop: Spacing.md,
    },
    tipContent: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    tipTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
    },
    tipText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        marginTop: 2,
    },
});
