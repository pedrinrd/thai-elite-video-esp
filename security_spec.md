# Security Specification — THAI ELITE MÉXICO

## 1. Data Invariants
1. **Global Deny-by-Default**: Any path not explicitly matched in `firestore.rules` is unconditionally denied (`allow read, write: if false`).
2. **Verified Identity**: All write operations require `request.auth != null && request.auth.token.email_verified == true`.
3. **Admin Privilege Integrity**: Users cannot self-assign `role == 'admin'` or `plan == 'VIP'` on `/users/{userId}` unless they are a verified administrator (`isAdmin()`).
4. **PII Isolation (`/users/{userId}`)**: User profiles contain `email` (PII) and are strictly readable only by the document owner (`request.auth.uid == userId` and `resource.data.uid == request.auth.uid`) or `isAdmin()`.
5. **Relational & Referential Integrity (`/videos/{videoId}`)**: A video cannot be created unless its parent module `/modules/$(incoming().moduleId)` exists in Firestore.
6. **Student Progress Isolation (`/progress/{userId}`)**: A student can only read, create, or update their own `/progress/{userId}` document (`userId == request.auth.uid`), with immutable `userId` and `createdAt`, and server-enforced `request.time` timestamps.
7. **Content Immutability for Non-Admins**: Only administrators (`isAdmin()`) can create, update, or delete `/modules/{moduleId}`, `/videos/{videoId}`, `/bonuses/{bonusId}`, and `/liveClasses/{classId}`.
8. **Secure List Queries**: Every `allow list` rule enforces a `resource.data` constraint (`resource.data.visibility == 'published'`, `resource.data.visibility == 'vip'`, or `resource.data.uid == request.auth.uid`).

## 2. The "Dirty Dozen" Payloads (All Must Return `PERMISSION_DENIED`)
1. **Payload 1 (Privilege Escalation on Create)**: Authenticated student creates `/users/u1` with `{ role: 'admin', plan: 'VIP' }`.
2. **Payload 2 (Shadow Field Injection on Progress Update)**: Student updates `/progress/u1` adding ghost key `{ isAdmin: true }`.
3. **Payload 3 (Email Spoofing Without Verification)**: Request with `email: 'pedrinho.pedro248@gmail.com'` but `email_verified: false` attempts to write to `/modules/mod-01`.
4. **Payload 4 (PII Cross-User Read)**: Student `u2` attempts `get` on `/users/u1`.
5. **Payload 5 (Unconstrained List Scraping on Users)**: Student `u2` attempts `list` on `/users` without filtering `uid == request.auth.uid`.
6. **Payload 6 (Client Forged Timestamp)**: Student creates `/progress/u1` with a past or future `createdAt` not matching `request.time`.
7. **Payload 7 (Immutable Field Mutation)**: Student updates `/users/u1` attempting to mutate `createdAt` or `plan`.
8. **Payload 8 (Orphaned Video Creation)**: Admin creates `/videos/v1` referencing a non-existent `moduleId: 'non-existent-mod'`.
9. **Payload 9 (ID Poisoning / Oversized String)**: Student attempts to write a 2,000-character `name` string to `/users/u1`.
10. **Payload 10 (Student ContentTampering)**: Student attempts to `update` or `delete` `/videos/vid-01`.
11. **Payload 11 (Cross-User Progress Tampering)**: Student `u2` attempts to update `/progress/u1`.
12. **Payload 12 (Value Poisoning on Update)**: Student updates allowed key `name` in `/users/u1` with a boolean `true` instead of a bounded string.
