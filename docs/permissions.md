# Ownership & Permission Matrix

## Quick Reference

| Model | Owner | Create | Read (All) | Read (Public) | Update | Delete | Notes |
|-------|-------|--------|-----------|---------------|--------|--------|-------|
| **User** | Self | Anyone (Signup) | Admin | N/A | Self + Admin | Admin | Public signup, admin manages roles |
| **News** | Admin | Admin | Admin | Published only | Admin | Admin | Platform announcements |
| **Event** | Admin | Admin | Admin | Published only | Admin | Admin | Official club events |
| **Blog** | Author | Verified Member | Author + Admin | Published only | Author + Admin | Author + Admin | Member content |
| **EventRegistration** | User | Any Member | Self + Admin | N/A | Self + Admin | Admin | Track participation |
| **AuditLog** | System | System | Admin | N/A | None | None | Immutable audit trail |
| **AdminNote** | Admin | Admin | Admin | N/A | Admin | Admin | Internal notes only |

---

## Detailed Permissions

### User Model
- **Owner**: Self (each user owns their own record)
- **Create**: Anyone (via signup endpoint, creates MEMBER_UNVERIFIED)
- **Read**: Self (own profile) + Admin (all profiles)
- **Update**: Self (limited fields) + Admin (all fields including role)
- **Delete**: Admin only (soft delete)
- **Special**: Role transitions require admin approval

### News Model
- **Owner**: Admin authors
- **Create**: Admin only
- **Read**: 
  - Public: Published articles only
  - Admin: All articles (including drafts)
- **Update**: Admin only
- **Delete**: Admin only (soft delete)
- **Publishing**: Admin sets `status = PUBLISHED` and `publishedAt`

### Event Model
- **Owner**: Admin organizers
- **Create**: Admin only
- **Read**: 
  - Public: Published events only
  - Admin: All events (including drafts)
- **Update**: Admin only
- **Delete**: Admin only (soft delete)
- **Publishing**: Admin sets `status = PUBLISHED` and `publishedAt`
- **Capacity**: Admin manages registration limits

### Blog Model
- **Owner**: Author (verified member)
- **Create**: Verified member only (MEMBER_VERIFIED)
- **Read**: 
  - Public: Published blogs only
  - Author: Own blogs (all statuses)
  - Admin: All blogs
- **Update**: 
  - Author: Own blogs
  - Admin: All blogs
- **Delete**: 
  - Author: Own blogs (soft delete)
  - Admin: All blogs (soft delete)
- **Publishing**: Author sets `status = PUBLISHED` and `publishedAt`

### EventRegistration Model
- **Owner**: User registering
- **Create**: Any member (verified or unverified)
- **Read**: 
  - User: Own registrations
  - Admin: All registrations
- **Update**: 
  - User: Can cancel own registration (set `status = CANCELLED`)
  - Admin: Can modify any registration
- **Delete**: Admin only (soft delete)
- **Capacity Check**: System enforces event capacity limits
- **Audit**: All status changes logged in AuditLog

### AuditLog Model
- **Owner**: System
- **Create**: System only (automatic on mutations)
- **Read**: Admin only
- **Update**: None (immutable)
- **Delete**: None (permanent record)
- **Purpose**: Compliance and debugging

### AdminNote Model
- **Owner**: Admin author
- **Create**: Admin only
- **Read**: Admin only
- **Update**: Admin only (author or any admin)
- **Delete**: Admin only (soft delete)
- **Visibility**: Never exposed to public or members

---

## Role Capabilities

### ADMIN
- Full access to all models
- Can create News and Events
- Can manage user roles
- Can view audit logs
- Can create internal admin notes
- Can moderate member content (Blogs)

### MEMBER_VERIFIED
- Can create and manage own Blogs
- Can register for Events
- Can view published News, Events, Blogs
- Can view and cancel own EventRegistrations

### MEMBER_UNVERIFIED
- Can register for Events
- Can view published News, Events, Blogs
- Can view and cancel own EventRegistrations
- **Cannot** create Blogs (verification required)

---

## Authorization Rules

### General Principles
1. **Default Deny**: No access unless explicitly granted
2. **Soft Delete**: Always filter `deletedAt IS NULL` in queries
3. **Audit Trail**: Log all mutations to AuditLog
4. **Ownership**: Users can only modify their own content (except admins)
5. **Publication**: Only published content is visible to public

### Implementation Guards
Use auth guards from `src/lib/auth-guard.ts`:
- `requireAuth()`: Ensure user is logged in
- `requireRole(['ADMIN'])`: Admin-only endpoints
- `requireVerifiedMember()`: Verified member or admin

### Ownership Validation
On UPDATE/DELETE operations:
```typescript
// Example for Blog update
const blog = await prisma.blog.findUnique({ where: { id } });
if (blog.authorId !== session.userId && session.role !== 'ADMIN') {
  throw new Error('Forbidden');
}
```

### Public Read Access
Published content filtering:
```typescript
// Example for public blog list
const blogs = await prisma.blog.findMany({
  where: {
    status: 'PUBLISHED',
    deletedAt: null,
  }
});
```

---

## Audit Requirements

### Events to Audit
All mutations should create AuditLog entries:
- User role changes
- Content publishing/archiving
- Event registration state changes
- Admin actions (especially deletions)

### Audit Log Entry
```typescript
await prisma.auditLog.create({
  data: {
    entityType: 'Blog',
    entityId: blog.id,
    action: 'PUBLISH',
    userId: session.userId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    changes: JSON.stringify({ status: { from: 'DRAFT', to: 'PUBLISHED' } })
  }
});
```

---

## Special Cases

### Event Capacity Management
- Admin sets `capacity` on Event
- System counts CONFIRMED registrations
- Block new registrations if capacity reached
- Admin can override capacity limits

### Blog Ownership Transfer
- Not supported (author is permanent)
- Admin can take over via direct DB edit if needed
- Log ownership changes in AuditLog

### Soft Delete Cascade
- Deleting a User does NOT cascade to their content
- Content remains with `authorId` pointing to deleted user
- Admin notes remain for audit purposes
