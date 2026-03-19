import type { Metadata } from "next";
import ToolLandingPagePT from "@/features/marketing/components/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Revisão de design e UI | Feedback de cliente – ApproveFlow",
  description:
    "Ferramenta para revisão de design e UI com clientes. Compartilhe telas e layouts, receba feedback anotado e colete aprovação formal online — gratuitamente.",
  openGraph: {
    title: "Revisão de design e UI | Feedback de cliente",
    description:
      "Compartilhe designs e interfaces para revisão. Comentários fixos, aprovação formal e sem cadastro.",
    type: "website",
  },
  alternates: { canonical: "/pt/revisao-design-ui" },
};

const FAQ = [
  {
    q: "Como receber feedback de design e interface de um cliente?",
    a: "Faça upload da tela, layout ou mockup aqui. O ApproveFlow gera um link de revisão que o cliente abre no navegador. Ele pode clicar em qualquer ponto da imagem para deixar um comentário fixo e depois aprova ou solicita mudanças — sem precisar de nenhuma ferramenta de design.",
  },
  {
    q: "Qual é a diferença entre revisão de design e revisão de UI?",
    a: "Na prática, o fluxo é o mesmo: você compartilha um arquivo visual com o cliente e coleta feedback estruturado. O ApproveFlow funciona para ambos — seja um layout visual, uma tela de aplicativo ou um protótipo exportado.",
  },
  {
    q: "Como unificar feedback de design e UI em um só lugar?",
    a: "Com uma conta grátis no ApproveFlow, todos os seus projetos ficam em um painel único. Você vê quais designs estão aprovados, quais têm mudanças pendentes e lê todos os comentários do cliente sem sair da plataforma.",
  },
  {
    q: "Posso usar para revisão de componentes de UI isolados?",
    a: "Sim. Exporte o componente como imagem e compartilhe o link. É útil para revisão de ícones, botões, cabeçalhos ou qualquer elemento isolado antes de integrar ao projeto.",
  },
];

export default function RevisaoDesignUiPage() {
  return (
    <ToolLandingPagePT
      headline="Revisão de design e interface com feedback do cliente"
      description="Compartilhe designs e telas de UI em um link de revisão. O cliente comenta diretamente nos elementos, aprova ou pede ajustes — sem conta nem instalações."
      faq={FAQ}
    />
  );
}
