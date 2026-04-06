/**
 * Listing Detail Screen
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { MatchScore } from '../../components/MatchScore';
import { WingmanMessage } from '../../components/WingmanMessage';
import { RedFlagBadge } from '../../components/RedFlagBadge';
import { Button } from '../../components/Button';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
    const { id } = useLocalSearchParams();
    const { user, profile } = useAuth();
    const [listing, setListing] = useState<any>(null);
    const [matchData, setMatchData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMatch, setLoadingMatch] = useState(false);

    useEffect(() => {
        fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            const data = await api.getListing(id as string);
            setListing(data);

            // If user is a buyer, fetch match data
            if (user && profile?.role === 'buyer') {
                fetchMatchData(data.seller_id);
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMatchData = async (sellerId: string) => {
        setLoadingMatch(true);
        try {
            // Get compatibility score
            const scoreData = await api.scoreMatch(user!.id, sellerId, id as string);

            // Get red flags
            const flagsData = await api.detectRedFlags(user!.id, sellerId, id as string);

            // Get wingman message
            const wingmanData = await api.getWingmanMessage(
                user!.id,
                sellerId,
                scoreData.compatibility_score,
                flagsData.red_flags
            );

            setMatchData({
                score: scoreData.compatibility_score,
                scoreBreakdown: scoreData.score_breakdown,
                justification: scoreData.justification,
                redFlags: flagsData.red_flags || [],
                overallRisk: flagsData.overall_risk,
                wingman: wingmanData,
            });
        } catch (error) {
            console.error('Error fetching match data:', error);
        } finally {
            setLoadingMatch(false);
        }
    };

    const handleContact = () => {
        if (listing?.users?.phone_number) {
            Linking.openURL(`tel:${listing.users.phone_number}`);
        } else {
            alert('Contact information not available');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!listing) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.gray400} />
                <Text style={styles.errorText}>Listing not found</Text>
            </View>
        );
    }

    const placeholderImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800';
    const isBuyer = profile?.role === 'buyer';

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageGallery}
                >
                    {(listing.photos?.length > 0 ? listing.photos : [placeholderImage]).map(
                        (photo: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: photo }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        )
                    )}
                </ScrollView>

                {/* Floating Back Button - Removed from here, moved to bottom */}

                <View style={styles.content}>
                    {/* Title & Price */}
                    <View style={styles.titleRow}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{listing.title}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={16} color={Colors.gray500} />
                                <Text style={styles.location}>{listing.location}</Text>
                            </View>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>₹{listing.rent?.toLocaleString()}</Text>
                            <Text style={styles.priceLabel}>/month</Text>
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <StatBadge icon="bed-outline" label={`${listing.num_beds} Beds`} />
                        <StatBadge icon="home-outline" label={`${listing.num_rooms} Rooms`} />
                        {listing.deposit && (
                            <StatBadge icon="cash-outline" label={`₹${listing.deposit} Deposit`} />
                        )}
                    </View>

                    {/* Match Score Section (Buyers only) */}
                    {isBuyer && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🎯 Compatibility</Text>
                            {loadingMatch ? (
                                <View style={styles.matchLoading}>
                                    <ActivityIndicator color={Colors.primary} />
                                    <Text style={styles.matchLoadingText}>Analyzing match...</Text>
                                </View>
                            ) : matchData ? (
                                <View style={styles.matchCard}>
                                    <View style={styles.matchScoreRow}>
                                        <MatchScore score={matchData.score} size={80} />
                                        <View style={styles.matchDetails}>
                                            <Text style={styles.matchTitle}>Match Score</Text>
                                            <Text style={styles.matchJustification}>
                                                {matchData.justification}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Score Breakdown */}
                                    {matchData.scoreBreakdown && (
                                        <View style={styles.breakdown}>
                                            <BreakdownItem
                                                label="Budget"
                                                value={matchData.scoreBreakdown.budget}
                                                max={20}
                                            />
                                            <BreakdownItem
                                                label="Location"
                                                value={matchData.scoreBreakdown.location}
                                                max={15}
                                            />
                                            <BreakdownItem
                                                label="Lifestyle"
                                                value={matchData.scoreBreakdown.lifestyle}
                                                max={25}
                                            />
                                            <BreakdownItem
                                                label="Habits"
                                                value={matchData.scoreBreakdown.habits}
                                                max={20}
                                            />
                                            <BreakdownItem
                                                label="Rules"
                                                value={matchData.scoreBreakdown.rules}
                                                max={20}
                                            />
                                        </View>
                                    )}
                                </View>
                            ) : null}

                            {/* Red Flags */}
                            {matchData?.redFlags?.length > 0 && (
                                <View style={styles.redFlagsSection}>
                                    <Text style={styles.redFlagsTitle}>⚠️ Things to Consider</Text>
                                    {matchData.redFlags.map((flag: any, index: number) => (
                                        <RedFlagBadge
                                            key={index}
                                            severity={flag.severity}
                                            description={flag.description}
                                        />
                                    ))}
                                </View>
                            )}

                            {/* Wingman Message */}
                            {matchData?.wingman && (
                                <WingmanMessage
                                    message={matchData.wingman.message}
                                    tone={matchData.wingman.tone}
                                    suggestions={matchData.wingman.suggestions}
                                />
                            )}
                        </View>
                    )}

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏠 Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            <AmenityItem icon="wifi" label="WiFi" available={listing.has_wifi} />
                            <AmenityItem icon="snow-outline" label="AC" available={listing.has_ac} />
                            <AmenityItem
                                icon="shirt-outline"
                                label="Laundry"
                                available={listing.has_laundry}
                            />
                            <AmenityItem
                                icon="restaurant-outline"
                                label="Kitchen"
                                available={listing.has_kitchen}
                            />
                            <AmenityItem
                                icon="car-outline"
                                label="Parking"
                                available={listing.has_parking}
                            />
                            <AmenityItem
                                icon="bed-outline"
                                label="Furnished"
                                available={listing.has_furnished}
                            />
                        </View>
                    </View>

                    {/* Description */}
                    {listing.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📝 Description</Text>
                            <Text style={styles.description}>{listing.description}</Text>
                        </View>
                    )}

                    {/* Seller Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👤 Listed By</Text>
                        <View style={styles.sellerCard}>
                            <View style={styles.sellerAvatar}>
                                <Text style={styles.sellerAvatarText}>
                                    {listing.users?.full_name?.charAt(0) || 'S'}
                                </Text>
                            </View>
                            <View style={styles.sellerInfo}>
                                <Text style={styles.sellerName}>
                                    {listing.users?.full_name || 'Seller'}
                                </Text>
                                <Text style={styles.sellerSince}>Member since 2024</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                <View style={styles.priceInBar}>
                    <Text style={styles.priceInBarValue}>₹{listing.rent?.toLocaleString()}</Text>
                    <Text style={styles.priceInBarLabel}>/month</Text>
                </View>
                <Button title="Contact Seller" onPress={handleContact} style={styles.contactButton} />
            </View>

            {/* Floating Back Button - Fixed Position */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
            >
                <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

function StatBadge({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
    return (
        <View style={styles.statBadge}>
            <Ionicons name={icon} size={18} color={Colors.primary} />
            <Text style={styles.statBadgeText}>{label}</Text>
        </View>
    );
}

function AmenityItem({
    icon,
    label,
    available,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    available: boolean;
}) {
    return (
        <View style={[styles.amenityItem, !available && styles.amenityUnavailable]}>
            <Ionicons
                name={icon}
                size={24}
                color={available ? Colors.secondary : Colors.gray400}
            />
            <Text style={[styles.amenityLabel, !available && styles.amenityLabelUnavailable]}>
                {label}
            </Text>
        </View>
    );
}

function BreakdownItem({ label, value, max }: { label: string; value: number; max: number }) {
    const percentage = (value / max) * 100;
    return (
        <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{label}</Text>
                <Text style={styles.breakdownValue}>{value}/{max}</Text>
            </View>
            <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { width: `${percentage}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: Fonts.sizes.lg,
        color: Colors.gray500,
        marginTop: Spacing.md,
    },
    imageGallery: {
        height: 300,
    },
    image: {
        width: width,
        height: 300,
    },
    content: {
        padding: Spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    titleContainer: {
        flex: 1,
        marginRight: Spacing.md,
    },
    title: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    location: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
        marginLeft: Spacing.xs,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.primary,
    },
    priceLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    statBadgeText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.primary,
        fontWeight: Fonts.weights.medium,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
        marginBottom: Spacing.md,
    },
    matchLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
    },
    matchLoadingText: {
        marginLeft: Spacing.md,
        color: Colors.gray500,
    },
    matchCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
    matchScoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    matchDetails: {
        flex: 1,
        marginLeft: Spacing.lg,
    },
    matchTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    matchJustification: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        lineHeight: 20,
    },
    breakdown: {
        marginTop: Spacing.lg,
        paddingTop: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.gray200,
    },
    breakdownItem: {
        marginBottom: Spacing.sm,
    },
    breakdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    breakdownLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
    },
    breakdownValue: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
    },
    breakdownBar: {
        height: 4,
        backgroundColor: Colors.gray200,
        borderRadius: BorderRadius.full,
    },
    breakdownFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.full,
    },
    redFlagsSection: {
        marginTop: Spacing.lg,
    },
    redFlagsTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray700,
        marginBottom: Spacing.sm,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    amenityItem: {
        width: '30%',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    amenityUnavailable: {
        opacity: 0.5,
    },
    amenityLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray700,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    amenityLabelUnavailable: {
        textDecorationLine: 'line-through',
    },
    description: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray700,
        lineHeight: 24,
    },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    sellerAvatar: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerAvatarText: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    sellerInfo: {
        marginLeft: Spacing.md,
    },
    sellerName: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
    },
    sellerSince: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray200,
        ...Shadows.lg,
    },
    priceInBar: {
        flex: 1,
    },
    priceInBarValue: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    priceInBarLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
    },
    contactButton: {
        minWidth: 160,
    },
    backButton: {
        position: 'absolute',
        top: 20, // Adjust based on requirement (or use SafeArea styling)
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
        zIndex: 10,
    },
});
