import type { Metadata } from "next";
import ToolLandingPagePT from "@/components/seo/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Feedback de design | Aprovação online – ApproveFlow",
  description:
    "Receba feedback de design do seu cliente com comentários fixos e aprovação online. Gere um link de revisão e compartilhe em segundos — gratuito.",
  openGraph: {
    title: "Feedback de design | Aprovação online – ApproveFlow",
    description:
      "Ferramenta gratuita para receber feedback de design do cliente com comentários precisos e aprovação formal.",
    type: "website",
  },
  alternates: { canonical: "/pt/feedback-design" },
};

const FAQ = [
  {
    q: "Qual é a melhor forma de receber feedback de design de um cliente?",
    a: "Em vez de receber prints marcados em Paint ou comentários vagos por e-mail, use um link de revisão. O cliente clica no ponto exato do design sobre o qual quer comentar. Cada comentário é numerado e posicionado, o que torna os ajustes muito mais rápidos.",
  },
  {
    q: "Como evitar idas e vindas desnecessárias durante a aprovação de design?",
    a: "Com comentários fixos no design, o cliente indica exatamente o que quer mudar, onde e por quê. Isso elimina a ambiguidade e reduz o número de rounds de revisão.",
  },
  {
    q: "Posso receber feedback em mais de uma versão do design?",
    a: "Sim. Crie um link separado para cada versão. O cliente acessa cada uma e deixa o feedback em contexto. Com uma conta grátis, você tem o histórico de todas as versões em um só painel.",
  },
  {
    q: "O ApproveFlow é gratuito para receber feedback de design?",
    a: "Sim. Links de revisão para convidados não têm custo e não exigem cadastro do cliente. Links gratuitos ficam ativos por 7 dias. Para projetos permanentes, crie uma conta grátis.",
  },
];

export default function FeedbackDesignPage() {
  return (
    <ToolLandingPagePT
      headline="Receba feedback de design do seu cliente"
      description="Compartilhe seu design com um link de revisão e receba comentários precisos do cliente — com aprovação formal e sem trocas de e-mail confusas."
      faq={FAQ}
    />
  );
}
