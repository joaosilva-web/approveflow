import type { Metadata } from "next";
import ToolLandingPagePT from "@/features/marketing/components/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Revisão de UI com cliente | Ferramenta gratuita – ApproveFlow",
  description:
    "Compartilhe telas e protótipos de interface com clientes para revisão. Receba comentários fixos em elementos específicos da UI e colete aprovação formal.",
  openGraph: {
    title: "Revisão de UI com cliente | Ferramenta gratuita",
    description:
      "Envie capturas de tela ou exportações de UI para revisão do cliente com comentários precisos e aprovação formal.",
    type: "website",
  },
  alternates: { canonical: "/pt/revisao-ui" },
};

const FAQ = [
  {
    q: "Como fazer revisão de interface de usuário com o cliente?",
    a: "Exporte a tela de UI como PNG ou PDF e faça upload aqui. O cliente recebe um link, abre no navegador e pode clicar em qualquer elemento da tela para deixar um comentário fixo — por exemplo, 'esse botão está muito pequeno'. É simples o suficiente para clientes não técnicos.",
  },
  {
    q: "É diferente de compartilhar um link do Figma com o cliente?",
    a: "Sim. Links do Figma podem confundir clientes que não conhecem a ferramenta. O ApproveFlow mostra apenas o design, sem menus, camadas ou protótipos. O cliente foca em revisar, não em entender a ferramenta.",
  },
  {
    q: "O cliente consegue anotar partes específicas da UI?",
    a: "Sim. Ao clicar em qualquer ponto da imagem, um comentário é ancorado naquela posição exata. Cada comentário recebe um número, facilitando a referência durante os ajustes.",
  },
  {
    q: "Posso usar para revisão de fluxo de telas?",
    a: "Sim. Exporte o fluxo de telas como uma imagem longa ou um PDF e faça upload. O cliente revisa todo o fluxo numa única sessão e pode comentar em cada ponto específico.",
  },
];

export default function RevisaoUiPage() {
  return (
    <ToolLandingPagePT
      headline="Revisão de interface com seu cliente"
      description="Compartilhe telas de UI com clientes, receba comentários precisos em elementos específicos e colete aprovação formal — sem precisar de conta."
      faq={FAQ}
    />
  );
}
