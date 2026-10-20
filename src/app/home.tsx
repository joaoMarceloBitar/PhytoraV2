import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import CameraIcon from '@/assets/icons/camera-vector.svg';
import Button from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

// Tela inicial de quem está logado. Por enquanto só a análise e o logout;
// terrenos (etapa 4) e o mapa (etapa 7) entram aqui.
export default function HomeScreen() {
  const router = useRouter();
  const { usuario, sair } = useAuth();
  const [saindo, setSaindo] = useState(false);

  async function confirmarSaida() {
    setSaindo(true);
    // Ao deslogar, o guard do layout tira o usuário desta tela sozinho.
    await sair();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phytora</Text>
        <Text style={styles.saudacao}>Olá, {usuario?.nome.split(' ')[0]}!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Análise Rápida"
          icon={<CameraIcon width={24} height={24} />}
          onPress={() => router.push('/culture-selection')}
        />

        <Button title="Sair" variant="text" onPress={confirmarSaida} loading={saindo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingTop: 64,
  },

  header: {
    alignItems: 'center',
    gap: 16,
  },

  title: {
    color: COLORS.textLight,
    fontWeight: '800',
    letterSpacing: 4.9,
    fontSize: 48,
    textAlign: 'center',
  },

  saudacao: {
    color: COLORS.textLight,
    fontSize: 20,
  },

  buttonContainer: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingHorizontal: 90,
  },
});
