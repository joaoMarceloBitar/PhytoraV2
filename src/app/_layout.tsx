import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Rotas />
      </ThemeProvider>
    </AuthProvider>
  );
}

// Quando o guard de uma tela vira false (ex: logout, sessão expirada), o
// router tira o usuário dela e volta para o index, que redireciona.
// Telas fora dos Protected (splash e o fluxo de análise) valem para todos:
// a "Análise Rápida" funciona como modo convidado, sem salvar nada.
function Rotas() {
  const { status } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />

      <Stack.Protected guard={status === 'deslogado'}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      <Stack.Protected guard={status === 'logado'}>
        <Stack.Screen name="home" />
      </Stack.Protected>
    </Stack>
  );
}
