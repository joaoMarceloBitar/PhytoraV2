import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useRouter } from 'expo-router';

import CultureCard from '@/components/CultureCard';

export default function CultureSelectionScreen() {

  const router = useRouter();

  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.subtitle}>
          Selecione a
        </Text>
        <Text style={styles.title}>
          Cultura
        </Text>

      </View>

      <View style={styles.listColumn}>
        <View style={styles.list}>
          <CultureCard
            title="Soja"
            culture="soja"
            onPress={() => router.push('/camera')}
          />

          <CultureCard
            title="Arroz"
            culture="arroz"
            onPress={() => router.push('/camera')}
          />
        </View>

        <View style={styles.list}>
          <CultureCard
            title="Trigo"
            culture="trigo"
            onPress={() => router.push('/camera')}
          />

          <CultureCard
            title="Milho"
            culture="milho"
            onPress={() => router.push('/camera')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor: '#fff',

    paddingHorizontal: 24,
  },

  header: {
    alignItems: 'center',
    backgroundColor: '#2C473E',
    marginBottom: 48,
    paddingTop: 72,
    paddingBottom: 32,
    marginHorizontal: -24,

  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,

    color: '#FFFFFF',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#D9D9D9',

    lineHeight: 28,
  },
  listColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    gap: 45,

  },

});