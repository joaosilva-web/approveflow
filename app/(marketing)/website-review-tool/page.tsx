import type { Metadata } from "next";
import ToolLandingPage from "@/features/marketing/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Website Review Tool — Get Client Feedback Online — ApproveFlow",
  description:
    "Share website screenshots or mockups with clients for review and approval. Generate a feedback link instantly — no account needed for your client.",
  openGraph: {
    title: "Website Review Tool — Get Client Feedback Online",
    description:
      "Upload website mockups or screenshots, share a review link, and get clear client approval or change requests.",
    type: "website",
  },
};

const FAQ = [
  {
    q: "How can I get client feedback on a website design?",
    a: "Export your website design as an image or PDF, then upload it here. ApproveFlow generates a shareable review link where clients can click any area to pin a comment, then formally approve the design or request changes.",
  },
  {
    q: "What's the easiest way to present a web design to a client?",
    a: "Share a direct preview link. Your client opens it in their browser, sees the design exactly as intended, and can interact with it immediately without installing anything or creating an account.",
  },
  {
    q: "Can clients approve a website without signing up?",
    a: "Yes. Clients receive a link, open it, and click Approve or Request Changes. They only need to enter their name — no email address or account required. You see the approval status update in real time.",
  },
  {
    q: "How is this different from sending a PDF attachment?",
    a: "PDFs can't capture structured feedback, don't track views, and make it hard to confirm the client actually approved. ApproveFlow creates a clear approval record with the client's name, timestamp, and any comments they left.",
  },
];

export default function WebsiteReviewToolPage() {
  return (
    <ToolLandingPage
      headline="Website Feedback Tool — Get Client Approval Online"
      description="Upload your website mockup or screenshot and share it with your client for quick feedback. They can approve it or request changes directly in the browser."
      faq={FAQ}
    />
  );
}
