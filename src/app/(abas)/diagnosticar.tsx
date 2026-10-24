import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import CameraIcon from '@/assets/icons/camera-vector.svg';
import Button from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

// Aba Diagnosticar (centro). "Diagnosticar e salvar" vira registro no mapa;
// a Análise Rápida continua disponível para testar sem salvar.
// Ainda no visual antigo: migrar para o design system (docs/design-system.md).
export default function DiagnosticarScreen() {
  const router = useRouter();
  const { usuario } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phytora</Text>
        <Text style={styles.saudacao}>Olá, {usuario?.nome.split(' ')[0]}!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Diagnosticar e salvar"
          icon={<CameraIcon width={24} height={24} />}
          onPress={() => router.push('/diagnostico/escolher')}
        />
        <Button
          title="Análise rápida (não salva)"
          variant="ghost"
          onPress={() => router.push('/culture-selection')}
        />
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
    paddingHorizontal: 48,
  },
});
