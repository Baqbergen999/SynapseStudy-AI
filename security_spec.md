# Security Specification — SynapseStudy AI Firestore Rules

## 1. Data Invariants
1. Every document under `/users/{userId}` contains private PII (`email`, `photoURL`) and can ONLY be read or written by the verified Google user whose `request.auth.uid == userId`.
2. Every note under `/users/{userId}/notes/{noteId}` MUST have `ownerId == request.auth.uid`, `id == noteId`, valid enum values (`subject`, `language`, `depth`, `engine`), bounded string lengths, and server-validated `updatedAt == request.time`.
3. Every project under `/users/{userId}/projects/{projectId}` MUST have `ownerId == request.auth.uid`, `id == projectId`, valid enum values (`subject`, `goalMode`, `language`, `engine`), bounded arrays (`days.size() <= 31`), and server-validated `updatedAt == request.time`.
4. Blanket reads (`allow read: if isSignedIn();`), unverified emails (`email_verified != true`), shadow/ghost fields, and client-forged timestamps are strictly rejected.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated read on `/users/userA` -> PERMISSION_DENIED
2. Cross-user read on `/users/userB/notes/note1` by `userA` -> PERMISSION_DENIED
3. Unverified email user writing `/users/userA` -> PERMISSION_DENIED
4. Shadow field injection (`isAdmin: true`) on `/users/userA` -> PERMISSION_DENIED
5. Spoofed `ownerId: 'userB'` in `/users/userA/notes/n1` -> PERMISSION_DENIED
6. Oversized document ID (`1500` chars) on `/users/userA/notes/{id}` -> PERMISSION_DENIED
7. Invalid `subject: 'Hacking'` enum in `/users/userA/notes/n1` -> PERMISSION_DENIED
8. Client-forged `updatedAt` timestamp not equal to `request.time` -> PERMISSION_DENIED
9. Mutating immutable `ownerId` or `createdAt` on note update -> PERMISSION_DENIED
10. Unbounded array (>31 days) in `/users/userA/projects/p1` -> PERMISSION_DENIED
11. `rawTranscript` exceeding `100000` characters -> PERMISSION_DENIED
12. `list` query by `userA` on `/users/userB/notes` -> PERMISSION_DENIED
