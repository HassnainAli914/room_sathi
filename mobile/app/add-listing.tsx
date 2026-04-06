/**
 * Add New Listing Screen - Creative Design for Sellers
 * Multi-step form for creating room listings
 */
import React, { useState } from 'react';
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

export default function AddListingScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingType, setUploadingType] = useState<'cover' | 'secondary' | null>(null);

    const MAX_SECONDARY_IMAGES = 4;

    const [formData, setFormData] = useState({
        // Basic Info
        title: '',
        description: '',
        rent_amount: '',
        deposit_amount: '',
        // Location
        address: '',
        city: '',
        near_university: '',
        // Property Details
        property_type: '',
        room_type: '',
        available_from: '',
        // Amenities
        has_wifi: false,
        has_ac: false,
        has_parking: false,
        has_kitchen: false,
        has_laundry: false,
        is_furnished: false,
        has_geyser: false,
        has_power_backup: false,
        // Rules
        guests_allowed: true,
        pets_allowed: false,
        couples_allowed: false,
        smoking_allowed: false,
    });

    const totalSteps = 4;

    const updateField = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handlePickImage = async (type: 'cover' | 'secondary') => {
        // Check limits
        if (type === 'secondary' && secondaryImages.length >= MAX_SECONDARY_IMAGES) {
            Alert.alert('Limit Reached', `Maximum ${MAX_SECONDARY_IMAGES} secondary images allowed`);
            return;
        }

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: type === 'cover' ? [16, 9] : [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setUploadingImage(true);
                setUploadingType(type);
                const imageUri = result.assets[0].uri;

                try {
                    // Handle extension properly for web blob URLs
                    let ext = 'jpeg';
                    if (Platform.OS !== 'web' && !imageUri.startsWith('blob:')) {
                        ext = imageUri.split('.').pop()?.toLowerCase() || 'jpeg';
                    }
                    const prefix = type === 'cover' ? 'cover' : 'secondary';
                    const fileName = `listing_${prefix}_${user?.id}_${Date.now()}.${ext}`;

                    let fileData: Blob | ArrayBuffer;
                    let contentType = `image/${ext}`;

                    if (Platform.OS === 'web') {
                        const response = await fetch(imageUri);
                        const blob = await response.blob();
                        // Get actual content type from blob
                        contentType = blob.type || 'image/jpeg';
                        // Convert blob to ArrayBuffer for Supabase
                        fileData = await blob.arrayBuffer();
                    } else {
                        // For native, use base64
                        const response = await fetch(imageUri);
                        const blob = await response.blob();
                        fileData = await blob.arrayBuffer();
                    }

                    const { error } = await supabase.storage
                        .from('images')
                        .upload(fileName, fileData, {
                            upsert: true,
                            contentType: contentType,
                        });

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);

                    if (type === 'cover') {
                        setCoverImage(publicUrl);
                    } else {
                        setSecondaryImages(prev => [...prev, publicUrl]);
                    }
                } catch (err: any) {
                    Alert.alert('Error', 'Failed to upload image');
                } finally {
                    setUploadingImage(false);
                    setUploadingType(null);
                }
            }
        } catch (error) {
            setUploadingImage(false);
            setUploadingType(null);
        }
    };

    const removeCoverImage = () => {
        setCoverImage(null);
    };

    const removeSecondaryImage = (index: number) => {
        setSecondaryImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.rent_amount || !formData.city) {
            Alert.alert('Missing Info', 'Please fill in title, rent, and city');
            return;
        }

        setLoading(true);
        try {
            const listingData = {
                ...formData,
                rent_amount: parseInt(formData.rent_amount),
                deposit_amount: formData.deposit_amount ? parseInt(formData.deposit_amount) : null,
                cover_image: coverImage,
                images: secondaryImages,
            };

            await api.createListing(user?.id || '', listingData);
            Alert.alert('Success', 'Listing created successfully!', [
                { text: 'OK', onPress: () => router.replace('/my-listings') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3, 4].map((step) => (
                <View key={step} style={styles.stepWrapper}>
                    <View style={[
                        styles.stepDot,
                        currentStep >= step && styles.stepDotActive
                    ]}>
                        {currentStep > step ? (
                            <Ionicons name="checkmark" size={14} color={Colors.white} />
                        ) : (
                            <Text style={[
                                styles.stepNumber,
                                currentStep >= step && styles.stepNumberActive
                            ]}>{step}</Text>
                        )}
                    </View>
                    {step < 4 && (
                        <View style={[
                            styles.stepLine,
                            currentStep > step && styles.stepLineActive
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📸 Photos & Basic Info</Text>
            <Text style={styles.stepSubtitle}>Add 1 cover + up to 4 photos (max 5 total)</Text>

            {/* Cover Image */}
            <View style={styles.coverImageSection}>
                <Text style={styles.imageTypeLabel}>Cover Image *</Text>
                {coverImage ? (
                    <View style={styles.coverImageContainer}>
                        <Image source={{ uri: coverImage }} style={styles.coverImage} />
                        <TouchableOpacity
                            style={styles.removeCoverBtn}
                            onPress={removeCoverImage}
                        >
                            <Ionicons name="close" size={18} color={Colors.white} />
                        </TouchableOpacity>
                        <View style={styles.coverBadge}>
                            <Ionicons name="star" size={12} color="#f59e0b" />
                            <Text style={styles.coverBadgeText}>Cover</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addCoverButton}
                        onPress={() => handlePickImage('cover')}
                        disabled={uploadingImage}
                    >
                        {uploadingImage && uploadingType === 'cover' ? (
                            <>
                                <Ionicons name="cloud-upload" size={36} color={Colors.gray400} />
                                <Text style={styles.addCoverText}>Uploading...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="image" size={36} color="#10b981" />
                                <Text style={styles.addCoverText}>Add Cover Photo</Text>
                                <Text style={styles.coverHint}>16:9 ratio recommended</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Secondary Images */}
            <View style={styles.secondaryImagesSection}>
                <View style={styles.secondaryHeader}>
                    <Text style={styles.imageTypeLabel}>Additional Photos</Text>
                    <Text style={styles.imageCount}>{secondaryImages.length}/{MAX_SECONDARY_IMAGES}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {secondaryImages.map((uri, index) => (
                        <View key={index} style={styles.secondaryImagePreview}>
                            <Image source={{ uri }} style={styles.secondaryImage} />
                            <TouchableOpacity
                                style={styles.removeSecondaryBtn}
                                onPress={() => removeSecondaryImage(index)}
                            >
                                <Ionicons name="close" size={14} color={Colors.white} />
                            </TouchableOpacity>
                            <View style={styles.imageNumberBadge}>
                                <Text style={styles.imageNumberText}>{index + 1}</Text>
                            </View>
                        </View>
                    ))}
                    {secondaryImages.length < MAX_SECONDARY_IMAGES && (
                        <TouchableOpacity
                            style={styles.addSecondaryButton}
                            onPress={() => handlePickImage('secondary')}
                            disabled={uploadingImage}
                        >
                            {uploadingImage && uploadingType === 'secondary' ? (
                                <Ionicons name="cloud-upload" size={24} color={Colors.gray400} />
                            ) : (
                                <>
                                    <Ionicons name="add" size={28} color="#10b981" />
                                    <Text style={styles.addSecondaryText}>Add</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>

            <FormInput
                label="Listing Title"
                value={formData.title}
                onChangeText={(v) => updateField('title', v)}
                placeholder="Cozy 1BHK near IIT Campus"
                icon="home"
            />

            <FormInput
                label="Description"
                value={formData.description}
                onChangeText={(v) => updateField('description', v)}
                placeholder="Describe your place, neighborhood, transport..."
                multiline
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <FormInput
                        label="Monthly Rent (₹)"
                        value={formData.rent_amount}
                        onChangeText={(v) => updateField('rent_amount', v)}
                        placeholder="8000"
                        keyboardType="numeric"
                        icon="cash"
                    />
                </View>
                <View style={styles.halfInput}>
                    <FormInput
                        label="Deposit (₹)"
                        value={formData.deposit_amount}
                        onChangeText={(v) => updateField('deposit_amount', v)}
                        placeholder="16000"
                        keyboardType="numeric"
                    />
                </View>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📍 Location</Text>
            <Text style={styles.stepSubtitle}>Where is your property located?</Text>

            <FormInput
                label="Full Address"
                value={formData.address}
                onChangeText={(v) => updateField('address', v)}
                placeholder="123, Street Name, Area"
                icon="location"
            />

            <FormInput
                label="City"
                value={formData.city}
                onChangeText={(v) => updateField('city', v)}
                placeholder="Mumbai, Delhi, Bangalore..."
                icon="business"
            />

            <FormInput
                label="Nearby University/College"
                value={formData.near_university}
                onChangeText={(v) => updateField('near_university', v)}
                placeholder="IIT Delhi, JNU..."
                icon="school"
            />

            <Text style={styles.sectionLabel}>Property Type</Text>
            <View style={styles.optionsGrid}>
                {['Apartment', 'PG', 'Hostel', 'House'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.optionCard,
                            formData.property_type === type.toLowerCase() && styles.optionCardActive
                        ]}
                        onPress={() => updateField('property_type', type.toLowerCase())}
                    >
                        <Ionicons
                            name={type === 'Apartment' ? 'business' : type === 'PG' ? 'people' : type === 'Hostel' ? 'bed' : 'home'}
                            size={24}
                            color={formData.property_type === type.toLowerCase() ? Colors.white : Colors.gray600}
                        />
                        <Text style={[
                            styles.optionText,
                            formData.property_type === type.toLowerCase() && styles.optionTextActive
                        ]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionLabel}>Room Type</Text>
            <View style={styles.optionsGrid}>
                {['Single', 'Shared', 'Entire Place'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.optionCard,
                            formData.room_type === type.toLowerCase().replace(' ', '_') && styles.optionCardActive
                        ]}
                        onPress={() => updateField('room_type', type.toLowerCase().replace(' ', '_'))}
                    >
                        <Text style={[
                            styles.optionText,
                            formData.room_type === type.toLowerCase().replace(' ', '_') && styles.optionTextActive
                        ]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>✨ Amenities</Text>
            <Text style={styles.stepSubtitle}>What does your place offer?</Text>

            <View style={styles.amenitiesGrid}>
                {[
                    { key: 'has_wifi', label: 'WiFi', icon: 'wifi' },
                    { key: 'has_ac', label: 'AC', icon: 'snow' },
                    { key: 'has_parking', label: 'Parking', icon: 'car' },
                    { key: 'has_kitchen', label: 'Kitchen', icon: 'restaurant' },
                    { key: 'has_laundry', label: 'Laundry', icon: 'water' },
                    { key: 'is_furnished', label: 'Furnished', icon: 'bed' },
                    { key: 'has_geyser', label: 'Geyser', icon: 'flame' },
                    { key: 'has_power_backup', label: 'Power Backup', icon: 'flash' },
                ].map((amenity) => (
                    <TouchableOpacity
                        key={amenity.key}
                        style={[
                            styles.amenityItem,
                            (formData as any)[amenity.key] && styles.amenityItemActive
                        ]}
                        onPress={() => updateField(amenity.key, !(formData as any)[amenity.key])}
                    >
                        <Ionicons
                            name={amenity.icon as any}
                            size={28}
                            color={(formData as any)[amenity.key] ? '#10b981' : Colors.gray400}
                        />
                        <Text style={[
                            styles.amenityLabel,
                            (formData as any)[amenity.key] && styles.amenityLabelActive
                        ]}>{amenity.label}</Text>
                        {(formData as any)[amenity.key] && (
                            <View style={styles.amenityCheck}>
                                <Ionicons name="checkmark" size={12} color={Colors.white} />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📋 House Rules</Text>
            <Text style={styles.stepSubtitle}>Set expectations for tenants</Text>

            {[
                { key: 'guests_allowed', label: 'Guests Allowed', icon: 'people' },
                { key: 'pets_allowed', label: 'Pets Allowed', icon: 'paw' },
                { key: 'couples_allowed', label: 'Couples Allowed', icon: 'heart' },
                { key: 'smoking_allowed', label: 'Smoking Allowed', icon: 'flame' },
            ].map((rule) => (
                <TouchableOpacity
                    key={rule.key}
                    style={styles.ruleRow}
                    onPress={() => updateField(rule.key, !(formData as any)[rule.key])}
                >
                    <View style={styles.ruleLeft}>
                        <View style={[
                            styles.ruleIcon,
                            (formData as any)[rule.key] && styles.ruleIconActive
                        ]}>
                            <Ionicons
                                name={rule.icon as any}
                                size={20}
                                color={(formData as any)[rule.key] ? '#10b981' : Colors.gray500}
                            />
                        </View>
                        <Text style={styles.ruleLabel}>{rule.label}</Text>
                    </View>
                    <View style={[
                        styles.toggle,
                        (formData as any)[rule.key] && styles.toggleActive
                    ]}>
                        <View style={[
                            styles.toggleCircle,
                            (formData as any)[rule.key] && styles.toggleCircleActive
                        ]} />
                    </View>
                </TouchableOpacity>
            ))}

            {/* Summary Preview */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>📝 Listing Summary</Text>
                <Text style={styles.summaryText}>
                    {formData.title || 'Your listing title'}
                </Text>
                <Text style={styles.summaryPrice}>
                    ₹{formData.rent_amount || '0'}/month
                </Text>
                <Text style={styles.summaryLocation}>
                    📍 {formData.city || 'City'} • {formData.property_type || 'Property'} • {formData.room_type?.replace('_', ' ') || 'Room type'}
                </Text>
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
                        <Text style={styles.headerTitle}>Add New Listing</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    {renderStepIndicator()}
                </SafeAreaView>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                {currentStep > 1 && (
                    <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                        <Ionicons name="arrow-back" size={20} color={Colors.gray700} />
                        <Text style={styles.secondaryButtonText}>Back</Text>
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                {currentStep < totalSteps ? (
                    <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
                        <Text style={styles.primaryButtonText}>Next</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryButton, styles.submitButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.primaryButtonText}>
                            {loading ? 'Creating...' : 'Publish Listing'}
                        </Text>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                    </TouchableOpacity>
                )}
            </View>
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
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDotActive: {
        backgroundColor: Colors.white,
    },
    stepNumber: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.bold,
        color: 'rgba(255,255,255,0.7)',
    },
    stepNumberActive: {
        color: '#10b981',
    },
    stepLine: {
        width: 40,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    stepContent: {},
    stepTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.xs,
    },
    stepSubtitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
        marginBottom: Spacing.lg,
    },
    // Cover Image Styles
    coverImageSection: {
        marginBottom: Spacing.lg,
    },
    imageTypeLabel: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray800,
        marginBottom: Spacing.sm,
    },
    coverImageContainer: {
        width: '100%',
        height: 180,
        borderRadius: BorderRadius.xl,
        position: 'relative',
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.xl,
    },
    removeCoverBtn: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverBadge: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    coverBadgeText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.white,
        fontWeight: Fonts.weights.semibold,
    },
    addCoverButton: {
        width: '100%',
        height: 180,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        borderColor: '#10b981',
        borderStyle: 'dashed',
        backgroundColor: '#ecfdf5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCoverText: {
        fontSize: Fonts.sizes.md,
        color: '#10b981',
        fontWeight: Fonts.weights.semibold,
        marginTop: Spacing.sm,
    },
    coverHint: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gray500,
        marginTop: 4,
    },
    // Secondary Images Styles
    secondaryImagesSection: {
        marginBottom: Spacing.lg,
    },
    secondaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    imageCount: {
        fontSize: Fonts.sizes.sm,
        color: '#10b981',
        fontWeight: Fonts.weights.semibold,
    },
    secondaryImagePreview: {
        width: 90,
        height: 90,
        borderRadius: BorderRadius.lg,
        marginRight: Spacing.sm,
        position: 'relative',
    },
    secondaryImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.lg,
    },
    removeSecondaryBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.error,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageNumberBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageNumberText: {
        fontSize: 10,
        color: Colors.white,
        fontWeight: Fonts.weights.bold,
    },
    addSecondaryButton: {
        width: 90,
        height: 90,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderColor: '#10b981',
        borderStyle: 'dashed',
        backgroundColor: '#ecfdf5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addSecondaryText: {
        fontSize: Fonts.sizes.xs,
        color: '#10b981',
        fontWeight: Fonts.weights.medium,
        marginTop: 2,
    },
    imageSection: {
        marginBottom: Spacing.lg,
    },
    addImageButton: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    addImageText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.primary,
        marginTop: Spacing.xs,
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.xl,
        marginRight: Spacing.md,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.xl,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.error,
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: Colors.white,
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
    sectionLabel: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray800,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    optionCard: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.gray200,
        alignItems: 'center',
        minWidth: 80,
    },
    optionCardActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    optionText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray700,
        marginTop: Spacing.xs,
        fontWeight: Fonts.weights.medium,
    },
    optionTextActive: {
        color: Colors.white,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    amenityItem: {
        width: (width - Spacing.lg * 2 - Spacing.sm * 3) / 4,
        aspectRatio: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.gray200,
        position: 'relative',
    },
    amenityItemActive: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
    },
    amenityLabel: {
        fontSize: 10,
        color: Colors.gray500,
        marginTop: 4,
        fontWeight: Fonts.weights.medium,
        textAlign: 'center',
    },
    amenityLabelActive: {
        color: '#059669',
    },
    amenityCheck: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    ruleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    ruleIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ruleIconActive: {
        backgroundColor: '#d1fae5',
    },
    ruleLabel: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray900,
        fontWeight: Fonts.weights.medium,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.gray300,
        justifyContent: 'center',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#10b981',
    },
    toggleCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.white,
    },
    toggleCircleActive: {
        alignSelf: 'flex-end',
    },
    summaryCard: {
        backgroundColor: '#ecfdf5',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginTop: Spacing.lg,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    summaryTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: '#059669',
        marginBottom: Spacing.sm,
    },
    summaryText: {
        fontSize: Fonts.sizes.lg,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
    },
    summaryPrice: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: '#10b981',
        marginTop: Spacing.xs,
    },
    summaryLocation: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        marginTop: Spacing.xs,
    },
    bottomNav: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
        ...Shadows.md,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.gray100,
        gap: Spacing.xs,
    },
    secondaryButtonText: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray700,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#10b981',
        gap: Spacing.xs,
    },
    primaryButtonText: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.bold,
        color: Colors.white,
    },
    submitButton: {
        backgroundColor: '#059669',
    },
});
