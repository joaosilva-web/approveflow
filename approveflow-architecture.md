# ApproveFlow -- Technical Architecture Guide

This document describes the technical architecture for the ApproveFlow
SaaS MVP.

Topics covered:

1.  PostgreSQL database architecture
2.  Secure public link token generation
3.  Secure file uploads using Supabase
4.  Image comments system similar to Figma

------------------------------------------------------------------------

# 1. PostgreSQL Database Architecture

The database should be designed for a multi‑tenant SaaS where each
freelancer manages multiple projects and deliveries.

## Main Entities

Users → freelancers using the system\
Projects → client projects\
Deliveries → uploaded files / versions\
Comments → feedback from clients\
Views → track when clients open links

## Suggested Schema

### users

Stores freelancer accounts.

    users
    id (uuid) PK
    name
    email
    password_hash
    created_at

### projects

Each freelancer can have multiple projects.

    projects
    id (uuid) PK
    user_id (uuid) FK -> users.id
    name
    client_name
    created_at

### deliveries

Each project can have multiple delivery versions.

    deliveries
    id (uuid) PK
    project_id (uuid) FK -> projects.id
    version_number
    file_url
    review_token
    status (pending | approved | changes_requested)
    expires_at
    created_at

### comments

Client feedback on a delivery.

    comments
    id (uuid) PK
    delivery_id (uuid) FK -> deliveries.id
    author_type (client | freelancer)
    content
    x_position (optional)
    y_position (optional)
    created_at

### views

Tracks access to public review links.

    views
    id (uuid) PK
    delivery_id (uuid)
    ip_address
    user_agent
    created_at

------------------------------------------------------------------------

# 2. Generating Secure Public Review Tokens

Public review links must be **impossible to guess**.

Example link:

    https://approveflow.com/review/8f4K2jLmPq7xTz1QW

## Security Requirements

Tokens must:

-   have at least 128 bits of entropy
-   be random
-   not be sequential
-   not expose database IDs

## Token Generation Example (Node.js)

    import crypto from "crypto"

    function generateReviewToken() {
      return crypto.randomBytes(24).toString("hex")
    }

This produces a 48‑character hexadecimal token.

Example:

    f7c3b0e9b4d2c9d11e73eac1c94f0b8e67e9a7e6b2a1c4

## Route Example

    /review/[token]

Server logic:

1.  find delivery by token
2.  verify expiration
3.  record view
4.  return delivery data

------------------------------------------------------------------------

# 3. Secure File Upload with Supabase

Supabase Storage is ideal for SaaS MVPs.

Files must never be publicly exposed directly.

## Upload Flow

1.  User uploads file
2.  File stored in Supabase bucket
3.  Database stores path reference
4.  App generates **signed URL** for preview/download

## Upload Example

    const { data, error } = await supabase.storage
      .from("deliveries")
      .upload(`user-${userId}/${file.name}`, file)

## Generating a Signed URL

    const { data } = await supabase.storage
      .from("deliveries")
      .createSignedUrl(filePath, 60 * 60)

This URL expires after 1 hour.

Benefits:

-   prevents direct file sharing
-   protects storage paths
-   limits unauthorized downloads

## Recommended Bucket Configuration

Bucket: `deliveries`

Settings:

-   private bucket
-   access only through signed URLs

------------------------------------------------------------------------

# 4. Image Comment System (Figma‑Style)

One powerful feature is allowing clients to comment directly on the
image.

Example:

User clicks on a point in the design and leaves feedback.

    "Make this button blue"

## How It Works

1.  Image is rendered in a container
2.  Client clicks a coordinate
3.  Position is saved
4.  Comment marker appears

## Capturing Click Position

Example using React:

    function handleImageClick(event) {
      const rect = event.target.getBoundingClientRect()

      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      saveComment(x, y)
    }

Coordinates are normalized between **0 and 1**.

Example stored values:

    x = 0.42
    y = 0.63

This keeps markers correct even when the image resizes.

## Rendering Comment Markers

    <div
      className="absolute"
      style={{
        left: `${comment.x * 100}%`,
        top: `${comment.y * 100}%`
      }}
    >
      💬
    </div>

## Advantages

-   precise feedback
-   eliminates confusing messages
-   better collaboration

------------------------------------------------------------------------

# Future Improvements

Possible upgrades after MVP:

-   video timestamp comments
-   Figma integration
-   approval signatures
-   automatic delivery package
-   AI feedback summarization

------------------------------------------------------------------------

# Final Architecture Summary

Frontend

-   Next.js
-   React
-   TailwindCSS

Backend

-   Next.js API routes
-   PostgreSQL

Infrastructure

-   Supabase (database + storage)
-   CDN delivery

Security

-   cryptographic tokens
-   signed URLs
-   optional link expiration
