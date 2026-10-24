import { LocateFixed } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import TelaFormulario from '@/components/TelaFormulario';
import TextField from '@/components/TextField';
import { COLORS } from '@/constants/colors';
import { useLocalizacao, type EstadoLocalizacao } from '@/hooks/use-localizacao';
import type { Localizacao, MunicipioOutput, TerrenoInput } from '@/types/api';
import { errosDoFormulario, type ErrosDoFormulario } from '@/utils/erros';
import { formatarCoordenadas, formatarMunicipio } from '@/utils/formatar';

type TerrenoSalvo = {
  nome: string;
  area_hectares: number | null;
  localizacao: Localizacao;
  municipio: MunicipioOutput | null;
};

type FormularioTerrenoProps = {
  /** Ausente = cadastro novo, que já começa lendo o GPS. */
  terreno?: TerrenoSalvo;
  textoBotao: string;
  /** Lança o erro da API para o formulário mostrar. */
  onSalvar: (dados: TerrenoInput) => Promise<void>;
};

/** "12,5" → 12.5; vazio → null; texto que não é número → undefined. */
function lerArea(texto: string): number | null | undefined {
  const limpo = texto.trim().replace(',', '.');
  if (limpo === '') return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : undefined;
}

export default function FormularioTerreno({ terreno, textoBotao, onSalvar }: FormularioTerrenoProps) {
  const gps = useLocalizacao();
  const { obter } = gps;

  const [nome, setNome] = useState(terreno?.nome ?? '');
  const [area, setArea] = useState(
    terreno?.area_hectares != null ? String(terreno.area_hectares).replace('.', ',') : '',
  );
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosDoFormulario>({ campos: {} });

  // Cadastro novo: a localização é obrigatória, então já começa pedindo.
  useEffect(() => {
    if (!terreno) obter();
  }, [terreno, obter]);

  const novaPosicao = gps.estado.tipo === 'pronta' ? gps.estado.posicao : null;
  const localizacao: Localizacao | null = novaPosicao
    ? { latitude: novaPosicao.latitude, longitude: novaPosicao.longitude }
    : (terreno?.localizacao ?? null);

  async function salvar() {
    const areaHectares = lerArea(area);
    if (areaHectares === undefined) {
      setErros({ campos: { area_hectares: 'Digite a área em hectares, como 12,5.' } });
      return;
    }
    if (!localizacao) {
      setErros({ campos: { localizacao: 'Aguarde a localização do GPS.' }, geral: undefined });
      return;
    }

    setEnviando(true);
    setErros({ campos: {} });
    try {
      await onSalvar({ nome, area_hectares: areaHectares, localizacao });
    } catch (erro) {
      setErros(errosDoFormulario(erro));
      setEnviando(false);
    }
  }

  const erroLocalizacao =
    erros.campos.localizacao ??
    erros.campos['localizacao.latitude'] ??
    erros.campos['localizacao.longitude'];

  return (
    <TelaFormulario
      erro={erros.geral}
      actions={
        <Button
          title={textoBotao}
          onPress={salvar}
          loading={enviando}
          disabled={!localizacao || gps.estado.tipo === 'obtendo'}
        />
      }
    >
      <TextField
        label="Nome"
        value={nome}
        onChangeText={setNome}
        erro={erros.campos.nome}
        placeholder="Ex: Lavoura da Coxilha"
        maxLength={80}
      />
      <TextField
        label="Área em hectares (opcional)"
        value={area}
        onChangeText={setArea}
        erro={erros.campos.area_hectares}
        placeholder="Ex: 12,5"
        keyboardType="decimal-pad"
      />

      <View style={styles.bloco}>
        <Text style={styles.label}>Localização</Text>

        {terreno && !novaPosicao && (
          <View style={styles.linha}>
            <Text style={styles.valor}>{formatarMunicipio(terreno.municipio)}</Text>
            <Text style={styles.detalhe}>{formatarCoordenadas(terreno.localizacao)}</Text>
          </View>
        )}

        <EstadoGps estado={gps.estado} editando={!!terreno} />

        <AcoesGps
          estado={gps.estado}
          editando={!!terreno}
          onObter={gps.obter}
          onDescartar={gps.descartar}
          onConfiguracoes={gps.abrirConfiguracoes}
        />

        {erroLocalizacao && <Text style={styles.erro}>{erroLocalizacao}</Text>}
      </View>
    </TelaFormulario>
  );
}

function EstadoGps({ estado, editando }: { estado: EstadoLocalizacao; editando: boolean }) {
  switch (estado.tipo) {
    case 'obtendo':
      return (
        <View style={styles.linhaHorizontal}>
          <ActivityIndicator color={COLORS.textLight} />
          <Text style={styles.detalhe}>Obtendo localização…</Text>
        </View>
      );
    case 'pronta':
      return (
        <View style={styles.linha}>
          {editando && <Text style={styles.aviso}>Nova localização. O município será recalculado ao salvar.</Text>}
          <Text style={styles.valor}>{formatarCoordenadas(estado.posicao)}</Text>
          <Text style={styles.detalhe}>
            {estado.posicao.precisao != null
              ? `Precisão de ±${Math.round(estado.posicao.precisao)} m`
              : 'Precisão não informada pelo aparelho'}
          </Text>
        </View>
      );
    case 'negada':
      return (
        <Text style={styles.erro}>
          {estado.podePedirDeNovo
            ? 'O Phytora precisa da sua localização para marcar onde fica o terreno.'
            : 'A permissão de localização foi negada. Libere nas configurações do aparelho para cadastrar o terreno.'}
        </Text>
      );
    case 'desligada':
      return (
        <Text style={styles.erro}>A localização do aparelho está desligada. Ative e tente de novo.</Text>
      );
    case 'erro':
      return <Text style={styles.erro}>{estado.mensagem}</Text>;
    default:
      return null;
  }
}

function AcoesGps({
  estado,
  editando,
  onObter,
  onDescartar,
  onConfiguracoes,
}: {
  estado: EstadoLocalizacao;
  editando: boolean;
  onObter: () => void;
  onDescartar: () => void;
  onConfiguracoes: () => void;
}) {
  switch (estado.tipo) {
    case 'obtendo':
      return null;
    case 'inicial':
      return editando ? (
        <Button
          title="Usar minha localização atual"
          variant="ghost"
          icon={<LocateFixed size={18} color={COLORS.white} />}
          onPress={onObter}
        />
      ) : null;
    case 'pronta':
      return (
        <>
          <Button title="Atualizar localização" variant="ghost" onPress={onObter} />
          {editando && <Button title="Manter a localização anterior" variant="text" onPress={onDescartar} />}
        </>
      );
    case 'negada':
      return estado.podePedirDeNovo ? (
        <Button title="Permitir localização" variant="ghost" onPress={onObter} />
      ) : (
        <Button title="Abrir configurações" variant="ghost" onPress={onConfiguracoes} />
      );
    default:
      return <Button title="Tentar de novo" variant="ghost" onPress={onObter} />;
  }
}

const styles = StyleSheet.create({
  bloco: {
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  label: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
  },

  linha: {
    gap: 2,
  },

  linhaHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  valor: {
    color: COLORS.white,
    fontSize: 16,
  },

  detalhe: {
    color: COLORS.textLight,
    fontSize: 13,
  },

  aviso: {
    color: COLORS.warning,
    fontSize: 13,
  },

  erro: {
    color: COLORS.error,
    fontSize: 13,
  },
});
