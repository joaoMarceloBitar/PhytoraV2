import { Tabs } from 'expo-router';
import { Camera, Map as IconeMapa, MapPin, User } from 'lucide-react-native';
import { View } from 'react-native';

import { criarEstilos, useTema } from '@/design-system';

const useEstilos = criarEstilos((t) => ({
  // Diagnosticar fica no centro, em destaque: é a ação principal do app.
  centro: {
    width: 52,
    height: 52,
    marginTop: -18,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: t.abas.fundo,
    backgroundColor: t.cores.destaque,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// Abas de quem está logado. O modo convidado (Análise Rápida sem conta) não
// passa por aqui. A aba Alertas entra na etapa 9a.
export default function AbasLayout() {
  const tema = useTema();
  const estilos = useEstilos();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tema.abas.fundo },
        headerTintColor: tema.abas.ativo,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: tema.abas.fundo, borderTopColor: tema.abas.fundo },
        tabBarActiveTintColor: tema.abas.ativo,
        tabBarInactiveTintColor: tema.abas.inativo,
      }}
    >
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <IconeMapa color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="terrenos"
        options={{
          title: 'Terrenos',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="diagnosticar"
        options={{
          title: 'Diagnosticar',
          headerShown: false,
          tabBarIcon: () => (
            <View style={estilos.centro}>
              <Camera color={tema.cores.primaria} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
