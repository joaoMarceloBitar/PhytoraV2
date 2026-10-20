import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

const splashImage = require('../../assets/images/splash-screen.png');

export default function SplashScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const [tempoMinimoPassou, setTempoMinimoPassou] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setTempoMinimoPassou(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  // Sai quando a imagem já foi exibida E a sessão salva já foi verificada;
  // o index decide entre home (logado) e welcome (deslogado).
  useEffect(() => {
    if (tempoMinimoPassou && status !== 'carregando') {
      router.replace('/');
    }
  }, [tempoMinimoPassou, status, router]);

  return (
    <View style={styles.container}>
      <Image source={splashImage} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
