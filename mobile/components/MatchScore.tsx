/**
 * Match Score Component - Circular progress indicator
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '../constants/theme';

interface MatchScoreProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
}

export function MatchScore({
    score,
    size = 100,
    strokeWidth = 8,
    showLabel = true,
}: MatchScoreProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = ((100 - score) / 100) * circumference;

    const getColor = () => {
        if (score >= 80) return Colors.scoreHigh;
        if (score >= 60) return Colors.scoreMedium;
        return Colors.scoreLow;
    };

    const color = getColor();

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={Colors.gray200}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <View style={styles.content}>
                <Text style={[styles.score, { color }]}>{score}</Text>
                {showLabel && <Text style={styles.label}>%</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        position: 'absolute',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    score: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: Fonts.weights.bold,
    },
    label: {
        fontSize: Fonts.sizes.md,
        color: Colors.gray500,
        fontWeight: Fonts.weights.medium,
    },
});
