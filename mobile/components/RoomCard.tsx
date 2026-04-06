/**
 * Room Card Component - E-commerce style listing card
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows, Fonts } from '../constants/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - Spacing.lg * 3) / 2;

interface RoomCardProps {
    listing: {
        id: string;
        title: string;
        location: string;
        rent: number;
        photos: string[];
        num_rooms: number;
        num_beds: number;
        has_wifi: boolean;
        has_ac: boolean;
        seller_name?: string;
    };
    compatibilityScore?: number;
    onPress: () => void;
    onSave?: () => void;
    isSaved?: boolean;
}

export function RoomCard({
    listing,
    compatibilityScore,
    onPress,
    onSave,
    isSaved = false,
}: RoomCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return Colors.scoreHigh;
        if (score >= 60) return Colors.scoreMedium;
        return Colors.scoreLow;
    };

    const placeholderImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            {/* Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: listing.photos?.[0] || placeholderImage }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Compatibility Badge */}
                {compatibilityScore !== undefined && (
                    <View
                        style={[
                            styles.scoreBadge,
                            { backgroundColor: getScoreColor(compatibilityScore) },
                        ]}
                    >
                        <Text style={styles.scoreText}>{compatibilityScore}%</Text>
                    </View>
                )}

                {/* Save Button */}
                {onSave && (
                    <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                        <Ionicons
                            name={isSaved ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isSaved ? Colors.error : Colors.white}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {listing.title}
                </Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.gray500} />
                    <Text style={styles.location} numberOfLines={1}>
                        {listing.location}
                    </Text>
                </View>

                <View style={styles.detailsRow}>
                    <View style={styles.detail}>
                        <Ionicons name="bed-outline" size={14} color={Colors.gray500} />
                        <Text style={styles.detailText}>{listing.num_beds}</Text>
                    </View>
                    {listing.has_wifi && (
                        <View style={styles.detail}>
                            <Ionicons name="wifi" size={14} color={Colors.secondary} />
                        </View>
                    )}
                    {listing.has_ac && (
                        <View style={styles.detail}>
                            <Ionicons name="snow-outline" size={14} color={Colors.secondary} />
                        </View>
                    )}
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{listing.rent.toLocaleString()}</Text>
                    <Text style={styles.priceLabel}>/month</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
        ...Shadows.md,
    },
    imageContainer: {
        width: '100%',
        height: 120,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    scoreBadge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    scoreText: {
        color: Colors.white,
        fontSize: Fonts.sizes.xs,
        fontWeight: Fonts.weights.bold,
    },
    saveButton: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: Spacing.md,
    },
    title: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    location: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray500,
        marginLeft: Spacing.xs,
        flex: 1,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    detailText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.bold,
        color: Colors.primary,
    },
    priceLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray400,
        marginLeft: 2,
    },
});
