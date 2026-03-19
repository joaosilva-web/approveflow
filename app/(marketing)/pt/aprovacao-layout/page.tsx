import type { Metadata } from "next";
import ToolLandingPagePT from "@/features/marketing/components/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Aprovação de layout online | Gratuita – ApproveFlow",
  description:
    "Aprove layouts online com um link compartilhável. Seu cliente revisa, comenta e aprova diretamente no navegador — sem cadastro e sem complicação.",
  openGraph: {
    title: "Aprovação de layout online | Gratuita – ApproveFlow",
    description:
      "Gere um link para aprovação de layout e receba o sign-off formal do cliente com nome e data.",
    type: "website",
  },
  alternates: { canonical: "/pt/aprovacao-layout" },
};

const FAQ = [
  {
    q: "Como fazer aprovação de layout com o cliente online?",
    a: "Faça upload do layout aqui. O ApproveFlow gera um link de revisão que você compartilha com o cliente. Ele abre no navegador, revisa o layout, pode deixar comentários em pontos específicos e clica em Aprovar quando estiver satisfeito.",
  },
  {
    q: "Qual é a forma mais rápida de aprovação de layout?",
    a: "Um link de revisão direto. Sem marcar reunião, sem exportar e enviar PDF, sem esperar o cliente abrir o e-mail. Você envia o link pelo WhatsApp e o cliente aprova na hora, de qualquer dispositivo.",
  },
  {
    q: "A aprovação de layout tem validade legal?",
    a: "O ApproveFlow registra o nome fornecido pelo cliente, o horário e o arquivo aprovado, criando um registro claro. Para contratos formais, consulte um advogado. Mas para a maioria dos projetos freelance, esse registro resolve facilmente qualquer disputa.",
  },
  {
    q: "Posso usar para aprovação de layout de embalagem, banner ou material impresso?",
    a: "Sim. Qualquer imagem ou PDF pode ser enviado para revisão. É muito usado para aprovação de arte final de redes sociais, banners, cartões de visita, embalagens e outros materiais gráficos.",
  },
];

export default function AprovacaoLayoutPage() {
  return (
    <ToolLandingPagePT
      headline="Aprovação de layout com link compartilhável"
      description="Faça o upload do layout, gere o link e envie para o cliente aprovar no navegador. Comentários precisos, sign-off formal, sem e-mail e sem cadastro."
      faq={FAQ}
    />
  );
}
