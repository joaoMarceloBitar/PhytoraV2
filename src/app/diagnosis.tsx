import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { DiagnosticResponse } from "../services/inference";
import { useRouter } from "expo-router";
import Button from "@/components/Button";
import type { RegistroOutput } from "@/types/api";

type DiseaseProfile = {
    key: string;
    title: string;
    badge: string;
    summary: string;
    state: string;
    symptoms: string[];
    actions: string[];
    accentColor: string;
    backgroundColor: string;
};

const DISEASE_PROFILES: Record<string, DiseaseProfile> = {
    ferrugem: {
        key: "ferrugem",
        title: "Ferrugem Asiática",
        badge: "Doença foliar",
        summary: "A rede neural identificou sinais compatíveis com ferrugem, uma doença fúngica que costuma aparecer como manchas alaranjadas ou ferruginosas na superfície da folha.",
        state: "Estado: provável infecção fúngica em estágio inicial.",
        symptoms: ["Manchas arredondadas e amareladas", "Pústulas alaranjadas ou marrom-avermelhadas", "Folhas com queda de vigor e descoloração"],
        actions: ["Isolar folhas afetadas", "Reduzir umidade na área", "Aplicar tratamento fungicida orientado por um especialista"],
        accentColor: "#770505",
        backgroundColor: "#ff793b"
    },
    mancha_alvo: {
        key: "mancha_alvo",
        title: "Mancha-alvo identificada",
        badge: "Infecção por fungo",
        summary: "A classificação aponta para mancha-alvo, uma doença que geralmente gera lesões circulares com um centro mais claro e bordas escuras.",
        state: "Estado: lesões circulares compatíveis com patógeno foliar.",
        symptoms: ["Lesões em formato de alvo", "Centro claro e bordas mais escuras", "Progressão das manchas ao longo das folhas"],
        actions: ["Remover folhas com sintomas avançados", "Melhorar a circulação de ar", "Seguir orientação de manejo fitopatológico"],
        accentColor: "#854d0e",
        backgroundColor: "#fefce8"
    },
    mosaico: {
        key: "mosaico",
        title: "Mosaico detectado",
        badge: "Estresse viral",
        summary: "O modelo sugere mosaico, que costuma se manifestar como padrões de brilho e descoloração irregular nas folhas, indicando possível infecção viral.",
        state: "Estado: padrão visual sugestivo de virose.",
        symptoms: ["Padrões claros e escuros em mosaico", "Descoloração irregular nas folhas", "Redução do crescimento da planta"],
        actions: ["Eliminar plantas sintomáticas", "Controlar vetores e insetos", "Monitorar a lavoura com frequência"],
        accentColor: "#166534",
        backgroundColor: "#dcfce7"
    },
    septoria: {
        key: "septoria",
        title: "Septoria detectada",
        badge: "Infecção fúngica",
        summary: "O modelo sugere septoria, uma doença fúngica que se manifesta como manchas circulares com bordas escuras e centro mais claro.",
        state: "Estado: lesões circulares compatíveis com patógeno foliar.",
        symptoms: ["Manchas circulares com bordas escuras", "Centro mais claro", "Progressão das manchas ao longo das folhas"],
        actions: ["Remover folhas com sintomas avançados", "Melhorar a circulação de ar", "Aplicar tratamento fungicida orientado por um especialista"],
        accentColor: "#713f12",
        backgroundColor: "#fdf2e9"
    }
};

function getDiseaseProfile(predictedClass: string): DiseaseProfile {
    return DISEASE_PROFILES[predictedClass] ?? {
        key: predictedClass,
        title: "Diagnóstico complementar",
        badge: "🔎 Análise da IA",
        summary: "A rede neural classificou a imagem em uma categoria que ainda não possui conteúdo específico neste app.",
        state: "Estado: necessidade de revisão complementar.",
        symptoms: ["Sintomas ainda não mapeados", "Recomenda-se confirmação por especialista"],
        actions: ["Comparar com outras referências", "Consultar agrônomo ou laboratório"],
        accentColor: "#4b5563",
        backgroundColor: "#f3f4f6"
    }
};


function formatConfidence(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
}

