import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CulturaIcone from '@/components/CulturaIcone';

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
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <CulturaIcone cultura={culture ?? title} tamanho={48} />

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
