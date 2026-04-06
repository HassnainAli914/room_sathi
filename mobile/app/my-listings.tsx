/**
 * My Listings Screen - View/Manage Seller's Listings
 * Creative design with listing cards and status badges
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    Dimensions,
    Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

interface Listing {
    id: string;
    title: string;
    rent_amount: number;
    city: string;
    property_type: string;
    room_type: string;
    images: string[];
    is_active: boolean;
    created_at: string;
    views_count?: number;
    inquiries_count?: number;
}

export default function MyListingsScreen() {
    const { user } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = async () => {
        try {
            const response = await api.getMyListings(user?.id || '');
            setListings(response.data?.listings || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchListings();
        }, [user?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const handleDeleteListing = (id: string) => {
        Alert.alert(
            'Delete Listing',
            'Are you sure you want to delete this listing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteListing(id);
                            setListings(prev => prev.filter(l => l.id !== id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete listing');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleStatus = async (listing: Listing) => {
        try {
            await api.updateListing(listing.id, { is_active: !listing.is_active });
            setListings(prev => prev.map(l =>
                l.id === listing.id ? { ...l, is_active: !l.is_active } : l
            ));
        } catch (error) {
            Alert.alert('Error', 'Failed to update listing status');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderListingCard = (listing: Listing) => (
        <TouchableOpacity
            key={listing.id}
            style={styles.listingCard}
            onPress={() => router.push(`/listing/${listing.id}`)}
            activeOpacity={0.9}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {listing.images?.[0] ? (
                    <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
                ) : (
                    <View style={styles.noImage}>
                        <Ionicons name="image-outline" size={40} color={Colors.gray400} />
                    </View>
                )}
                {/* Status Badge */}
                <View style={[
                    styles.statusBadge,
                    listing.is_active ? styles.statusActive : styles.statusInactive
                ]}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: listing.is_active ? '#22c55e' : '#ef4444' }
                    ]} />
                    <Text style={styles.statusText}>
                        {listing.is_active ? 'Active' : 'Paused'}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                    {listing.title}
                </Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.gray500} />
                    <Text style={styles.locationText}>{listing.city}</Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.propertyType}>{listing.property_type}</Text>
                </View>
                <Text style={styles.rentPrice}>
                    ₹{listing.rent_amount.toLocaleString()}<Text style={styles.perMonth}>/month</Text>
                </Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={16} color={Colors.gray500} />
                        <Text style={styles.statValue}>{listing.views_count || 0}</Text>
                        <Text style={styles.statLabel}>Views</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="chatbubble-outline" size={16} color={Colors.gray500} />
                        <Text style={styles.statValue}>{listing.inquiries_count || 0}</Text>
                        <Text style={styles.statLabel}>Inquiries</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="calendar-outline" size={16} color={Colors.gray500} />
                        <Text style={styles.statLabel}>{formatDate(listing.created_at)}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => router.push(`/edit-listing/${listing.id}`)}
                    >
                        <Ionicons name="pencil" size={16} color="#3b82f6" />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            listing.is_active ? styles.pauseButton : styles.resumeButton
                        ]}
                        onPress={() => handleToggleStatus(listing)}
                    >
                        <Ionicons
                            name={listing.is_active ? 'pause' : 'play'}
                            size={16}
                            color={listing.is_active ? '#f59e0b' : '#22c55e'}
                        />
                        <Text style={[
                            styles.actionButtonText,
                            { color: listing.is_active ? '#f59e0b' : '#22c55e' }
                        ]}>
                            {listing.is_active ? 'Pause' : 'Resume'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteListing(listing.id)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <Ionicons name="home-outline" size={60} color="#10b981" />
            </View>
            <Text style={styles.emptyTitle}>No Listings Yet</Text>
            <Text style={styles.emptySubtitle}>
                Start adding your properties to find the perfect tenants
            </Text>
            <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => router.push('/add-listing')}
            >
                <Ionicons name="add" size={20} color={Colors.white} />
                <Text style={styles.addFirstButtonText}>Add Your First Listing</Text>
            </TouchableOpacity>
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
                        <Text style={styles.headerTitle}>My Listings</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push('/add-listing')}
                        >
                            <Ionicons name="add" size={24} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.headerStats}>
                        <View style={styles.headerStatItem}>
                            <Text style={styles.headerStatValue}>{listings.length}</Text>
                            <Text style={styles.headerStatLabel}>Total</Text>
                        </View>
                        <View style={styles.headerStatDivider} />
                        <View style={styles.headerStatItem}>
                            <Text style={styles.headerStatValue}>
                                {listings.filter(l => l.is_active).length}
                            </Text>
                            <Text style={styles.headerStatLabel}>Active</Text>
                        </View>
                        <View style={styles.headerStatDivider} />
                        <View style={styles.headerStatItem}>
                            <Text style={styles.headerStatValue}>
                                {listings.reduce((sum, l) => sum + (l.views_count || 0), 0)}
                            </Text>
                            <Text style={styles.headerStatLabel}>Total Views</Text>
                        </View>
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
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading your listings...</Text>
                    </View>
                ) : listings.length === 0 ? (
                    renderEmptyState()
                ) : (
                    listings.map(renderListingCard)
                )}
            </ScrollView>

            {/* Floating Add Button */}
            {listings.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/add-listing')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.fabGradient}
                    >
                        <Ionicons name="add" size={28} color={Colors.white} />
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingBottom: Spacing.lg,
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.xl,
    },
    headerStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    headerStatValue: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    headerStatLabel: {
        fontSize: Fonts.sizes.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    headerStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    loadingContainer: {
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
    },
    listingCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    imageContainer: {
        height: 160,
        position: 'relative',
    },
    listingImage: {
        width: '100%',
        height: '100%',
    },
    noImage: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    statusActive: {
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
    },
    statusInactive: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: Fonts.weights.semibold,
        color: Colors.white,
    },
    cardContent: {
        padding: Spacing.md,
    },
    listingTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    locationText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        marginLeft: 4,
    },
    dotSeparator: {
        marginHorizontal: Spacing.xs,
        color: Colors.gray400,
    },
    propertyType: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        textTransform: 'capitalize',
    },
    rentPrice: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: '#10b981',
    },
    perMonth: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.normal,
        color: Colors.gray500,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
        gap: Spacing.lg,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray700,
    },
    statLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: 4,
    },
    editButton: {
        backgroundColor: '#eff6ff',
        flex: 1,
        justifyContent: 'center',
    },
    editButtonText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.semibold,
        color: '#3b82f6',
    },
    pauseButton: {
        backgroundColor: '#fef3c7',
    },
    resumeButton: {
        backgroundColor: '#d1fae5',
    },
    actionButtonText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.semibold,
    },
    deleteButton: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: Spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xxl,
        marginTop: Spacing.xxl,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#d1fae5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    addFirstButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b981',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
        ...Shadows.md,
    },
    addFirstButtonText: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    fab: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.lg,
        ...Shadows.lg,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
