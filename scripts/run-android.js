#!/usr/bin/env node

/**
 * Compila e instala o app Android (`expo run:android`) usando o JDK que vem
 * com o Android Studio (JBR), sem depender do JAVA_HOME global da máquina —
 * ele pode apontar para um JDK novo demais para o Gradle do Android.
 *
 * Ordem de escolha do JDK:
 *   1. variável PHYTORA_JAVA_HOME, se definida;
 *   2. JBR do Android Studio no local padrão do sistema;
 *   3. o JAVA_HOME que já estiver no ambiente.
 *
 * Além dele, o build precisa de um JDK 17 instalado (o plugin Gradle do React
 * Native compila com `jvmToolchain(17)`); o Gradle o encontra sozinho.
 *
 * Também define ANDROID_HOME, se faltar, com o local padrão do SDK.
 * Argumentos extras são repassados: `npm run android -- --device`.
 */

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

function primeiroQueExiste(caminhos) {
  return caminhos.find((caminho) => caminho && fs.existsSync(caminho));
}

function locaisDoJbr() {
  switch (process.platform) {
    case "win32":
      return [
        path.join(process.env.ProgramFiles ?? "C:\\Program Files", "Android", "Android Studio", "jbr"),
        path.join(os.homedir(), "AppData", "Local", "Programs", "Android Studio", "jbr"),
      ];
    case "darwin":
      return ["/Applications/Android Studio.app/Contents/jbr/Contents/Home"];
    default:
      return ["/opt/android-studio/jbr", path.join(os.homedir(), "android-studio", "jbr")];
  }
}

function localPadraoDoSdk() {
  switch (process.platform) {
    case "win32":
      return path.join(os.homedir(), "AppData", "Local", "Android", "Sdk");
    case "darwin":
      return path.join(os.homedir(), "Library", "Android", "sdk");
    default:
      return path.join(os.homedir(), "Android", "Sdk");
  }
}

const env = { ...process.env };

const javaHome = primeiroQueExiste([process.env.PHYTORA_JAVA_HOME, ...locaisDoJbr()]);
if (javaHome) {
  env.JAVA_HOME = javaHome;
  console.log(`Usando JDK: ${javaHome}`);
} else {
  console.warn("JBR do Android Studio não encontrado; usando o JAVA_HOME do ambiente.");
}

if (!env.ANDROID_HOME) {
  const sdk = primeiroQueExiste([localPadraoDoSdk()]);
  if (sdk) env.ANDROID_HOME = sdk;
}

const filho = spawn("npx", ["expo", "run:android", ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

filho.on("exit", (codigo) => process.exit(codigo ?? 1));
