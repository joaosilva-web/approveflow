# File Approval SaaS -- Product Specification

## Overview

A lightweight SaaS designed for freelancers to **send files to clients
and get structured approvals** without messy communication across
WhatsApp, email, or Google Drive.

The core philosophy is:

-   No client login required
-   Extremely simple workflow
-   Clear approval trail
-   Secure file sharing

Primary users:

-   Designers
-   Developers
-   Video editors
-   Social media managers
-   Copywriters
-   UX/UI professionals

------------------------------------------------------------------------

# Core Workflow

1.  Freelancer uploads a file or delivery.
2.  System generates a **secure public review link**.
3.  Client opens the link.
4.  Client can:
    -   Approve
    -   Request changes
    -   Leave comments directly on the file.
5.  Freelancer receives notification.
6.  New versions can be uploaded and tracked.

------------------------------------------------------------------------

# Core Features

## 1. Secure Upload System

Freelancers can upload:

-   Images
-   PDFs
-   Videos
-   Documents
-   ZIP files

Technical notes:

-   Files stored in secure storage (S3 / Supabase Storage).
-   Signed access URLs generated for preview/download.
-   File size limits configurable per plan.

Security protections:

-   Files never exposed directly via storage path.
-   Access always proxied through application layer.

------------------------------------------------------------------------

## 2. Public Review Link (Client Portal)

Each delivery generates a **public but secure link**.

Example:

    https://approve.seusite.com/review/8f4K2jLmPq

Characteristics:

-   No account required for the client.
-   Mobile-first interface.
-   Link contains **random cryptographic token**.

The client sees:

-   File preview
-   Version history
-   Approval buttons
-   Comment section

------------------------------------------------------------------------

## 3. Approval Actions

The client has three main actions:

### Approve

Confirms the delivery is accepted.

Result:

-   Approval stored with timestamp.
-   Optional digital signature (name/email).
-   Status changes to **Approved**.

### Request Changes

Client leaves feedback requesting adjustments.

Result:

-   Status changes to **Changes Requested**
-   Freelancer receives notification.

### Download

Client can download the current version.

------------------------------------------------------------------------

## 4. Version History

Each update becomes a new version.

Example:

Version history:

-   v1 -- Initial delivery
-   v2 -- Color adjustments
-   v3 -- Final version

Clients can:

-   Compare versions
-   Download older versions
-   Comment on specific versions

This prevents confusion like:

"Which file is the final version?"

------------------------------------------------------------------------

## 5. Comment System

Clients can leave comments directly in the interface.

Example:

    "Could you make the blue darker?"

Comments are:

-   Timestamped
-   Linked to specific version
-   Notified to freelancer

Future upgrade:

-   Comments pinned to image coordinates (design feedback).

------------------------------------------------------------------------

# Notifications

Freelancer receives notifications when:

-   Client views the file
-   Client comments
-   Client requests changes
-   Client approves

Channels:

-   Email
-   In-app notifications

Future:

-   Slack / Discord integration.

------------------------------------------------------------------------

# Security of Public Links

Because links are public, security is essential.

## 1. Cryptographically Secure Tokens

Links are generated using strong random tokens:

Example:

    8f4K2jLmPq7xTz1QW

Requirements:

-   Minimum 128-bit entropy
-   Non-sequential
-   Impossible to guess

------------------------------------------------------------------------

## 2. Optional Email Verification

Freelancer can require client email confirmation.

Workflow:

1.  Client opens link
2.  Enters email
3.  Receives one-time code
4.  Access granted

This prevents link forwarding abuse.

------------------------------------------------------------------------

## 3. Access Expiration

Freelancers can define:

-   7 days
-   30 days
-   No expiration

Expired links require regeneration.

------------------------------------------------------------------------

## 4. Activity Tracking

System logs:

-   Who accessed
-   When
-   IP address
-   Device type

Useful for:

-   audit trails
-   proof of delivery

------------------------------------------------------------------------

## 5. Optional Password Protection

Freelancer can protect a delivery with a password.

Example:

    Password: projeto123

Used for sensitive projects.

------------------------------------------------------------------------

## 6. Download Control

Options:

-   Allow download
-   Disable download (preview only)
-   Watermark preview

Useful for designers sending drafts.

------------------------------------------------------------------------

# UX Feature That Increases Retention

One simple feature dramatically increases engagement:

## Inline Feedback Instead of Messaging

When a client tries to leave the page or download a file, the UI gently
prompts:

"Need changes? Leave feedback here."

Example quick feedback buttons:

-   👍 Looks good
-   🔁 Small changes needed
-   ❌ Not approved yet

Clicking one opens the comment field.

Why this works:

Most clients instinctively want to send feedback through:

-   WhatsApp
-   Email

This feature **captures feedback before they leave the page**, training
clients to communicate directly inside the platform.

Over time:

Clients naturally return to the review link instead of external
messaging apps.

Result:

-   Higher retention
-   Cleaner project history
-   Less chaos for freelancers

------------------------------------------------------------------------

# Future Features

Possible roadmap:

-   Visual markup on images
-   Video timestamp comments
-   Figma integration
-   Payment after approval (Pix / Stripe)
-   AI summary of feedback
-   Automatic final delivery package

------------------------------------------------------------------------

# Suggested Tech Stack

Frontend

-   Next.js
-   React

Backend

-   Node.js / API routes
-   PostgreSQL

Infrastructure

-   Supabase
-   S3 storage
-   CDN for file delivery

Authentication

-   Magic links for freelancers
-   Token access for clients

------------------------------------------------------------------------

# Pricing Suggestion

Free

-   3 active projects

Pro

-   R\$29/month
-   Unlimited projects

Studio

-   R\$59/month
-   Team features
