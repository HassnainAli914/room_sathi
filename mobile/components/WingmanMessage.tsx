/**
 * Wingman Message Component - Friendly AI message display
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts, Shadows } from '../constants/theme';

interface WingmanMessageProps {
    message: string;
    tone: 'positive' | 'neutral' | 'cautious';
    suggestions?: string[];
}

export function WingmanMessage({ message, tone, suggestions }: WingmanMessageProps) {
    const toneConfig = {
        positive: {
            icon: 'happy-outline' as const,
            color: Colors.success,
            bgColor: '#ECFDF5',
            borderColor: '#A7F3D0',
        },
        neutral: {
            icon: 'information-circle-outline' as const,
            color: Colors.primary,
            bgColor: '#EEF2FF',
            borderColor: '#C7D2FE',
        },
        cautious: {
            icon: 'alert-circle-outline' as const,
            color: Colors.warning,
            bgColor: '#FFFBEB',
            borderColor: '#FDE68A',
        },
    };

    const config = toneConfig[tone];

    return (
        <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
                    <Ionicons name="sparkles" size={16} color={Colors.white} />
                </View>
                <Text style={styles.title}>Wingman Says</Text>
                <Ionicons name={config.icon} size={20} color={config.color} />
            </View>

            <Text style={styles.message}>{message}</Text>

            {suggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Tips:</Text>
                    {suggestions.map((suggestion, index) => (
                        <View key={index} style={styles.suggestionRow}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginVertical: Spacing.md,
        ...Shadows.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    title: {
        flex: 1,
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray800,
    },
    message: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray700,
        lineHeight: 22,
    },
    suggestionsContainer: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.gray200,
    },
    suggestionsTitle: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray600,
        marginBottom: Spacing.sm,
    },
    suggestionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    suggestionText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray600,
        marginLeft: Spacing.sm,
        flex: 1,
    },
});
