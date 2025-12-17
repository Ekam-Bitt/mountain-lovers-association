# Database Models Documentation

## Overview
This document describes all database models for the Mountain Climbing Club platform.

---

## User Model
**Purpose**: Core authentication and user management.

### Fields
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `passwordHash`: Argon2 hashed password
- `role`: User role (MEMBER_UNVERIFIED, MEMBER_VERIFIED, ADMIN)
- `verifiedAt`: Timestamp when user was verified (nullable)
- `provider`, `providerId`: OAuth integration fields (future use)
- `createdAt`, `updatedAt`, `deletedAt`: Audit timestamps

### Relations
- `newsArticles[]`: News articles authored by admin
- `eventsOrganized[]`: Events organized by admin
- `blogs[]`: Blog posts authored by member
- `eventRegistrations[]`: Event registrations
- `auditLogs[]`: Audit trail entries
- `adminNotes[]`: Internal admin notes

### Indexes
- `email`: Fast user lookup
- `role`: Role-based queries

---

## News Model
**Purpose**: Platform news and announcements (admin-controlled).

### Fields
- `id`: Unique identifier
- `title`: Article title
- `slug`: URL-friendly identifier (unique)
- `content`: Full article content
- `excerpt`: Short summary (optional)
- `status`: Publication status (DRAFT, PUBLISHED, ARCHIVED)
- `publishedAt`: Publication timestamp (nullable)
- `authorId`: Reference to User (admin)
- `createdAt`, `updatedAt`, `deletedAt`: Audit timestamps

### Relations
- `author`: User who created the article (admin)

### Indexes
- `slug`: Fast URL lookup
- `status`: Filter by publication status
- `publishedAt`: Chronological ordering
- `authorId`: Author-based queries

### Ownership Rules
- **Create**: Admin only
- **Read**: Public (if PUBLISHED), Admin (all)
- **Update**: Admin only
- **Delete**: Admin only (soft delete)

---

## Event Model
**Purpose**: Climbing events and activities.

### Fields
- `id`: Unique identifier
- `title`: Event title
- `slug`: URL-friendly identifier (unique)
- `description`: Event details
- `location`: Event location
- `status`: Publication status (DRAFT, PUBLISHED, ARCHIVED)
- `startDate`, `endDate`: Event date range
- `capacity`: Maximum participants (null = unlimited)
- `publishedAt`: Publication timestamp (nullable)
- `organizerId`: Reference to User (admin)
- `createdAt`, `updatedAt`, `deletedAt`: Audit timestamps

### Relations
- `organizer`: User who created the event (admin)
- `registrations[]`: Event registrations

### Indexes
- `slug`: Fast URL lookup
- `status`: Filter by publication status
- `startDate`: Chronological ordering
- `organizerId`: Organizer-based queries

### Ownership Rules
- **Create**: Admin only
- **Read**: Public (if PUBLISHED), Admin (all)
- **Update**: Admin only
- **Delete**: Admin only (soft delete)

---

## Blog Model
**Purpose**: Member-contributed blog posts.

### Fields
- `id`: Unique identifier
- `title`: Post title
- `slug`: URL-friendly identifier (unique)
- `content`: Full post content
- `excerpt`: Short summary (optional)
- `status`: Publication status (DRAFT, PUBLISHED, ARCHIVED)
- `publishedAt`: Publication timestamp (nullable)
- `authorId`: Reference to User (verified member)
- `createdAt`, `updatedAt`, `deletedAt`: Audit timestamps

### Relations
- `author`: User who created the post (verified member)

### Indexes
- `slug`: Fast URL lookup
- `authorId`: Author-based queries
- `status`: Filter by publication status
- `publishedAt`: Chronological ordering

### Ownership Rules
- **Create**: Verified member only
- **Read**: Public (if PUBLISHED), Author + Admin (all)
- **Update**: Author + Admin
- **Delete**: Author + Admin (soft delete)

---

## EventRegistration Model
**Purpose**: Track member registrations for events.

### Fields
- `id`: Unique identifier
- `status`: Registration status (PENDING, CONFIRMED, CANCELLED)
- `registeredAt`: Registration timestamp
- `cancelledAt`: Cancellation timestamp (nullable)
- `eventId`: Reference to Event
- `userId`: Reference to User
- `createdAt`, `updatedAt`, `deletedAt`: Audit timestamps

### Relations
- `event`: The event being registered for
- `user`: The user registering

### Constraints
- **Unique**: (eventId, userId) - One registration per user per event

### Indexes
- `status`: Filter by registration status
- `eventId`: Event-based queries
- `userId`: User-based queries

### Ownership Rules
- **Create**: Any member (verified or unverified)
- **Read**: Self + Admin
- **Update**: Self (cancel only) + Admin
- **Delete**: Admin only (soft delete)

### Audit Requirements
All state changes must be logged in AuditLog.

---

## AuditLog Model
**Purpose**: Immutable audit trail of system changes.

### Fields
- `id`: Unique identifier
- `entityType`: Type of entity (e.g., "User", "Event", "Blog")
- `entityId`: ID of the affected entity
- `action`: Action performed (e.g., "CREATE", "UPDATE", "DELETE", "PUBLISH")
- `changes`: JSON string of changes (optional)
- `ipAddress`: IP address of request (optional)
- `userAgent`: User agent string (optional)
- `userId`: Reference to User who performed action (nullable)
- `createdAt`: Timestamp

### Relations
- `user`: User who performed the action (optional)

### Indexes
- `entityType`: Filter by entity type
- `entityId`: Entity-based queries
- `userId`: User action history
- `createdAt`: Chronological ordering

### Ownership Rules
- **Create**: System only (automatic)
- **Read**: Admin only
- **Update**: None (immutable)
- **Delete**: None (immutable)

---

## AdminNote Model
**Purpose**: Internal notes for administrative use.

### Fields
- `id`: Unique identifier
- `entityType`: Type of entity (e.g., "User", "Event")
- `entityId`: ID of the related entity
- `content`: Note content
- `authorId`: Reference to User (admin)
- `createdAt`, `updatedAt`, `deletedAt`: Audit timestamps

### Relations
- `author`: Admin who created the note

### Indexes
- `entityType`: Filter by entity type
- `entityId`: Entity-based queries
- `authorId`: Author-based queries

### Ownership Rules
- **Create**: Admin only
- **Read**: Admin only
- **Update**: Admin only
- **Delete**: Admin only (soft delete)

---

## Status Values Reference

### Content Status (News, Event, Blog)
- `DRAFT`: Not visible to public, editable
- `PUBLISHED`: Visible to public, read-only metadata
- `ARCHIVED`: Hidden from public, preserved for reference

### Registration Status (EventRegistration)
- `PENDING`: Awaiting confirmation
- `CONFIRMED`: Registration confirmed
- `CANCELLED`: Registration cancelled

---

## Soft Delete Pattern
All models (except AuditLog) include `deletedAt` timestamp for soft deletion:
- `null`: Record is active
- `DateTime`: Record is deleted (timestamp of deletion)

**Important**: All queries must filter `WHERE deletedAt IS NULL` to exclude deleted records.
