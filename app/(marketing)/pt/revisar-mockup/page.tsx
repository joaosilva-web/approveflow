import type { Metadata } from "next";
import ToolLandingPagePT from "@/features/marketing/components/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Revisar mockup com cliente | Link de revisão – ApproveFlow",
  description:
    "Compartilhe mockups com clientes para revisão online. Gere um link, receba comentários fixos diretamente no mockup e colete aprovação — sem cadastro.",
  openGraph: {
    title: "Revisar mockup com cliente | Link de revisão",
    description:
      "Compartilhe mockups para revisão. Comentários fixos, aprovação formal e link gerado na hora.",
    type: "website",
  },
  alternates: { canonical: "/pt/revisar-mockup" },
};

const FAQ = [
  {
    q: "Como compartilhar mockup com cliente para revisão?",
    a: "Faça upload do mockup (PNG, JPG, PDF) aqui. O sistema gera um link de revisão que você envia para o cliente. Ele abre o link, pode clicar em qualquer área do mockup para deixar um comentário fixo e depois aprova ou pede mudanças.",
  },
  {
    q: "Como coletar feedback de clientes em mockups?",
    a: "O cliente clica diretamente no ponto do mockup sobre o qual quer comentar. Um comentário é ancorado naquela posição com um número de referência. Assim fica claro exatamente sobre qual elemento o feedback se refere.",
  },
  {
    q: "Posso enviar mockups para revisão online sem ferramentas pagas?",
    a: "Sim. O ApproveFlow é gratuito para links de revisão de convidados. Não precisa de assinatura nem cartão de crédito. Basta fazer upload e compartilhar o link.",
  },
  {
    q: "Funciona para mockups de aplicativo mobile?",
    a: "Sim. Exporte as telas do app como PNG ou agrupe em um PDF e faça upload. O cliente visualiza na tela dele e pode comentar em elementos específicos de cada tela.",
  },
];

export default function RevisarMockupPage() {
  return (
    <ToolLandingPagePT
      headline="Compartilhe mockups para revisão com o cliente"
      description="Faça upload do mockup, gere um link e deixe o cliente comentar diretamente sobre elementos específicos e aprovar formalmente — gratuito e sem cadastro."
      faq={FAQ}
    />
  );
}
