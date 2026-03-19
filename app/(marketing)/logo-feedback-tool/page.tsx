import type { Metadata } from "next";
import ToolLandingPage from "@/features/marketing/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Logo Feedback Tool — Share Logos for Client Review — ApproveFlow",
  description:
    "Share logo concepts with clients and collect clear feedback. Upload your logo file, generate a review link, and get a formal approval — completely free.",
  openGraph: {
    title: "Logo Feedback Tool — Client Logo Review Made Easy",
    description:
      "Upload logo designs, share a review link, and get client approval in minutes. No login required for your client.",
    type: "website",
  },
};

const FAQ = [
  {
    q: "What is the best way to share a logo with a client for feedback?",
    a: "Upload your logo file here and share the generated review link. Your client sees the logo at full resolution, can leave pinned comments pointing at specific elements (e.g. 'make the icon bigger'), and can formally approve or request changes.",
  },
  {
    q: "How do I collect feedback on multiple logo variations?",
    a: "Create a separate review link for each variation, or combine them in a single image showing all options side by side. Clients can pin comments on each option and tell you which to proceed with.",
  },
  {
    q: "Does my client need an account to leave logo feedback?",
    a: "No. Clients open the link, enter their name, and start commenting immediately. There's nothing to install or sign up for on the client side.",
  },
  {
    q: "How do I get a formal sign-off on a logo?",
    a: "Once the client is happy with the logo, they click the Approve button in the review page. ApproveFlow records their name and the timestamp of approval — giving you a clear record of client sign-off.",
  },
];

export default function LogoFeedbackToolPage() {
  return (
    <ToolLandingPage
      headline="Logo Feedback Tool — Share Logos for Client Review"
      description="Upload your logo concepts and get structured client feedback. Clients can pin comments on specific areas, then approve or request changes — no account required."
      faq={FAQ}
    />
  );
}
