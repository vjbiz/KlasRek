# Security Specification: Thai Class Record System

## 1. Data Invariants
1. **Teacher Ownership Integrity**: A class record in `/classes/{classId}` MUST have `teacherId == request.auth.uid`. A user cannot claim or create a class under another teacher's UID.
2. **Relational Master Gate**: A student in `/classes/{classId}/students/{studentId}` MUST belong to an existing class owned by the authenticated teacher (`get(/databases/$(database)/documents/classes/$(classId)).data.teacherId == request.auth.uid`).
3. **Identity Immutability**: The `teacherId`, `classId`, and `id` properties of classes and student records can never be mutated after creation (`incoming().teacherId == existing().teacherId`).
4. **Temporal Integrity**: All timestamp writes (`createdAt`, `updatedAt`) MUST be strictly validated with `request.time`.
5. **ID Poisoning Guard**: Document IDs (`classId`, `studentId`) must be valid alphanumeric identifiers `<= 128` characters.
6. **Strict Keys & Size Bounds**: Every string property must be bounded (`.size() <= MAX`). No shadow or unexpected keys permitted.
7. **Score Bounds**: Test scores and numeric fields must be non-negative numbers within valid ranges (`number >= 0 && number <= 100`).
8. **Catch-All Safety Net**: The root default rule MUST deny all operations `match /{document=**} { allow read, write: if false; }`.

## 2. The "Dirty Dozen" Malicious Payloads (Tested for PERMISSION_DENIED)
1. **Payload 1 (Identity Spoofing - Class)**: Unauthenticated user or User B attempting to create `/classes/class1` with `teacherId: "UserA"`.
2. **Payload 2 (Orphaned Student Write)**: Creating a student under `/classes/nonexistentClass/students/s1` where the parent class does not exist.
3. **Payload 3 (Teacher Hijack on Update)**: Teacher A updating existing class to change `teacherId: "TeacherB"`.
4. **Payload 4 (Ghost Field Injection)**: Inserting `isAdmin: true` or `superUser: true` in class or student payload.
5. **Payload 5 (Path Traversal / ID Poisoning)**: Creating class with ID containing path characters `../../admin`.
6. **Payload 6 (Oversized Payload / Denial of Wallet)**: Submitting a 500KB string for `subjectName`.
7. **Payload 7 (Negative Roll Number)**: Attempting to save student with roll call `number: -5`.
8. **Payload 8 (Invalid Timestamp Spoofing)**: Submitting a client-provided past timestamp `createdAt: "1999-01-01"` instead of `request.time`.
9. **Payload 9 (Unauthorized Student Record Mutation)**: User C modifying student grades belonging to User A's class.
10. **Payload 10 (Unauthorized Class Deletion)**: Non-owner trying to delete `/classes/{classId}`.
11. **Payload 11 (Blanket List Scraping)**: Trying to list all classes in the database without `where('teacherId', '==', auth.uid)`.
12. **Payload 12 (Invalid Attendance Remark)**: Attempting to insert arbitrary long text like `"HACKED"` into attendance remark instead of allowed keys or short codes.
