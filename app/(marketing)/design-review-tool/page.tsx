import type { Metadata } from "next";
import ToolLandingPage from "@/components/seo/ToolLandingPage";

export const metadata: Metadata = {
  title: "Free Design Review Tool for Client Feedback — ApproveFlow",
  description:
    "Share your designs with clients and get instant feedback. Upload any design file, generate a review link, and let clients approve or request changes — no account needed.",
  openGraph: {
    title: "Free Design Review Tool for Client Feedback",
    description:
      "Upload a design, generate a review link, get client approval. Free and instant — no sign-up required.",
    type: "website",
  },
};

const FAQ = [
  {
    q: "What is a design review tool?",
    a: "A design review tool lets you share design files with clients and collect structured feedback. Instead of emailing files back and forth, you upload your design once, share a review link, and clients can pin comments directly on the design, then approve or request changes.",
  },
  {
    q: "How do I share a design for client feedback?",
    a: "Upload your file using the widget above. ApproveFlow generates a unique review link you can copy and send to your client via email, WhatsApp, or Slack. The client opens the link in any browser — no app install required.",
  },
  {
    q: "Is this tool free?",
    a: "Yes. Guest review links are completely free. You can generate as many links as you need. Free links expire after 7 days. Create a free account to keep your projects permanently and manage all reviews in one dashboard.",
  },
  {
    q: "What file types can I share for design review?",
    a: "You can upload PNG, JPG, WEBP, SVG and other image formats, PDF files, and video files up to 20 MB. For larger files or entire design systems, create a free account to unlock higher limits.",
  },
];

export default function DesignReviewToolPage() {
  return (
    <ToolLandingPage
      headline="Free Design Review Tool for Client Feedback"
      description="Upload your design, share a link, and let clients approve or request changes — no login required on either side. Works on any device."
      faq={FAQ}
    />
  );
}
