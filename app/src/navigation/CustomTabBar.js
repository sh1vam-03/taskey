/**
 * CustomTabBar -- TASKTIME
 * Clean pill bar with smooth curved notch and floating circle.
 */

import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet,
    TouchableOpacity, Dimensions, Platform,
    Keyboard, useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useAnimatedProps, useAnimatedStyle,
    useSharedValue, useDerivedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_MARGIN = 10;
const BAR_WIDTH = SCREEN_WIDTH - H_MARGIN * 2;

const BAR_H = 62;
const RING = 46;
const RING_R = RING / 2;

const BAR_Y = Math.round(RING * 0.5);
const DEPTH_FINAL = RING * 0.5;
const WRAPPER_H = BAR_Y + BAR_H;
const NW = RING + 10;

// KEY FIX: reserve the pill's rounded cap radius on each side
// so the circle never slides over the curved bar ends.
// BAR_H / 2 = 31px is the pill corner radius — we use 18px as safe inset.
const SIDE_PAD = 20;
const INNER_WIDTH = BAR_WIDTH - SIDE_PAD * 2;
const TAB_WIDTH = INNER_WIDTH / 5;

const SPRING = { damping: 26, stiffness: 280, mass: 0.38 };

const TABS = [
    { name: 'Tasks', iconActive: 'format-list-checks', iconInactive: 'format-list-checkbox', label: 'Tasks' },
    { name: 'Schedule', iconActive: 'calendar-clock', iconInactive: 'calendar-clock-outline', label: 'Schedule' },
    { name: 'Home', iconActive: 'view-dashboard', iconInactive: 'view-dashboard-outline', label: 'Home' },
    { name: 'Today', iconActive: 'calendar-today', iconInactive: 'calendar-today', label: 'Today' },
    { name: 'AI', iconActive: 'star-four-points', iconInactive: 'star-four-points-outline', label: 'AI' },
];

function buildPath(cx, W, H, depth, nw) {
    'worklet';
    const R = H / 2;
    const notchR = RING / 2 + 6;
    const left = cx - notchR * 1.2;
    const right = cx + notchR * 1.2;
    return [
        `M ${R} 0`,
        `L ${left} 0`,
        `C ${left + notchR * 0.3} 0, ${cx - notchR} ${notchR}, ${cx} ${notchR}`,
        `C ${cx + notchR} ${notchR}, ${right - notchR * 0.3} 0, ${right} 0`,
        `L ${W - R} 0`,
        `A ${R} ${R} 0 1 1 ${W - R} ${H}`,
        `L ${R} ${H}`,
        `A ${R} ${R} 0 1 1 ${R} 0`,
        `Z`,
    ].join(' ');
}

