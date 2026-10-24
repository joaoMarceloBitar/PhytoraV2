import { Leaf } from 'lucide-react-native';

import ArrozIcon from '@/assets/icons/arrozIcon.svg';
import SojaIcon from '@/assets/icons/sojaIcon.svg';
import TrigoIcon from '@/assets/icons/trigoIcon.svg';
import { COLORS } from '@/constants/colors';

type CulturaIconeProps = {
  /** Nome da cultura, como vem do catálogo (ex: "soja"). */
  cultura: string;
  tamanho: number;
};

const ICONES: Record<string, typeof SojaIcon> = {
  soja: SojaIcon,
  arroz: ArrozIcon,
  trigo: TrigoIcon,
};

/**
 * Ícone da cultura. Milho e fumo ainda não têm desenho próprio: usam uma
 * folha genérica até os ícones chegarem.
 */
export default function CulturaIcone({ cultura, tamanho }: CulturaIconeProps) {
  const Icone = ICONES[cultura.toLowerCase()];
  if (Icone) return <Icone width={tamanho} height={tamanho} />;
  return <Leaf size={tamanho} color={COLORS.primary} />;
}
