/**
 * Profile Screen - Premium Design with Gradient Header
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../../constants/theme';

export default function ProfileScreen() {
    const { profile, signOut, user } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutPress = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);
        setLoggingOut(true);
        try {
            await signOut();
            router.replace('/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const isSeller = profile?.role === 'seller';

    // Calculate profile completion percentage
    const calculateCompletion = () => {
        if (!profile) return 0;

        const fields = [
            profile.full_name,
            profile.age,
            profile.gender,
            profile.city,
            profile.university,
            profile.avatar_url,
            profile.monthly_budget_min,
            profile.monthly_budget_max,
            profile.preferred_location,
            profile.cleanliness,
            profile.sleep_schedule,
            profile.food_preference,
            profile.smoking,
            profile.phone_number,
            profile.contact_preference,
        ];

        const filledFields = fields.filter(field => field !== null && field !== undefined && field !== '').length;
        return Math.round((filledFields / fields.length) * 100);
    };

    const completionPercent = calculateCompletion();

    return (
        <View style={styles.container}>
            {/* Logout Confirmation Modal */}
            <ConfirmModal
                visible={showLogoutModal}
                title="Sign Out"
                message="Are you sure you want to sign out of your account?"
                confirmText="Sign Out"
                cancelText="Cancel"
                confirmColor={Colors.error}
                icon="log-out-outline"
                iconColor={Colors.error}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Gradient Header with Profile Info */}
                <LinearGradient
                    colors={[Colors.primary, '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerTop}>
                            <Text style={styles.headerLabel}>My Profile</Text>
                            <TouchableOpacity
                                style={styles.settingsButton}
                                onPress={() => router.push('/preferences')}
                            >
                                <Ionicons name="settings-outline" size={22} color={Colors.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileSection}>
                            <View style={styles.avatar}>
                                {profile?.avatar_url ? (
                                    <Image
                                        source={{ uri: profile.avatar_url }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                            <View style={styles.badge}>
                                <Ionicons
                                    name={isSeller ? 'home' : 'search'}
                                    size={14}
                                    color={Colors.white}
                                />
                                <Text style={styles.badgeText}>
                                    {isSeller ? 'Room Offerer' : 'Room Seeker'}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => router.push('/edit-profile')}
                            >
                                <Ionicons name="pencil" size={16} color={Colors.primary} />
                                <Text style={styles.editButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Content */}
                <View style={styles.content}>
                    {/* Profile Completion */}
                    <View style={styles.completionCard}>
                        <View style={styles.completionHeader}>
                            <View style={styles.completionLeft}>
                                <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
                                <View>
                                    <Text style={styles.completionTitle}>Profile Completion</Text>
                                    <Text style={styles.completionHint}>Complete for better matches</Text>
                                </View>
                            </View>
                            <Text style={styles.completionPercent}>{completionPercent}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Matches</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>8</Text>
                            <Text style={styles.statLabel}>Saved</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>3</Text>
                            <Text style={styles.statLabel}>Chats</Text>
                        </View>
                    </View>

                    {/* Menu Sections */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <View style={styles.menuCard}>
                            <MenuItem
                                icon="notifications-outline"
                                label="Notifications"
                                color="#f59e0b"
                                onPress={() => router.push('/notifications')}
                            />
                            <Divider />
                            <MenuItem
                                icon="settings-outline"
                                label="Preferences"
                                color="#8b5cf6"
                                onPress={() => router.push('/preferences')}
                            />
                        </View>
                    </View>

                    {isSeller && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Seller Tools</Text>
                            <View style={styles.menuCard}>
                                <MenuItem
                                    icon="add-circle-outline"
                                    label="Add New Listing"
                                    color="#10b981"
                                    onPress={() => router.push('/add-listing')}
                                />
                                <Divider />
                                <MenuItem
                                    icon="list-outline"
                                    label="My Listings"
                                    color="#3b82f6"
                                    onPress={() => router.push('/my-listings')}
                                />
                                <Divider />
                                <MenuItem
                                    icon="stats-chart-outline"
                                    label="Analytics"
                                    color="#ec4899"
                                    onPress={() => router.push('/analytics')}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Support</Text>
                        <View style={styles.menuCard}>
                            <MenuItem
                                icon="help-circle-outline"
                                label="Help Center"
                                color="#06b6d4"
                                onPress={() => router.push('/help')}
                            />
                            <Divider />
                            <MenuItem
                                icon="document-text-outline"
                                label="Terms & Privacy"
                                color="#64748b"
                                onPress={() => router.push('/privacy')}
                            />
                            <Divider />
                            <MenuItem
                                icon="information-circle-outline"
                                label="About"
                                color="#a855f7"
                                onPress={() => router.push('/about')}
                            />
                        </View>
                    </View>

                    <View style={styles.logoutSection}>
                        <Button
                            title="Sign Out"
                            onPress={handleLogoutPress}
                            variant="outline"
                            loading={loggingOut}
                            style={styles.logoutButton}
                            textStyle={styles.logoutButtonText}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function MenuItem({
    icon,
    label,
    color,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingBottom: Spacing.xxl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
    },
    headerLabel: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: Spacing.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: Fonts.weights.bold,
        color: Colors.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
        marginBottom: Spacing.xs,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    badgeText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.white,
        fontWeight: Fonts.weights.medium,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.lg,
        gap: Spacing.xs,
        ...Shadows.sm,
    },
    editButtonText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.bold,
        color: Colors.primary,
    },
    content: {
        padding: Spacing.lg,
        marginTop: -Spacing.lg, // Overlap with header curve
    },
    completionCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    completionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    completionTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    completionHint: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
    },
    completionPercent: {
        fontSize: 24,
        fontWeight: Fonts.weights.bold,
        color: Colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.gray100,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.full,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        ...Shadows.sm,
    },
    statValue: {
        fontSize: 24,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    statLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
        marginTop: 2,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Fonts.sizes.xs,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray500,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },
    menuCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    menuLabel: {
        flex: 1,
        fontSize: Fonts.sizes.md,
        color: Colors.gray900,
        fontWeight: Fonts.weights.medium,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray100,
        marginLeft: 56 + Spacing.md, // Icon width + margin
    },
    logoutSection: {
        paddingBottom: Spacing.huge,
    },
    logoutButton: {
        borderColor: Colors.error,
    },
    logoutButtonText: {
        color: Colors.error,
    },
});
