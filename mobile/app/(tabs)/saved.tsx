/**
 * Saved Listings Screen - Premium Design with Gradient Header
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
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

export default function SavedScreen() {
    const { user } = useAuth();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSaved = useCallback(async () => {
        if (!user) return;
        try {
            const data = await api.getSavedListings(user.id);
            setListings(data.listings || []);
        } catch (error) {
            console.error('Error fetching saved:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSaved();
    }, [fetchSaved]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSaved();
    };

    const handleUnsave = async (listingId: string) => {
        if (!user) return;
        try {
            await api.unsaveListing(listingId, user.id);
            setListings((prev) => prev.filter((l) => l.id !== listingId));
        } catch (error) {
            console.error('Error unsaving:', error);
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <View style={[styles.cardWrapper, index % 2 === 1 && styles.cardWrapperOdd]}>
            <RoomCard
                listing={item}
                onPress={() =>
                    router.push({
                        pathname: '/listing/[id]',
                        params: { id: item.id },
                    })
                }
                onSave={() => handleUnsave(item.id)}
                isSaved={true}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={['#ec4899', '#f43f5e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Saved Rooms</Text>
                            <Text style={styles.headerSubtitle}>
                                {listings.length} {listings.length === 1 ? 'room' : 'rooms'} saved
                            </Text>
                        </View>
                        <View style={styles.heartIcon}>
                            <Ionicons name="heart" size={28} color="rgba(255,255,255,0.9)" />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading your favorites...</Text>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
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
                                <Ionicons name="heart-outline" size={48} color="#f43f5e" />
                            </View>
                            <Text style={styles.emptyText}>No saved rooms yet</Text>
                            <Text style={styles.emptySubtext}>
                                Tap the heart icon on any room to save it for later
                            </Text>
                            <Button
                                title="Browse Rooms"
                                onPress={() => router.push('/(tabs)/listings')}
                                style={styles.emptyButton}
                            />
                        </View>
                    }
                />
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
        paddingBottom: Spacing.xl,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: Fonts.sizes.md,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    heartIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: Spacing.lg,
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
        backgroundColor: '#fce7f3',
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
        lineHeight: 20,
    },
    emptyButton: {
        marginTop: Spacing.xl,
        backgroundColor: '#f43f5e',
    },
});
