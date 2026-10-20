import { File } from "expo-file-system";

import { API_URL } from "@/config/api";

export interface DiagnosisPrediction {
    class: string;
    confidence: number;
    index: number;
}

export interface DiagnosticResponse {
    confidence: number;
    ok: boolean;
    predictedClass: string;
    predictedIndex: number;
    topPredictions: DiagnosisPrediction[];
}

export async function inferImage(uri: string): Promise<DiagnosticResponse> {

    const file = new File(uri);

    console.log(file.exists);
    console.log(file.size);

    console.log(file);
    console.log(file.name);
    console.log(file.type);
    const form = new FormData();

    form.append("image", file);

    console.log("Enviando requisição...");

    const response = await fetch(`${API_URL}/infer`, {
        method: "POST",
        body: form,
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Resposta:");
    console.log(data);

    if (!response.ok) {
        throw new Error(data.error || "Erro desconhecido");
    }

    return data;
}