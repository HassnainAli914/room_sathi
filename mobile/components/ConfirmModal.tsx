/**
 * Confirmation Modal - Beautiful popup for confirmations
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../constants/theme';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = Colors.error,
    icon = 'alert-circle',
    iconColor = Colors.error,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modal}>
                            {/* Icon */}
                            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                                <Ionicons name={icon} size={32} color={iconColor} />
                            </View>

                            {/* Content */}
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>

                            {/* Buttons */}
                            <View style={styles.buttons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={onCancel}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelText}>{cancelText}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.confirmButton, { backgroundColor: confirmColor }]}
                                    onPress={onConfirm}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.confirmText}>{confirmText}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modal: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        ...Shadows.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: Fonts.sizes.xl,
        fontWeight: Fonts.weights.bold,
        color: Colors.gray900,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray600,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    buttons: {
        flexDirection: 'row',
        gap: Spacing.md,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.gray100,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.gray700,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: Fonts.sizes.md,
        fontWeight: Fonts.weights.semibold,
        color: Colors.white,
    },
});