export default function CustomTabBar({ state, navigation }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();

    const activeIdx = useSharedValue(state.index);
    const { height: windowHeight } = useWindowDimensions();
    const [initialHeight] = React.useState(windowHeight);

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        activeIdx.value = withSpring(state.index, SPRING);
    }, [state.index, activeIdx]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    // notch center tracks within INNER_WIDTH, offset by SIDE_PAD
    const notchCX = useDerivedValue(() =>
        SIDE_PAD + activeIdx.value * TAB_WIDTH + TAB_WIDTH / 2
    );

    // circle x also starts from SIDE_PAD so it stays over the flat portion
    const circleAnim = useAnimatedStyle(() => ({
        transform: [{
            translateX: SIDE_PAD + activeIdx.value * TAB_WIDTH + (TAB_WIDTH - RING) / 2,
        }],
    }));

    const pathAnim = useAnimatedProps(() => ({
        d: buildPath(notchCX.value, BAR_WIDTH, BAR_H, DEPTH_FINAL, NW),
    }));

    const activeTab = TABS[state.index] ?? TABS[2];
    const labelMarginTop = DEPTH_FINAL - 4;

    // Glass colours — dark mode vs light mode
    const cyan = theme.cyan ?? '#00d4ff';
    const glassFill = isDark ? 'rgba(12,12,14,0.96)' : '#ffffff';
    const glassStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)';
    const circleBg = isDark ? 'rgba(28,28,32,0.98)' : 'rgba(255,255,255,1.0)';
    const circleBorder = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';

    const pillShadow = Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isDark ? 4 : 10 },
            shadowOpacity: isDark ? 0.18 : 0.04,
            shadowRadius: isDark ? 16 : 12,
        },
        android: { elevation: isDark ? 12 : 3 },
    });

    const circleShadow = Platform.select({
        ios: {
            shadowColor: isDark ? cyan : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: isDark ? 10 : 8,
        },
        android: { elevation: isDark ? 14 : 4 },
    });

    // DYNAMIC OFFSET HIDING
    // Instead of fixed 'top', we use 'bottom: 0' and translate the bar down by the amount the window shrunk.
    // This keeps the bar at the physical bottom regardless of screen height variations.
    const translateY = Math.max(0, initialHeight - windowHeight);

    // Keyboard / Window shrink check—hide the tab bar if keyboard is active
    const isKeyboardActive = isKeyboardVisible || translateY > 50;

    if (isKeyboardActive) {
        return <View style={{ height: 0, width: 0, overflow: 'hidden' }} />;
    }

    return (
        <View style={[
            styles.outer,
            { bottom: 0, transform: [{ translateY }] }
        ]}>
            <View style={[styles.wrapper, { height: WRAPPER_H, marginBottom: Math.max(insets.bottom, 10) }]}>

                {/* SVG pill bar — glassy */}
                <View style={[styles.svgWrap, { top: BAR_Y }, pillShadow]} pointerEvents="none">
                    <Svg width={BAR_WIDTH} height={BAR_H}>
                        <AnimatedPath
                            animatedProps={pathAnim}
                            fill={glassFill}
                            stroke={glassStroke}
                            strokeWidth={1}
                        />
                    </Svg>
                </View>

                {/* Floating active circle — stays within flat portion of pill */}
                <Animated.View style={[
                    styles.circle,
                    circleAnim,
                    {
                        backgroundColor: circleBg,
                        borderWidth: 1,
                        borderColor: circleBorder,
                        ...circleShadow,
                    },
                ]}>
                    <Icon name={activeTab.iconActive} size={22} color={cyan} />
                </Animated.View>

                {/* Tab buttons — padded to match SIDE_PAD so labels align under circles */}
                <View style={[styles.tabRow, { top: BAR_Y, height: BAR_H, paddingHorizontal: SIDE_PAD }]}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;
                        const tab = TABS.find(t => t.name === route.name)
                            ?? { iconInactive: 'circle-outline', label: route.name };

                        const onPress = () => {
                            const e = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isFocused && !e.defaultPrevented)
                                navigation.navigate(route.name);
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                activeOpacity={0.6}
                                style={styles.tabItem}
                            >
                                {isFocused ? (
                                    <Text style={[
                                        styles.activeLabel,
                                        { color: cyan, marginTop: labelMarginTop },
                                    ]}>
                                        {tab.label}
                                    </Text>
                                ) : (
                                    <>
                                        <Icon name={tab.iconInactive} size={20} color={theme.textDim ?? '#888'} />
                                        <Text style={[styles.inactiveLabel, { color: theme.textDim ?? '#888' }]}>
                                            {tab.label}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        alignItems: 'center',
        backgroundColor: 'transparent'
    },

    wrapper: {
        width: BAR_WIDTH,
        backgroundColor: 'transparent',
        overflow: 'visible',
    },

    svgWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
    },

    circle: {
        position: 'absolute',
        top: 0,
        width: RING,
        height: RING,
        borderRadius: RING_R,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        overflow: 'hidden',
    },

    tabRow: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        zIndex: 10,
    },

    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },

    activeLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.4,
    },

    inactiveLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
});