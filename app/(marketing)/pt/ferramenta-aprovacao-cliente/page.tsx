import type { Metadata } from "next";
import ToolLandingPagePT from "@/features/marketing/components/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Ferramenta de aprovação de layout | Gratuita – ApproveFlow",
  description:
    "Ferramenta gratuita para freelancers coletarem aprovação formal de clientes em layouts e designs. Gere um link de revisão em segundos, sem cadastro.",
  openGraph: {
    title: "Ferramenta de aprovação de layout para freelancers",
    description:
      "Pare de perder aprovações por e-mail. Use um link de revisão para obter sign-off formal do cliente com nome e data.",
    type: "website",
  },
  alternates: { canonical: "/pt/ferramenta-aprovacao-cliente" },
};

const FAQ = [
  {
    q: "Por que freelancers precisam de uma ferramenta de aprovação?",
    a: "Aprovações por e-mail são vagas e difíceis de rastrear. 'Ficou ótimo!' não é um comprovante real. Uma aprovação formal com nome, data e arquivo específico protege o freelancer em caso de disputa e profissionaliza o processo.",
  },
  {
    q: "Como funciona a aprovação formal no ApproveFlow?",
    a: "O cliente abre o link de revisão, revisa o arquivo e clica em Aprovar. O ApproveFlow registra o nome do cliente e o horário da aprovação, criando um comprovante claro de que aquele arquivo foi aprovado.",
  },
  {
    q: "A ferramenta é gratuita para freelancers?",
    a: "Sim. Links de revisão para convidados são completamente gratuitos e não exigem cadastro. Links gratuitos ficam disponíveis por 7 dias. Crie uma conta grátis para links permanentes e um painel de projetos.",
  },
  {
    q: "Funciona para qualquer tipo de arquivo?",
    a: "Imagens (PNG, JPG, WEBP), PDFs e vídeos de até 20 MB. Para projetos maiores, use uma conta grátis para desbloquear limites maiores e armazenamento permanente.",
  },
];

export default function FerramentaAprovacaoClientePage() {
  return (
    <ToolLandingPagePT
      headline="Ferramenta de aprovação de layout para freelancers"
      description="Pare de perder aprovações por e-mail. Gere um link de revisão, envie para o cliente e obtenha um sign-off formal com nome e data — completamente gratuito."
      faq={FAQ}
    />
  );
}
