import { useState } from 'react';
import { useRouter } from 'expo-router';

import AuthForm from '@/components/AuthForm';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { errosDoFormulario, type ErrosDoFormulario } from '@/utils/erros';

export default function LoginScreen() {
  const router = useRouter();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosDoFormulario>({ campos: {} });

  async function enviar() {
    setEnviando(true);
    setErros({ campos: {} });
    try {
      // Sucesso troca o status para "logado"; o guard do layout leva para a home.
      await entrar(email, senha);
    } catch (erro) {
      setErros(errosDoFormulario(erro));
      setEnviando(false);
    }
  }

  return (
    <AuthForm
      title="Entrar"
      subtitle="Acesse sua conta para salvar diagnósticos e acompanhar sua região."
      erro={erros.geral}
      actions={
        <>
          <Button title="Entrar" onPress={enviar} loading={enviando} />
          <Button
            title="Ainda não tenho conta"
            variant="text"
            onPress={() => router.replace('/register')}
          />
        </>
      }
    >
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        erro={erros.campos.email}
        placeholder="voce@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextField
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        erro={erros.campos.senha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={enviar}
      />
    </AuthForm>
  );
}
