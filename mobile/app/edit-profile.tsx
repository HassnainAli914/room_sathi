/**
 * Edit Profile Screen - Personal Information Only
 * Same for both Buyers and Sellers - personal info only
 * Property details, amenities, house rules go in Create Listing
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    Image,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
    const { profile, user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const isSeller = profile?.role === 'seller';

    useEffect(() => {
        if (profile?.avatar_url) {
            setAvatarUri(profile.avatar_url);
        }
    }, [profile]);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showMessage('error', 'Permission to access photos is required');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setUploadingAvatar(true);
                const imageUri = result.assets[0].uri;

                if (Platform.OS !== 'web') {
                    setAvatarUri(imageUri);
                }

                try {
                    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpeg';
                    const fileName = `${user?.id}_${Date.now()}.${ext}`;
                    const filePath = `${fileName}`;

                    let fileData;
                    if (Platform.OS === 'web') {
                        const response = await fetch(imageUri);
                        const blob = await response.blob();
                        fileData = blob;
                    } else {
                        const formData = new FormData();
                        formData.append('file', {
                            uri: imageUri,
                            name: fileName,
                            type: `image/${ext}`
                        } as any);
                        fileData = formData;
                    }

                    const { error } = await supabase.storage
                        .from('images')
                        .upload(filePath, fileData as any, {
                            upsert: true,
                            contentType: Platform.OS === 'web' ? undefined : 'multipart/form-data',
                        });

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);

                    setUploadedAvatarUrl(publicUrl);
                    setAvatarUri(publicUrl);
                    showMessage('success', 'Photo uploaded! Click Save to apply.', false);
                } catch (uploadError: any) {
                    showMessage('error', 'Failed to upload image: ' + uploadError.message);
                } finally {
                    setUploadingAvatar(false);
                }
            }
        } catch (error) {
            showMessage('error', 'Failed to pick image');
            setUploadingAvatar(false);
        }
    };

    const showMessage = (type: 'success' | 'error', message: string, shouldRedirect = true) => {
        if (Platform.OS === 'web') {
            setStatusMessage({ type, text: message });
            if (type === 'success' && shouldRedirect) {
                setTimeout(() => {
                    router.replace('/(tabs)/profile');
                }, 1500);
            }
        } else {
            const buttons = shouldRedirect
                ? [{ text: 'OK', onPress: () => type === 'success' && router.replace('/(tabs)/profile') }]
                : [{ text: 'OK' }];
            Alert.alert(type === 'success' ? 'Success' : 'Error', message, buttons);
        }
    };

    // Form state - personal information only
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: '',
        city: '',
        phone_number: '',
        contact_preference: '',
        university: '',
        occupation: '',
        bio: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                age: profile.age?.toString() || '',
                gender: profile.gender || '',
                city: profile.city || '',
                phone_number: profile.phone_number || '',
                contact_preference: profile.contact_preference || '',
                university: profile.university || '',
                occupation: (profile as any).occupation || '',
                bio: (profile as any).bio || '',
            });
        }
    }, [profile]);

    const updateField = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (statusMessage) setStatusMessage(null);
    };

    const handleSave = async () => {
        if (!user?.id) {
            showMessage('error', 'User not found. Please login again.');
            return;
        }

        setLoading(true);
        setStatusMessage(null);

        try {
            const profileData: any = {};

            if (uploadedAvatarUrl) profileData.avatar_url = uploadedAvatarUrl;
            if (formData.full_name) profileData.full_name = formData.full_name;
            if (formData.age) profileData.age = parseInt(formData.age);
            if (formData.gender) profileData.gender = formData.gender;
            if (formData.city) profileData.city = formData.city;
            if (formData.phone_number) profileData.phone_number = formData.phone_number;
            if (formData.contact_preference) profileData.contact_preference = formData.contact_preference;
            if (formData.university) profileData.university = formData.university;
            if (formData.occupation) profileData.occupation = formData.occupation;
            if (formData.bio) profileData.bio = formData.bio;

            await api.updateProfile(user.id, profileData);

            if (refreshProfile) {
                await refreshProfile();
            }

            showMessage('success', 'Profile updated successfully!');
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || error.message || 'Failed to save profile';
            showMessage('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Gradient Header with Avatar */}
                <LinearGradient
                    colors={isSeller ? ['#10b981', '#059669'] : [Colors.primary, '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity
                                onPress={() => router.replace('/(tabs)/profile')}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} color={Colors.white} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Edit Profile</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={styles.avatarSection}>
                            <TouchableOpacity
                                style={styles.avatarContainer}
                                onPress={handlePickImage}
                                activeOpacity={0.8}
                            >
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, isSeller && styles.avatarPlaceholderSeller]}>
                                        <Text style={styles.avatarText}>
                                            {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.avatarEditBadge, isSeller && styles.avatarEditBadgeSeller]}>
                                    <Ionicons name="camera" size={16} color={Colors.white} />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.avatarHint}>
                                {uploadingAvatar ? 'Uploading...' : 'Tap to change photo'}
                            </Text>
                            <View style={styles.roleBadge}>
                                <Ionicons name={isSeller ? 'home' : 'search'} size={14} color={Colors.white} />
                                <Text style={styles.roleBadgeText}>
                                    {isSeller ? 'Room Offerer' : 'Room Seeker'}
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Status Message */}
                {statusMessage && (
                    <View style={[
                        styles.statusBanner,
                        statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError
                    ]}>
                        <Ionicons
                            name={statusMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                            size={20}
                            color={Colors.white}
                        />
                        <Text style={styles.statusText}>{statusMessage.text}</Text>
                    </View>
                )}

                {/* Form Content */}
                <View style={styles.content}>
                    {/* Basic Info Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="person-outline" size={20} color={isSeller ? '#10b981' : Colors.primary} />
                            <Text style={styles.cardTitle}>Personal Information</Text>
                        </View>

                        <FormInput
                            label="Full Name"
                            value={formData.full_name}
                            onChangeText={(v) => updateField('full_name', v)}
                            placeholder="Your full name"
                            icon="person"
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <FormInput
                                    label="Age"
                                    value={formData.age}
                                    onChangeText={(v) => updateField('age', v)}
                                    placeholder="22"
                                    keyboardType="numeric"
                                    icon="calendar"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <SelectPills
                                    label="Gender"
                                    value={formData.gender}
                                    options={['male', 'female', 'other']}
                                    onSelect={(v) => updateField('gender', v)}
                                />
                            </View>
                        </View>

                        <FormInput
                            label="City"
                            value={formData.city}
                            onChangeText={(v) => updateField('city', v)}
                            placeholder="Mumbai, Delhi..."
                            icon="location"
                        />

                        <FormInput
                            label="University / College"
                            value={formData.university}
                            onChangeText={(v) => updateField('university', v)}
                            placeholder="IIT Delhi"
                            icon="school"
                        />

                        <FormInput
                            label="Occupation"
                            value={formData.occupation}
                            onChangeText={(v) => updateField('occupation', v)}
                            placeholder="Student, Engineer..."
                            icon="briefcase"
                        />
                    </View>

                    {/* About Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="document-text-outline" size={20} color="#8b5cf6" />
                            <Text style={styles.cardTitle}>About Me</Text>
                        </View>

                        <FormInput
                            label="Bio"
                            value={formData.bio}
                            onChangeText={(v) => updateField('bio', v)}
                            placeholder="Tell others about yourself..."
                            multiline
                        />
                    </View>

                    {/* Contact Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="call-outline" size={20} color="#06b6d4" />
                            <Text style={styles.cardTitle}>Contact Information</Text>
                        </View>

                        <FormInput
                            label="Phone Number"
                            value={formData.phone_number}
                            onChangeText={(v) => updateField('phone_number', v)}
                            placeholder="+91 98765 43210"
                            icon="call"
                        />

                        <SelectPills
                            label="Preferred Contact Method"
                            value={formData.contact_preference}
                            options={['phone', 'email', 'whatsapp', 'any']}
                            onSelect={(v) => updateField('contact_preference', v)}
                        />
                    </View>

                    {/* Save Button */}
                    <Button
                        title="Save Profile"
                        onPress={handleSave}
                        loading={loading}
                        style={[styles.saveButton, isSeller && styles.saveButtonSeller]}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

// Form Input Component
function FormInput({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    icon,
    multiline = false,
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric';
    icon?: keyof typeof Ionicons.glyphMap;
    multiline?: boolean;
}) {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                {icon && !multiline && (
                    <Ionicons name={icon} size={18} color={Colors.gray400} style={styles.inputIcon} />
                )}
                <TextInput
                    style={[
                        styles.input,
                        icon && !multiline && styles.inputWithIcon,
                        multiline && styles.inputMultiline,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.gray400}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            </View>
        </View>
    );
}

// Select Pills Component
function SelectPills({
    label,
    value,
    options,
    onSelect,
}: {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
}) {
    const formatLabel = (opt: string) => {
        return opt.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <View style={styles.selectGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.selectOptions}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.pill, value === option && styles.pillActive]}
                        onPress={() => onSelect(option)}
                    >
                        <Text style={[styles.pillText, value === option && styles.pillTextActive]}>
                            {formatLabel(option)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
    avatarSection: {
        alignItems: 'center',
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarPlaceholderSeller: {
        backgroundColor: '#d1fae5',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: Fonts.weights.bold,
        color: Colors.primary,
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.gray800,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    avatarEditBadgeSeller: {
        backgroundColor: '#059669',
    },
    avatarHint: {
        marginTop: Spacing.sm,
        fontSize: Fonts.sizes.sm,
        color: 'rgba(255,255,255,0.8)',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.sm,
        gap: Spacing.xs,
    },
    roleBadgeText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.white,
        fontWeight: Fonts.weights.medium,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginTop: -Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        ...Shadows.sm,
    },
    statusSuccess: {
        backgroundColor: '#10B981',
    },
    statusError: {
        backgroundColor: Colors.error,
    },
    statusText: {
        color: Colors.white,
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.medium,
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray100,
    },
    cardTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.medium,
        color: Colors.gray700,
        marginBottom: Spacing.xs,
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: Spacing.md,
        top: '50%',
        transform: [{ translateY: -9 }],
        zIndex: 1,
    },
    input: {
        backgroundColor: Colors.gray50,
        borderWidth: 1,
        borderColor: Colors.gray200,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Fonts.sizes.md,
        color: Colors.gray900,
    },
    inputWithIcon: {
        paddingLeft: 44,
    },
    inputMultiline: {
        minHeight: 100,
        paddingTop: Spacing.md,
    },
    selectGroup: {
        marginBottom: Spacing.md,
    },
    selectOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    pill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray100,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    pillActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    pillText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray700,
        fontWeight: Fonts.weights.medium,
    },
    pillTextActive: {
        color: Colors.white,
    },
    saveButton: {
        marginBottom: Spacing.huge,
        ...Shadows.md,
    },
    saveButtonSeller: {
        backgroundColor: '#10b981',
    },
});
