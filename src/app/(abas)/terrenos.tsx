import { useRouter } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { Carregando, ErroComRetentativa } from '@/components/EstadoTela';
import EtiquetaCultura from '@/components/EtiquetaCultura';
import { COLORS } from '@/constants/colors';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { listarTerrenos } from '@/services/terrenos';
import type { TerrenoOutput } from '@/types/api';
import { formatarArea, formatarMunicipio } from '@/utils/formatar';

export default function TerrenosScreen() {
  const router = useRouter();
  const { dados, erro, carregando, atualizando, atualizar, tentarDeNovo } =
    useDadosDaTela(listarTerrenos);

  if (carregando) return <Carregando />;
  if (erro) return <ErroComRetentativa mensagem={erro} onTentarDeNovo={tentarDeNovo} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={dados}
        keyExtractor={(terreno) => terreno.id_terreno}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizar}
            tintColor={COLORS.textLight}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <CartaoTerreno
            terreno={item}
            onPress={() =>
              router.push({ pathname: '/terreno/[id]', params: { id: item.id_terreno } })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTitulo}>Nenhum terreno ainda</Text>
            <Text style={styles.vazioTexto}>
              Cadastre seus terrenos para registrar o que está plantado e, nas próximas versões,
              receber alertas de doenças na sua região.
            </Text>
          </View>
        }
      />

      <View style={styles.rodape}>
        <Button
          title="Cadastrar terreno"
          icon={<Plus size={20} color={COLORS.primary} />}
          onPress={() => router.push('/terreno/novo')}
        />
      </View>
    </View>
  );
}

function CartaoTerreno({ terreno, onPress }: { terreno: TerrenoOutput; onPress: () => void }) {
  const detalhes = [
    formatarMunicipio(terreno.municipio),
    terreno.area_hectares != null ? formatarArea(terreno.area_hectares) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable style={styles.cartao} onPress={onPress}>
      <View style={styles.cartaoTexto}>
        <Text style={styles.nome}>{terreno.nome}</Text>
        <Text style={styles.detalhes}>{detalhes}</Text>
        {terreno.culturas_ativas.length > 0 && (
          <View style={styles.etiquetas}>
            {terreno.culturas_ativas.map((c) => (
              <EtiquetaCultura key={c.id_cultura_plantada} nome={c.cultura.nome} />
            ))}
          </View>
        )}
      </View>
      <ChevronRight color={COLORS.textLight} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  lista: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },

  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  cartaoTexto: {
    flex: 1,
    gap: 4,
  },

  nome: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },

  detalhes: {
    color: COLORS.textLight,
    fontSize: 14,
  },

  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },

  vazioTitulo: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  vazioTexto: {
    color: COLORS.textLight,
    fontSize: 15,
    textAlign: 'center',
  },

  rodape: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
