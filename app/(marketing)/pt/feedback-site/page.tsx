import type { Metadata } from "next";
import ToolLandingPagePT from "@/features/marketing/components/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Feedback de site para cliente | Ferramenta gratuita – ApproveFlow",
  description:
    "Envie o layout do seu site para o cliente revisar e aprovar online. Receba feedback com comentários precisos e aprovação formal — gratuito e sem cadastro.",
  openGraph: {
    title: "Feedback de site para cliente | Ferramenta gratuita",
    description:
      "Compartilhe mockups de site com o cliente, receba comentários e colete aprovação formal com um link de revisão.",
    type: "website",
  },
  alternates: { canonical: "/pt/feedback-site" },
};

const FAQ = [
  {
    q: "Como coletar feedback do cliente sobre o layout do site?",
    a: "Exporte a tela do site como imagem ou PDF, faça upload aqui e compartilhe o link com o cliente. Ele pode clicar em qualquer elemento da página para deixar um comentário fixo — por exemplo, 'muda a cor desse botão' — e depois aprovar o layout ou pedir ajustes.",
  },
  {
    q: "Existe uma ferramenta para feedback de design de site?",
    a: "Sim. O ApproveFlow permite enviar referências visuais do site para o cliente revisar no navegador, sem precisar instalar nada. O cliente vê o design exatamente como foi criado e consegue indicar exatamente onde quer mudanças.",
  },
  {
    q: "Como enviar um mockup de site para o cliente?",
    a: "Faça upload do mockup (PNG, PDF ou qualquer formato de imagem) aqui. O sistema gera um link de revisão que você pode enviar por WhatsApp, e-mail ou qualquer mensageiro. O cliente abre o link e já consegue interagir com o arquivo.",
  },
  {
    q: "Meu cliente pode aprovar o site sem criar uma conta?",
    a: "Sim. O cliente só precisa abrir o link, digitar o nome e clicar em Aprovar. Nenhum cadastro é necessário do lado dele.",
  },
];

export default function FeedbackSitePage() {
  return (
    <ToolLandingPagePT
      headline="Colete feedback do seu cliente sobre o site"
      description="Envie o mockup do seu site para o cliente revisar e aprovar. Comentários fixos, aprovação formal e link compartilhável — tudo gratuito."
      faq={FAQ}
    />
  );
}
