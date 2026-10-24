import TextField from '@/components/TextField';
import { mascararData } from '@/utils/datas';

type CampoDataProps = {
  label: string;
  /** Texto na tela, em `DD/MM/AAAA`. */
  value: string;
  onChangeText: (texto: string) => void;
  erro?: string;
};

/** Campo de data digitada, com as barras postas automaticamente. */
export default function CampoData({ label, value, onChangeText, erro }: CampoDataProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={(texto) => onChangeText(mascararData(texto))}
      erro={erro}
      placeholder="DD/MM/AAAA"
      keyboardType="number-pad"
      maxLength={10}
    />
  );
}
