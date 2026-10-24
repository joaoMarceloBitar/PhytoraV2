import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { DISTANCIA_MAX_KM } from '@/config/api';
import { COLORS } from '@/constants/colors';
import { useLocalizacao } from '@/hooks/use-localizacao';
import { enviarRegistro } from '@/services/registros';
import type { OrigemFoto } from '@/types/api';
import type { ParamsDiagnostico } from '@/utils/diagnostico';
import { errosDoFormulario } from '@/utils/erros';
import { prepararFoto } from '@/utils/foto';
import { distanciaKm, formatarDistancia } from '@/utils/geo';

type Foto = { uri: string; largura: number; altura: number; origem: OrigemFoto };

/**
 * Foto do diagnóstico que fica salvo. Da câmera, o registro usa o GPS do
 * momento (ou o ponto do terreno, se o GPS falhar); da galeria, sempre o
 * ponto do terreno, porque a foto pode ter sido tirada em outro lugar.
 */
export default function FotoDiagnosticoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ParamsDiagnostico>();
  const terreno = {
    latitude: Number(params.terreno_latitude),
    longitude: Number(params.terreno_longitude),
  };
  const gps = useLocalizacao();

  const [foto, setFoto] = useState<Foto | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Se o envio falhar, a foto fica na tela para tentar de novo.
  const [erro, setErro] = useState<string | null>(null);

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      setErro('Permita o uso da câmera nas configurações do aparelho para tirar a foto.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    if (resultado.canceled) return;

    const { uri, width, height } = resultado.assets[0]!;
    setFoto({ uri, largura: width, altura: height, origem: 'camera' });
    setErro(null);
    gps.obter();
  }

  async function escolherDaGaleria() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (resultado.canceled) return;

    const { uri, width, height } = resultado.assets[0]!;
    setFoto({ uri, largura: width, altura: height, origem: 'galeria' });
    setErro(null);
    gps.descartar();
  }

  const posicao = foto?.origem === 'camera' && gps.estado.tipo === 'pronta' ? gps.estado.posicao : null;
  const distancia = posicao ? distanciaKm(posicao, terreno) : null;
  const longe = distancia !== null && distancia > DISTANCIA_MAX_KM;
  const aguardandoGps = foto?.origem === 'camera' && gps.estado.tipo === 'obtendo';

  function confirmarEnvio() {
    if (!longe) {
      enviar();
      return;
    }
    Alert.alert(
      'A foto é deste terreno?',
      `Você está a ${formatarDistancia(distancia!)} da ${params.terreno_nome}. Envie só se a folha for deste terreno.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar mesmo assim', onPress: enviar },
      ],
    );
  }

  async function enviar() {
    if (!foto) return;
    setEnviando(true);
    setErro(null);
    try {
      const uri = await prepararFoto(foto.uri, foto.largura, foto.altura);
      const registro = await enviarRegistro({
        uri,
        id_cultura_plantada: params.id_cultura_plantada,
        origem_foto: foto.origem,
        gps: posicao ?? undefined,
      });
      // Volta ao estado inicial: "Diagnosticar outra" no resultado volta aqui.
      setFoto(null);
      gps.descartar();
      router.push({ pathname: '/diagnosis', params: { registro: JSON.stringify(registro) } });
    } catch (e) {
      setErro(errosDoFormulario(e).geral ?? 'Não foi possível enviar. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Text style={styles.terreno}>{params.terreno_nome} · Soja</Text>

      {foto ? (
        <Image source={{ uri: foto.uri }} style={styles.preview} contentFit="cover" />
      ) : (
        <View style={[styles.preview, styles.semFoto]}>
          <Text style={styles.textoSecundario}>
            Fotografe uma folha com sintomas, de perto e com boa luz.
          </Text>
        </View>
      )}

      {foto && infoLocal()}

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <View style={styles.acoes}>
        {foto && (
          <Button
            title={erro ? 'Tentar de novo' : 'Enviar diagnóstico'}
            onPress={confirmarEnvio}
            loading={enviando}
            disabled={aguardandoGps}
          />
        )}
        <Button
          title={foto ? 'Tirar outra foto' : 'Tirar foto'}
          variant={foto ? 'ghost' : 'default'}
          icon={<Camera size={20} color={foto ? COLORS.white : COLORS.primary} />}
          onPress={tirarFoto}
          disabled={enviando}
        />
        <Button
          title="Escolher da galeria"
          variant="ghost"
          icon={<ImageIcon size={20} color={COLORS.white} />}
          onPress={escolherDaGaleria}
          disabled={enviando}
        />
      </View>
    </ScrollView>
  );

  function infoLocal() {
    if (foto?.origem === 'galeria') {
      return (
        <Text style={styles.textoSecundario}>
          Foto da galeria: o registro usa a localização do terreno.
        </Text>
      );
    }
    switch (gps.estado.tipo) {
      case 'obtendo':
        return (
          <View style={styles.linha}>
            <ActivityIndicator color={COLORS.textLight} />
            <Text style={styles.textoSecundario}>Obtendo localização…</Text>
          </View>
        );
      case 'pronta':
        return (
          <View style={styles.info}>
            <Text style={styles.textoSecundario}>
              GPS
              {gps.estado.posicao.precisao != null ? ` ±${Math.round(gps.estado.posicao.precisao)} m` : ''}
              {' · '}a {formatarDistancia(distancia!)} do terreno
            </Text>
            {longe && (
              <Text style={styles.aviso}>
                Você está longe do terreno escolhido. Confirme que a folha é deste terreno.
              </Text>
            )}
          </View>
        );
      default:
        return (
          <View style={styles.info}>
            <Text style={styles.textoSecundario}>
              Sem GPS: o registro vai usar a localização do terreno.
            </Text>
            <Button title="Tentar o GPS de novo" variant="text" onPress={gps.obter} />
          </View>
        );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  conteudo: {
    padding: 24,
    gap: 16,
  },

  terreno: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },

  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  semFoto: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  info: {
    gap: 4,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  textoSecundario: {
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: 'center',
  },

  aviso: {
    color: COLORS.warning,
    fontSize: 14,
    textAlign: 'center',
  },

  erro: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },

  acoes: {
    gap: 8,
  },
});
