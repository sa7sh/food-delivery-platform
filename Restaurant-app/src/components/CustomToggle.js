import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import { useTheme } from '../context/ThemeContext.js';
import triggerHaptic from '../utils/haptics.js';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CustomToggle = ({
  value,
  onValueChange,
  trackColor,
  thumbColor = '#FFFFFF',
  width = 50,
  height = 28,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const defaultTrackColor = { false: theme.border, true: theme.success };
  const actualTrackColor = trackColor || defaultTrackColor;

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic('selection');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onValueChange(!value);
  };

  const thumbSize = height - 4;
  const thumbPosition = value ? width - thumbSize - 2 : 2;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        { width, height, borderRadius: height / 2 },
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.track,
          {
            borderRadius: height / 2,
            backgroundColor: value ? actualTrackColor.true : actualTrackColor.false
          }
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbColor,
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              transform: [{ translateX: thumbPosition }]
            }
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  track: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomToggle;
