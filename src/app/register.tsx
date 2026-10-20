import { useState } from 'react';
import { useRouter } from 'expo-router';

import AuthForm from '@/components/AuthForm';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { errosDoFormulario, type ErrosDoFormulario } from '@/utils/erros';

export default function RegisterScreen() {
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosDoFormulario>({ campos: {} });

  async function enviar() {
    setEnviando(true);
    setErros({ campos: {} });
    try {
      // O cadastro já devolve a sessão: o usuário sai daqui logado.
      await cadastrar(nome, email, senha);
    } catch (erro) {
      setErros(errosDoFormulario(erro));
      setEnviando(false);
    }
  }

  return (
    <AuthForm
      title="Criar conta"
      subtitle="Seus diagnósticos ficam salvos e ajudam a monitorar a sua região."
      erro={erros.geral}
      actions={
        <>
          <Button title="Criar conta" onPress={enviar} loading={enviando} />
          <Button
            title="Já tenho uma conta"
            variant="text"
            onPress={() => router.replace('/login')}
          />
        </>
      }
    >
      <TextField
        label="Nome"
        value={nome}
        onChangeText={setNome}
        erro={erros.campos.nome}
        placeholder="Seu nome"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
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
        placeholder="Mínimo de 8 caracteres"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={enviar}
      />
    </AuthForm>
  );
}
