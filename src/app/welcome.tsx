import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/Button';
import CameraIcon from '@/assets/icons/camera-vector.svg';



export default function WelcomeScreen() {
  const router = useRouter();

  
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Phytora
      </ThemedText>
      <ThemedView style={styles.buttonContainer} >    
        <Button
          title="Análise Rápida"
          icon={
            <CameraIcon
              width={24}
              height={24}
            />
            }
          onPress={() => router.push('/culture-selection')}
        />

        <Button
          title="Cadastre-se"
          variant="ghost"
          onPress={() => {}}
        />

        <Button
          title="Já tenho uma conta"
          variant="text"
          onPress={() => {}}
        />
        </ThemedView>
    </ThemedView>
    
  );
  
}

const styles = StyleSheet.create({
  
  container: {
    backgroundColor: '#2C473E',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 0,
    paddingVertical: 8,
    paddingTop: 64,
  },
  title: {
    color: '#D9D9D9',
    fontWeight: '800',
    letterSpacing: 4.9,
    fontSize: 48,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 16,
    gap: 16,
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 90,
  },
});
