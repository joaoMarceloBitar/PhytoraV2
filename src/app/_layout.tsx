import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { COLORS } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TemaProvider } from '@/design-system';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // GestureHandlerRootView: os gestos da folha do mapa (design system) precisam dele na raiz.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TemaProvider>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Rotas />
          </ThemeProvider>
        </AuthProvider>
      </TemaProvider>
    </GestureHandlerRootView>
  );
}

// Telas de terreno e cultura abrem por cima das abas, com cabeçalho e voltar.
const comCabecalho = {
  headerShown: true,
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerShadowVisible: false,
} as const;

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
        <Stack.Screen name="(abas)" />
        <Stack.Screen name="terreno/novo" options={{ ...comCabecalho, title: 'Novo terreno' }} />
        <Stack.Screen name="terreno/[id]/index" options={{ ...comCabecalho, title: 'Terreno' }} />
        <Stack.Screen
          name="terreno/[id]/editar"
          options={{ ...comCabecalho, title: 'Editar terreno' }}
        />
        <Stack.Screen
          name="terreno/[id]/nova-cultura"
          options={{ ...comCabecalho, title: 'Adicionar cultura' }}
        />
        <Stack.Screen
          name="cultura/[id]/editar"
          options={{ ...comCabecalho, title: 'Editar cultura' }}
        />
        <Stack.Screen
          name="cultura/[id]/encerrar"
          options={{ ...comCabecalho, title: 'Encerrar cultura' }}
        />
        <Stack.Screen
          name="diagnostico/escolher"
          options={{ ...comCabecalho, title: 'Diagnosticar' }}
        />
        <Stack.Screen name="diagnostico/foto" options={{ ...comCabecalho, title: 'Foto da folha' }} />
        <Stack.Screen name="registro/[id]" options={{ ...comCabecalho, title: 'Diagnóstico' }} />
      </Stack.Protected>
    </Stack>
  );
}