export default function Diagnostico() {
    const router = useRouter();

    // `diagnosis`: Análise Rápida (/infer, não salva).
    // `registro`: diagnóstico salvo (POST /registros), com o mesmo resultado da CNN.
    const { diagnosis, registro: registroParam } = useLocalSearchParams();

    const registro: RegistroOutput | null = (() => {
        if (typeof registroParam !== "string") return null;
        try {
            return JSON.parse(registroParam) as RegistroOutput;
        } catch {
            return null;
        }
    })();

    const result: DiagnosticResponse | null = (() => {
        if (registro) {
            return {
                ok: true,
                predictedClass: registro.classe_modelo,
                predictedIndex: -1,
                confidence: registro.confianca,
                topPredictions: registro.top_predicoes.map((p, index) => ({
                    class: p.classe,
                    confidence: p.confianca,
                    index,
                })),
            };
        }

        if (typeof diagnosis !== "string") {
            return null;
        }

        try {
            return JSON.parse(diagnosis) as DiagnosticResponse;
        } catch {
            return null;
        }
    })();

    const profile = result ? getDiseaseProfile(result.predictedClass) : getDiseaseProfile("desconhecida");

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={[styles.hero]}>
                <Text style={styles.pageTittle}>Diagnóstico</Text>
            </View>
            {registro && (
                <View style={styles.salvo}>
                    <Text style={styles.salvoTitulo}>
                        {registro.inconclusivo ? "Salvo como inconclusivo" : "Salvo nos seus diagnósticos"}
                    </Text>
                    <Text style={styles.salvoTexto}>
                        {registro.inconclusivo
                            ? "A confiança do modelo ficou baixa. O diagnóstico fica no seu histórico, mas não aparece no mapa da região nem entra nos alertas. Tente outra foto, mais de perto e com boa luz."
                            : `${registro.doenca?.nome ?? "Folha saudável"} · ${registro.municipio ? `${registro.municipio.nome}/${registro.municipio.uf}` : "município não identificado"}`}
                    </Text>
                </View>
            )}
            <View style={[styles.pathologyCard, { backgroundColor: "#ff793b" }]}>
                <Text style={styles.badge}>{profile.badge}</Text>
                <Text style={styles.title}>{profile.title}</Text>
            </View>
            <Text style={styles.summary}>{profile.summary}</Text>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Resumo do diagnóstico</Text>
                <Text style={styles.label}>Classe prevista</Text>
                <Text style={styles.value}>{result?.predictedClass ?? "Não disponível"}</Text>
                <Text style={styles.label}>Confiança do modelo</Text>
                <Text style={styles.value}>{result ? formatConfidence(result.confidence) : "0.00%"}</Text>
                <Text style={styles.label}>Status da inferência</Text>
                <Text style={styles.value}>{result?.ok ? "Inferência válida" : "Inferência não confirmada"}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Como reconhecer</Text>
                {profile.symptoms.map((symptom) => (
                    <Text key={symptom} style={styles.listItem}>• {symptom}</Text>
                ))}
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Ações recomendadas</Text>
                {profile.actions.map((action) => (
                    <Text key={action} style={styles.listItem}>• {action}</Text>
                ))}
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Outras previsões</Text>
                {result?.topPredictions?.map((prediction) => (
                    <View key={`${prediction.index}-${prediction.class}`} style={styles.predictionRow}>
                        <Text style={styles.predictionClass}>{prediction.class}</Text>
                        <Text style={styles.predictionConfidence}>{formatConfidence(prediction.confidence)}</Text>
                    </View>
                ))}
            </View>
            {registro ? (
                <View style={styles.acoes}>
                    <Button
                        title="Diagnosticar outra"
                        onPress={() => router.back()}
                    />
                    <Button
                        title="Ver no terreno"
                        variant="text"
                        onPress={() =>
                            router.dismissTo({ pathname: "/terreno/[id]", params: { id: registro.id_terreno } })
                        }
                    />
                </View>
            ) : (
                <Button
                    title="Voltar para a tela inicial"
                    variant="text"
                    // Volta para a primeira tela da pilha: welcome para convidado,
                    // as abas para quem está logado.
                    onPress={() => router.dismissAll()}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({

    salvo: {
        marginHorizontal: 18,
        marginTop: 16,
        padding: 14,
        borderRadius: 14,
        backgroundColor: "#DCEFE5",
        gap: 4,
    },

    salvoTitulo: {
        color: "#1D6A50",
        fontSize: 15,
        fontWeight: "700",
    },

    salvoTexto: {
        color: "#2C473E",
        fontSize: 14,
        lineHeight: 20,
    },

    acoes: {
        gap: 4,
        paddingHorizontal: 18,
    },

    container: {
        flexGrow: 1,
        paddingBottom: 36,
        backgroundColor: "#2C473E"
    },
    hero: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: 90,
        paddingBottom: 40,
        backgroundColor: "#B0D182",
        marginBottom: 24,
        marginHorizontal: 24
    },
    pathologyCard: {
        paddingVertical: 24,
        marginHorizontal: 24,
        paddingHorizontal: 16,
        backgroundColor: "#f4edde",
        borderRadius: 18,
        marginTop: 24,
        marginBottom: 24,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    pageTittle: {
        color: "#192420",
        fontSize: 32,
        fontWeight: "700",
        letterSpacing: 4,
    },
    badge: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        textTransform: "uppercase"
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#770505"
    },
    summary: {
        flexDirection: "column",
        alignItems: "flex-start",
        marginHorizontal: 18,
        textAlign: "center",
        paddingHorizontal: 25,
        fontSize: 15,
        lineHeight: 22,
        color: "#fff",
        marginBottom: 64
    },
    state: {
        fontSize: 14,
        fontWeight: "600"
    },
    card: {
        backgroundColor: "#fbf9f6",
        borderRadius: 18,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginHorizontal: 18
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 10
    },
    label: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 6
    },
    value: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827"
    },
    listItem: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 6,
        lineHeight: 20
    },
    predictionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6"
    },
    predictionClass: {
        fontSize: 14,
        color: "#111827"
    },
    predictionConfidence: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563"
    }
});