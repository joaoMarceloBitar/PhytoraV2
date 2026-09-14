import ArrozIcon from '@/assets/icons/arrozIcon.svg';
import SojaIcon from '@/assets/icons/sojaIcon.svg';
import TrigoIcon from '@/assets/icons/trigoIcon.svg';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  title: string;
  culture?: string;
  onPress: () => void;
};

export default function CultureCard({
  title,
  culture,
  onPress,
}: Props) {
  const normalizedTitle = (culture ?? title).toLowerCase();

  const IconComponent = normalizedTitle.includes('soja')
    ? SojaIcon
    : normalizedTitle.includes('arroz')
      ? ArrozIcon
      : normalizedTitle.includes('trigo')
        ? TrigoIcon
        : normalizedTitle.includes('milho')
          ? TrigoIcon
          : SojaIcon;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <IconComponent width={48} height={48} />

        <Text style={styles.title}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    height: 170,
    backgroundColor: '#f4edde',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },

  content: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
  },

  title: {
    fontSize: 22,
    color: '#2C473E',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
});