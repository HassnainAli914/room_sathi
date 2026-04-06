/**
 * Listings Screen - E-commerce style room grid with premium design
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
    TextInput,
    Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { RoomCard } from '../../components/RoomCard';
import { Button } from '../../components/Button';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function ListingsScreen() {
    const { user, profile } = useAuth();
    const { search } = useLocalSearchParams();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState((search as string) || '');
    const [filters, setFilters] = useState({
        minRent: undefined as number | undefined,
        maxRent: undefined as number | undefined,
        hasWifi: false,
        hasAc: false,
    });
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    const fetchListings = useCallback(async () => {
        try {
            // Try to get AI recommendations first
            if (user && profile?.role === 'buyer') {
                const data = await api.getRecommendations(user.id, 20, {
                    location: searchQuery,
                    ...filters,
                });
                setListings(data.recommendations || []);
            } else {
                // Regular listings for sellers or unauthenticated
                const data = await api.getListings({
                    location: searchQuery,
                    min_rent: filters.minRent,
                    max_rent: filters.maxRent,
                    has_wifi: filters.hasWifi ? true : undefined,
                    has_ac: filters.hasAc ? true : undefined,
                });
                setListings(
                    data.listings.map((l: any) => ({
                        listing: l,
                        compatibility_score: undefined,
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            // Fallback to regular listings
            try {
                const data = await api.getListings();
                setListings(
                    data.listings.map((l: any) => ({
                        listing: l,
                        compatibility_score: undefined,
                    }))
                );
            } catch {
                setListings([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, profile, searchQuery, filters]);

    const fetchSavedListings = useCallback(async () => {
        if (!user) return;
        try {
            const data = await api.getSavedListings(user.id);
            setSavedIds(new Set(data.listings.map((l: any) => l.id)));
        } catch (error) {
            console.error('Error fetching saved listings:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchListings();
        fetchSavedListings();
    }, [fetchListings, fetchSavedListings]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const toggleSave = async (listingId: string) => {
        if (!user) return;
        const isSaved = savedIds.has(listingId);
        try {
            if (isSaved) {
                await api.unsaveListing(listingId, user.id);
                setSavedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(listingId);
                    return next;
                });
            } else {
                await api.saveListing(listingId, user.id);
                setSavedIds((prev) => new Set(prev).add(listingId));
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isOdd = index % 2 === 1;
        return (
            <View style={[styles.cardWrapper, isOdd && styles.cardWrapperOdd]}>
                <RoomCard
                    listing={item.listing}
                    compatibilityScore={item.compatibility_score}
                    onPress={() =>
                        router.push({
                            pathname: '/listing/[id]',
                            params: { id: item.listing.id },
                        })
                    }
                    onSave={() => toggleSave(item.listing.id)}
                    isSaved={savedIds.has(item.listing.id)}
                />
            </View>
        );
    };

    const activeFilterCount = [filters.hasWifi, filters.hasAc, filters.maxRent].filter(Boolean).length;

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={[Colors.primary, '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Explore Rooms</Text>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowFilters(true)}
                        >
                            <Ionicons name="options-outline" size={22} color={Colors.white} />
                            {activeFilterCount > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.gray400} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by location, price..."
                            placeholderTextColor={Colors.gray400}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => {
                                setLoading(true);
                                fetchListings();
                            }}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={Colors.gray400} />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Active Filters */}
            {(filters.hasWifi || filters.hasAc || filters.maxRent) && (
                <View style={styles.activeFilters}>
                    {filters.hasWifi && (
                        <FilterChip label="WiFi" onRemove={() => setFilters((f) => ({ ...f, hasWifi: false }))} />
                    )}
                    {filters.hasAc && (
                        <FilterChip label="AC" onRemove={() => setFilters((f) => ({ ...f, hasAc: false }))} />
                    )}
                    {filters.maxRent && (
                        <FilterChip
                            label={`Under ₹${filters.maxRent}`}
                            onRemove={() => setFilters((f) => ({ ...f, maxRent: undefined }))}
                        />
                    )}
                </View>
            )}

            {/* Results Count */}
            <View style={styles.resultsBar}>
                <Text style={styles.resultsText}>
                    {loading ? 'Searching...' : `${listings.length} rooms found`}
                </Text>
            </View>

            {/* Listings Grid */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Finding your perfect room...</Text>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.listing.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="home-outline" size={48} color={Colors.gray400} />
                            </View>
                            <Text style={styles.emptyText}>No rooms found</Text>
                            <Text style={styles.emptySubtext}>
                                Try adjusting your filters or check back later
                            </Text>
                            <Button
                                title="Clear Filters"
                                onPress={() => setFilters({ minRent: undefined, maxRent: undefined, hasWifi: false, hasAc: false })}
                                variant="outline"
                                style={styles.emptyButton}
                            />
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
            <Modal visible={showFilters} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters</Text>
                            <TouchableOpacity onPress={() => setShowFilters(false)}>
                                <Ionicons name="close" size={24} color={Colors.gray700} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Amenities</Text>
                            <View style={styles.filterChips}>
                                <TouchableOpacity
                                    style={[styles.chip, filters.hasWifi && styles.chipActive]}
                                    onPress={() => setFilters((f) => ({ ...f, hasWifi: !f.hasWifi }))}
                                >
                                    <Ionicons
                                        name="wifi"
                                        size={18}
                                        color={filters.hasWifi ? Colors.white : Colors.gray600}
                                    />
                                    <Text
                                        style={[styles.chipText, filters.hasWifi && styles.chipTextActive]}
                                    >
                                        WiFi
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.chip, filters.hasAc && styles.chipActive]}
                                    onPress={() => setFilters((f) => ({ ...f, hasAc: !f.hasAc }))}
                                >
                                    <Ionicons
                                        name="snow-outline"
                                        size={18}
                                        color={filters.hasAc ? Colors.white : Colors.gray600}
                                    />
                                    <Text
                                        style={[styles.chipText, filters.hasAc && styles.chipTextActive]}
                                    >
                                        AC
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.chip, false && styles.chipActive]}
                                    onPress={() => { }}
                                >
                                    <Ionicons name="car-outline" size={18} color={Colors.gray600} />
                                    <Text style={styles.chipText}>Parking</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.chip, false && styles.chipActive]}
                                    onPress={() => { }}
                                >
                                    <Ionicons name="restaurant-outline" size={18} color={Colors.gray600} />
                                    <Text style={styles.chipText}>Kitchen</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <Button
                                title="Reset All"
                                onPress={() =>
                                    setFilters({
                                        minRent: undefined,
                                        maxRent: undefined,
                                        hasWifi: false,
                                        hasAc: false,
                                    })
                                }
                                variant="outline"
                                style={styles.modalButton}
                            />
                            <Button
                                title="Apply Filters"
                                onPress={() => {
                                    setShowFilters(false);
                                    setLoading(true);
                                    fetchListings();
                                }}
                                style={styles.modalButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{label}</Text>
            <TouchableOpacity onPress={onRemove}>
                <Ionicons name="close" size={16} color={Colors.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingBottom: Spacing.xl,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#f59e0b',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        fontSize: 10,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.full,
        marginHorizontal: Spacing.lg,
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
    activeFilters: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.sm,
        flexWrap: 'wrap',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    filterChipText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.primary,
        fontWeight: Fonts.weights.medium,
    },
    resultsBar: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    resultsText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        fontWeight: Fonts.weights.medium,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: 0,
    },
    row: {
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
    },
    cardWrapperOdd: {},
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
        marginTop: Spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.huge,
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
        color: Colors.gray700,
    },
    emptySubtext: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        textAlign: 'center',
        marginTop: Spacing.xs,
        maxWidth: 250,
    },
    emptyButton: {
        marginTop: Spacing.xl,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.xl,
        paddingBottom: Spacing.huge,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: Colors.gray200,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    filterSection: {
        marginBottom: Spacing.xl,
    },
    filterLabel: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray700,
        marginBottom: Spacing.md,
    },
    filterChips: {
        flexDirection: 'row',
        gap: Spacing.sm,
        flexWrap: 'wrap',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray100,
        gap: Spacing.xs,
    },
    chipActive: {
        backgroundColor: Colors.primary,
    },
    chipText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        fontWeight: Fonts.weights.medium,
    },
    chipTextActive: {
        color: Colors.white,
    },
    modalActions: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    modalButton: {
        flex: 1,
    },
});
