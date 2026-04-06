/**
 * Red Flag Badge Component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';

interface RedFlagBadgeProps {
    severity: 'low' | 'medium' | 'high';
    description: string;
    compact?: boolean;
}

export function RedFlagBadge({ severity, description, compact = false }: RedFlagBadgeProps) {
    const severityConfig = {
        low: {
            color: Colors.warning,
            bgColor: '#FEF3C7',
            icon: 'warning-outline' as const,
        },
        medium: {
            color: '#F97316',
            bgColor: '#FFEDD5',
            icon: 'alert-circle-outline' as const,
        },
        high: {
            color: Colors.error,
            bgColor: '#FEE2E2',
            icon: 'alert-outline' as const,
        },
    };

    const config = severityConfig[severity];

    if (compact) {
        return (
            <View style={[styles.compactContainer, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon} size={14} color={config.color} />
                <Text style={[styles.compactText, { color: config.color }]}>
                    {severity.toUpperCase()}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: config.bgColor }]}>
            <View style={styles.header}>
                <Ionicons name={config.icon} size={18} color={config.color} />
                <Text style={[styles.severity, { color: config.color }]}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Risk
                </Text>
            </View>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    severity: {
        fontSize: Fonts.sizes.sm,
        fontWeight: Fonts.weights.semibold,
        marginLeft: Spacing.xs,
    },
    description: {
        fontSize: Fonts.sizes.sm,
        color: Colors.gray700,
        marginLeft: Spacing.lg + Spacing.xs,
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    compactText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: Fonts.weights.semibold,
    },
});
