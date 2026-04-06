/**
 * Button Component - Primary and secondary buttons
 */
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[`${size}Button`],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? Colors.white : Colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    // Variants
    primary: {
        backgroundColor: Colors.primary,
    },
    secondary: {
        backgroundColor: Colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    // Sizes
    smallButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    mediumButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
    },
    largeButton: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxl,
    },
    // Text
    text: {
        fontWeight: Fonts.weights.semibold,
    },
    primaryText: {
        color: Colors.white,
    },
    secondaryText: {
        color: Colors.white,
    },
    outlineText: {
        color: Colors.primary,
    },
    ghostText: {
        color: Colors.primary,
    },
    smallText: {
        fontSize: Fonts.sizes.sm,
    },
    mediumText: {
        fontSize: Fonts.sizes.md,
    },
    largeText: {
        fontSize: Fonts.sizes.lg,
    },
    // Disabled
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        color: Colors.gray400,
    },
});
