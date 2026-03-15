import type { Metadata } from "next";
import ToolLandingPagePT from "@/components/seo/ToolLandingPagePT";

export const metadata: Metadata = {
  title: "Aprovar design com cliente | Ferramenta gratuita – ApproveFlow",
  description:
    "Envie seu design e gere um link para seu cliente revisar, comentar e aprovar online. Gratuito e sem cadastro.",
  openGraph: {
    title: "Aprovar design com cliente | Ferramenta gratuita",
    description:
      "Faça upload do seu design, gere um link de revisão e deixe seu cliente aprovar ou solicitar mudanças.",
    type: "website",
  },
  alternates: { canonical: "/pt/aprovar-design-cliente" },
};

const FAQ = [
  {
    q: "Como enviar design para cliente aprovar?",
    a: "Faça upload do seu design aqui. O ApproveFlow gera um link único que você envia para o cliente por WhatsApp, e-mail ou Slack. O cliente abre o link no navegador, visualiza o arquivo e clica em Aprovar ou Solicitar mudanças — sem precisar criar conta.",
  },
  {
    q: "Existe uma ferramenta gratuita para aprovação de design?",
    a: "Sim. O ApproveFlow oferece links de revisão gratuitos, sem necessidade de cadastro. Os links gratuitos ficam disponíveis por 7 dias. Crie uma conta grátis para manter seus projetos permanentemente e gerenciar todas as aprovações em um só lugar.",
  },
  {
    q: "Meu cliente precisa criar uma conta para aprovar?",
    a: "Não. O cliente recebe o link, abre no navegador, informa o nome e já pode comentar e aprovar. Não precisa baixar nenhum aplicativo nem criar cadastro.",
  },
  {
    q: "Como guardar um registro formal da aprovação do cliente?",
    a: "Quando o cliente clica em Aprovar, o ApproveFlow registra o nome, data e horário da aprovação. Isso cria um comprovante claro de que o cliente deu o sinal verde para aquele arquivo específico.",
  },
];

export default function AprovarDesignClientePage() {
  return (
    <ToolLandingPagePT
      headline="Aprovar design com cliente online"
      description="Envie seu design, gere um link de revisão e permita que seu cliente aprove ou solicite mudanças — sem precisar de conta."
      faq={FAQ}
    />
  );
}
