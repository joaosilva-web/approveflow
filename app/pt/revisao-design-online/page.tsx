import type { Metadata } from "next";
import ToolLandingPagePT from "@/components/seo/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Revisão de design online | Ferramenta gratuita – ApproveFlow",
  description:
    "Compartilhe seus designs com clientes para revisão online. Gere um link de revisão, receba comentários fixos e colete aprovações formais — tudo gratuitamente.",
  openGraph: {
    title: "Revisão de design online | Ferramenta gratuita",
    description:
      "Envie seu design, compartilhe o link e receba feedback do cliente com comentários e aprovação formal.",
    type: "website",
  },
  alternates: { canonical: "/pt/revisao-design-online" },
};

const FAQ = [
  {
    q: "Como fazer revisão de design com o cliente online?",
    a: "Faça upload do arquivo aqui. O ApproveFlow gera um link de revisão que você compartilha com o cliente. Ele abre o link, vê o design em alta resolução, pode clicar em qualquer área para deixar um comentário fixo, e depois aprova ou solicita mudanças.",
  },
  {
    q: "Qual é a melhor ferramenta para revisão de design?",
    a: "O ApproveFlow foi criado especialmente para freelancers e agências que precisam de uma forma simples de enviar arquivos para revisão. Sem planilhas, sem e-mails perdidos, sem confusão — só um link direto para o cliente.",
  },
  {
    q: "Posso fazer revisão de design sem instalar nenhum programa?",
    a: "Sim. Tanto o freelancer quanto o cliente usam apenas o navegador. Nenhum software precisa ser instalado por nenhum dos lados.",
  },
  {
    q: "O ApproveFlow funciona para revisão de PDFs e vídeos também?",
    a: "Sim. Você pode enviar imagens (PNG, JPG, WEBP), PDFs e vídeos de até 20 MB. Para arquivos maiores, crie uma conta grátis para desbloquear limites maiores.",
  },
];

export default function RevisaoDesignOnlinePage() {
  return (
    <ToolLandingPagePT
      headline="Revisão de design online para freelancers"
      description="Faça upload do seu design, compartilhe um link de revisão e receba feedback do cliente com comentários e aprovação formal — sem cadastro."
      faq={FAQ}
    />
  );
}
