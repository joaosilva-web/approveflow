import type { Metadata } from "next";
import ToolLandingPage from "@/features/marketing/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Client Approval Tool — Freelancer File Review — ApproveFlow",
  description:
    "Stop chasing email approvals. Upload any deliverable, share a review link, and get a formal client sign-off with name and timestamp. Free for freelancers.",
  openGraph: {
    title: "Client Approval Tool for Freelancers",
    description:
      "Get formal client approvals on any deliverable. Upload, share a link, done. Free and instant.",
    type: "website",
  },
};

const FAQ = [
  {
    q: "How do I get clients to formally approve deliverables?",
    a: "Upload your deliverable here and share the review link. The client opens it in their browser, reviews the file, and clicks 'Approve' to give formal sign-off. ApproveFlow records their name, timestamp, and any comments — giving you a clear paper trail.",
  },
  {
    q: "What types of files can I get client approval on?",
    a: "Any image file (designs, illustrations, photos), PDF documents (reports, contracts, proposals), and video files up to 20 MB. Use a free account for larger files and to manage multiple projects.",
  },
  {
    q: "Why do freelancers need a client approval tool?",
    a: "Email approvals are vague and hard to track ('sounds good!' doesn't protect you in disputes). A formal approval record with a timestamp and client name protects you, sets clear expectations, and professionalises your workflow.",
  },
  {
    q: "Is ApproveFlow free for freelancers?",
    a: "Yes. Guest review links are completely free and require no signup. Create a free account to get permanent links, a project dashboard, version history, and client notifications.",
  },
];

export default function ClientApprovalToolPage() {
  return (
    <ToolLandingPage
      headline="Client Approval Tool for Freelancers"
      description="Upload any deliverable and get a formal client sign-off. Share a review link — your client can approve or request changes directly in the browser, no account needed."
      faq={FAQ}
    />
  );
}
