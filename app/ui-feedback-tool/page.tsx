import type { Metadata } from "next";
import ToolLandingPage from "@/components/seo/ToolLandingPage";

export const metadata: Metadata = {
  title: "UI Feedback Tool — Get Design Feedback from Clients — ApproveFlow",
  description:
    "Share UI designs and mockups with clients for annotated feedback. Upload, share a link, let clients pin comments directly on the UI, then approve or request changes.",
  openGraph: {
    title: "UI Feedback Tool — Get Design Feedback from Clients",
    description:
      "Share UI/UX mockups and get pinned client feedback in seconds. Free, no sign-up required for clients.",
    type: "website",
  },
};

const FAQ = [
  {
    q: "How can I get feedback on a UI design from non-technical clients?",
    a: "Upload your UI screenshot or mockup here. Your client gets a link where they can click any element on the screen to leave a pinned comment — no design tools needed. The interface is as simple as clicking and typing.",
  },
  {
    q: "Can clients annotate specific parts of a UI mockup?",
    a: "Yes. When a client clicks on any area of the uploaded design, a comment popup appears anchored to that exact position. This creates numbered pins so you know precisely which element the feedback refers to.",
  },
  {
    q: "What UI file types are supported?",
    a: "You can upload any image format (PNG, JPG, WEBP) and PDF files. Most designers export frames from Figma or Sketch as PNG or PDF, which work perfectly with ApproveFlow.",
  },
  {
    q: "How is this better than sharing a Figma link?",
    a: "Figma links can confuse clients who aren't familiar with the tool. ApproveFlow gives clients a clean read-only view of the design with a simple Approve / Request Changes flow — no Figma account, no prototype confusion.",
  },
];

export default function UiFeedbackToolPage() {
  return (
    <ToolLandingPage
      headline="UI Feedback Tool — Get Design Feedback from Clients"
      description="Upload your UI mockups and share a clean review link. Clients can pin comments on specific elements, then approve or request changes without any tools or accounts."
      faq={FAQ}
    />
  );
}
