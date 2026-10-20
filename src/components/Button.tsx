import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, } from 'react-native';
import { ReactNode } from 'react';

type ButtonProps = {
  title: string;
  onPress: () => void;

  variant?: 'default' | 'ghost' | 'text';

  style?: ViewStyle;

  icon?: ReactNode;

  /** Mostra um indicador no lugar do texto e bloqueia novos toques. */
  loading?: boolean;

  disabled?: boolean;
};

export default function Button({ title, onPress, variant = 'default', style, icon, loading = false, disabled = false, }: ButtonProps) {

  function getButtonStyle() {

    switch (variant) {

      case 'ghost':
        return styles.ghostButton;

      case 'text':
        return styles.textButton;

      default:
        return styles.button;
    }
  }

  function getTextStyle() {

    switch (variant) {

      case 'ghost':
        return styles.ghostButtonText;

      case 'text':
        return styles.textButtonText;

      default:
        return styles.buttonText;
    }
  }

  return (
    <Pressable
      style={[getButtonStyle(), (disabled || loading) && styles.inactive, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} />
      ) : (
        <>
          {icon}

          <Text style={getTextStyle()}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({

  inactive: {
    opacity: 0.6,
  },

  button: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#D9D9D9',
    width: '100%',
  },

  ghostButton: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    width: '100%',
  },

  textButton: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: 'transparent',
    width: '100%',
  },

  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2C473E',
    fontWeight: '600',
    marginLeft: 8,
  },

  ghostButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  textButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#D9D9D9',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

});