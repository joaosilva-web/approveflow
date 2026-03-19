import type { Metadata } from "next";
import ToolLandingPagePT from "@/features/marketing/components/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Enviar layout para cliente | Sem cadastro – ApproveFlow",
  description:
    "Envie layouts para clientes com um link de revisão gerado na hora. Sem e-mail, sem PDF anexo — só um link que o cliente abre e aprova.",
  openGraph: {
    title: "Enviar layout para cliente | Sem cadastro",
    description:
      "Gere um link de revisão para o seu layout e envie ao cliente por WhatsApp ou e-mail. Aprovação formal sem complicação.",
    type: "website",
  },
  alternates: { canonical: "/pt/enviar-layout-cliente" },
};

const FAQ = [
  {
    q: "Qual é a melhor forma de enviar layout para cliente?",
    a: "Em vez de anexar imagens em e-mail ou mandar prints pelo WhatsApp, use um link de revisão. O cliente abre o link, vê o layout em alta qualidade, deixa comentários precisos em cima do arquivo e aprova formalmente. Tudo em um só lugar.",
  },
  {
    q: "Como enviar layout para aprovação sem e-mail?",
    a: "Faça upload do layout aqui, copie o link gerado e mande para o cliente pelo canal que preferir — WhatsApp, Telegram, Notion, Slack. O cliente não precisa de conta para abrir e revisar.",
  },
  {
    q: "Posso enviar vários layouts para o mesmo cliente?",
    a: "Sim. Crie um link de revisão para cada versão do layout. O cliente acessa cada link e indica qual prefere na seção de comentários. Com uma conta grátis, você tem um painel centralizado para acompanhar todos os projetos.",
  },
  {
    q: "O cliente consegue deixar comentários diretamente no layout?",
    a: "Sim. O cliente clica em qualquer ponto do layout para criar um comentário fixo naquela posição exata. Cada comentário recebe um número, o que facilita muito a comunicação durante os ajustes.",
  },
];

export default function EnviarLayoutClientePage() {
  return (
    <ToolLandingPagePT
      headline="Envie layouts para clientes com link de revisão"
      description="Faça o upload do seu layout, gere um link compartilhável e deixe o cliente aprovar ou pedir mudanças direto no navegador — sem e-mail nem cadastro."
      faq={FAQ}
    />
  );
}
