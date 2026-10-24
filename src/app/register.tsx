import { useState } from 'react';
import { useRouter } from 'expo-router';

import AuthForm from '@/components/AuthForm';
import Button from '@/components/Button';
import EscolhaPrivacidade from '@/components/EscolhaPrivacidade';
import TextField from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { errosDoFormulario, type ErrosDoFormulario } from '@/utils/erros';

// Campos da primeira etapa: se a API recusar algum deles, o cadastro volta
// para ela para mostrar o erro no campo.
const CAMPOS_DA_CONTA = ['nome', 'email', 'senha'];

export default function RegisterScreen() {
  const router = useRouter();
  const { cadastrar } = useAuth();

  // Duas etapas na mesma tela: a senha não passa por parâmetro de rota.
  const [etapa, setEtapa] = useState<'conta' | 'privacidade'>('conta');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoAnonimo, setModoAnonimo] = useState<boolean | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosDoFormulario>({ campos: {} });

  async function enviar() {
    if (modoAnonimo === null) {
      setErros({ campos: { modo_anonimo: 'Escolha uma das opções para continuar.' } });
      return;
    }

    setEnviando(true);
    setErros({ campos: {} });
    try {
      // O cadastro já devolve a sessão: o usuário sai daqui logado.
      await cadastrar(nome, email, senha, modoAnonimo);
    } catch (erro) {
      const novos = errosDoFormulario(erro);
      setErros(novos);
      setEnviando(false);
      if (Object.keys(novos.campos).some((campo) => CAMPOS_DA_CONTA.includes(campo))) {
        setEtapa('conta');
      }
    }
  }

  if (etapa === 'privacidade') {
    return (
      <AuthForm
        title="Seus diagnósticos no mapa"
        subtitle="Escolha o que outras pessoas veem quando você salva um diagnóstico."
        erro={erros.geral}
        actions={
          <>
            <Button title="Criar conta" onPress={enviar} loading={enviando} />
            <Button title="Voltar" variant="text" onPress={() => setEtapa('conta')} />
          </>
        }
      >
        <EscolhaPrivacidade
          modoAnonimo={modoAnonimo}
          onEscolher={setModoAnonimo}
          erro={erros.campos.modo_anonimo}
        />
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Criar conta"
      subtitle="Seus diagnósticos ficam salvos e ajudam a monitorar a sua região."
      erro={erros.geral}
      actions={
        <>
          <Button
            title="Continuar"
            onPress={() => {
              setErros({ campos: {} });
              setEtapa('privacidade');
            }}
          />
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
      />
    </AuthForm>
  );
}
