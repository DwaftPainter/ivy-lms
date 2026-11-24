# Database Documentation

Complete reference for the IVY LMS database schema and models.

---

## Overview

IVY LMS uses **PostgreSQL** as its primary database with **Prisma ORM** for type-safe database access. The schema is designed to support a multi-role learning management system with IELTS-specific features.

---

## Schema Location

```
prisma/
├── schema.prisma      # Main schema definition
├── migrations/          # Database migrations
└── seed.ts             # Seed data script
```

---

## Enumerations

### Role
```prisma
enum Role {
  TEACHER
  STUDENT
  ADMIN
}
```

### IeltsSkill
```prisma
enum IeltsSkill {
  LISTENING
  READING
  WRITING
  SPEAKING
}
```

### AssignmentType
```prisma
enum AssignmentType {
  WRITING_TASK1
  WRITING_TASK2
  SPEAKING
  LISTENING
  READING
  MOCK_TEST
}
```

### SubmissionStatus
```prisma
enum SubmissionStatus {
  PENDING
  SUBMITTED
  GRADED
  RETURNED
}
```

### EnrollmentStatus
```prisma
enum EnrollmentStatus {
  STUDYING
  DONE
  UPCOMING
}
```

### CourseLevel
```prisma
enum CourseLevel {
  BEGINNER     // Band 0–4
  INTERMEDIATE // Band 4.5–6
  ADVANCED     // Band 6.5–9
}
```

### AuthProvider
```prisma
enum AuthProvider {
  LOCAL
  GOOGLE
}
```

### UserStatus
```prisma
enum UserStatus {
  ACTIVE
  LOCKED
}
```

### LessonType
```prisma
enum LessonType {
  VIDEO
  DOCUMENT
  QUIZ
  LIVE_SESSION
}
```

---

## Core Models

### User
Central user model for all roles (admin, teacher, student).

```prisma
model User {
  id                  String       @id @default(uuid())
  email               String       @unique
  password            String?      // Nullable for OAuth users
  firstName           String
  lastName            String
  avatarUrl           String?
  role                Role
  isActive            Boolean      @default(true)
  authProvider        AuthProvider
  
  // Security
  status              UserStatus   @default(ACTIVE)
  failedLoginAttempts Int        @default(0)
  lockedAt            DateTime?
  
  // Timestamps
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  
  // Relations
  teacherProfile      TeacherProfile?
  studentProfile      StudentProfile?
  notifications       Notification[]
  submissionComments  SubmissionComment[]
}
```

---

### TeacherProfile
Extended profile for teachers.

```prisma
model TeacherProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  bio         String?
  specialties IeltsSkill[]
  
  // Relations
  courses     Course[]
}
```

---

### StudentProfile
Extended profile for students.

```prisma
model StudentProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  targetBand      Float?
  currentBand     Float?
  studyGoal       String?
  
  // Relations
  enrollments     Enrollment[]
  submissions     Submission[]
}
```

---

### Course
Represents a learning course.

```prisma
model Course {
  id           String      @id @default(uuid())
  name         String
  description  String?
  level        CourseLevel
  
  teacherId    String
  teacher      TeacherProfile @relation(fields: [teacherId], references: [id])
  
  startDate    DateTime?
  endDate      DateTime?
  
  isActive     Boolean     @default(true)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  // Relations
  lessons      Lesson[]
  assignments  Assignment[]
  enrollments  Enrollment[]
}
```

---

### Lesson
Individual lessons within a course.

```prisma
model Lesson {
  id          String     @id @default(uuid())
  title       String
  description String?
  type        LessonType
  content     Json?      // Flexible content storage
  order       Int        // Display order
  
  courseId    String
  course      Course     @relation(fields: [courseId], references: [id])
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

---

### Assignment
Homework and assessments.

```prisma
model Assignment {
  id           String         @id @default(uuid())
  title        String
  type         AssignmentType
  instructions String
  
  // For writing assignments
  prompt       String?
  wordLimit    Int?
  
  // For listening/reading
  passages     Passage[]
  questions    Question[]
  
  dueDate      DateTime?
  maxScore     Float        @default(9.0)
  
  // Rubric for grading
  rubric       Json?
  
  courseId     String
  course       Course       @relation(fields: [courseId], references: [id])
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  // Relations
  submissions  Submission[]
}
```

---

### Passage
Reading/listening passages for assignments.

```prisma
model Passage {
  id            String     @id @default(uuid())
  title         String?
  content       String     // Text content or transcript
  audioUrl      String?    // For listening passages
  
  assignmentId  String
  assignment    Assignment @relation(fields: [assignmentId], references: [id])
  
  // Relations
  questions     Question[]
}
```

---

### Question
Questions for reading/listening assignments.

```prisma
model Question {
  id            String        @id @default(uuid())
  content       String
  type          QuestionType  // MULTIPLE_CHOICE, FILL_BLANK, etc.
  options       Json?         // For multiple choice
  correctAnswer Json          // Flexible answer format
  points        Int          @default(1)
  order         Int
  
  assignmentId  String
  assignment    Assignment    @relation(fields: [assignmentId], references: [id])
  passageId     String?
  passage       Passage?      @relation(fields: [passageId], references: [id])
}
```

---

### Submission
Student assignment submissions.

```prisma
model Submission {
  id              String           @id @default(uuid())
  content         String?          // Text submission
  attachments     Json?            // File uploads
  
  status          SubmissionStatus @default(PENDING)
  score           Float?
  feedback        String?
  
  // AI Grading
  aiScore         Float?
  aiFeedback      String?
  aiCorrections   Json?            // Structured corrections
  
  submittedAt     DateTime?
  gradedAt        DateTime?
  
  assignmentId    String
  assignment      Assignment       @relation(fields: [assignmentId], references: [id])
  
  studentId       String
  student         StudentProfile   @relation(fields: [studentId], references: [id])
  
  graderId        String?
  gradedBy        User?            @relation(fields: [graderId], references: [id])
  
  // Relations
  comments        SubmissionComment[]
}
```

---

### Enrollment
Student course enrollments.

```prisma
model Enrollment {
  id        String          @id @default(uuid())
  status    EnrollmentStatus @default(UPCOMING)
  
  studentId String
  student   StudentProfile  @relation(fields: [studentId], references: [id])
  
  courseId  String
  course    Course          @relation(fields: [courseId], references: [id])
  
  enrolledAt DateTime       @default(now())
  
  @@unique([studentId, courseId])
}
```

---

### Notification
In-app notifications.

```prisma
model Notification {
  id        String   @id @default(uuid())
  type      String   // ASSIGNMENT, GRADE, SYSTEM
  title     String
  message   String
  data      Json?    // Additional payload
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

### SubmissionComment
Comments on submissions.

```prisma
model SubmissionComment {
  id          String     @id @default(uuid())
  content     String
  
  submissionId String
  submission  Submission @relation(fields: [submissionId], references: [id])
  
  authorId    String
  author      User       @relation(fields: [authorId], references: [id])
  
  createdAt   DateTime   @default(now())
}
```

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌───────────────┐
│    User      │───────│  TeacherProfile  │       │    Course     │
├──────────────┤       └──────────────────┘       ├───────────────┤
│ id (PK)      │                │                 │ id (PK)       │
│ email        │                │                 │ name          │
│ role         │                ▼                 │ teacherId(FK) │
│ password     │         ┌──────────┐           │ ...           │
└──────────────┘         │  Course  │           └───────┬───────┘
         │               └──────────┘                   │
         │                                               │
         │         ┌──────────────────┐                  │
         │         │  StudentProfile  │                  │
         │         ├──────────────────┤                  │
         └─────────│ userId (FK)      │◀─────────────────┘
                   │ targetBand       │      Enrollment
                   └────────┬─────────┘
                            │
                   ┌────────▼────────┐
                   │    Submission   │
                   ├─────────────────┤
                   │ id (PK)         │
                   │ studentId (FK)  │
                   │ assignmentId(FK)│
                   │ status          │
                   │ score           │
                   └─────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Assignment    │
                   ├─────────────────┤
                   │ id (PK)         │
                   │ courseId (FK)   │
                   │ type            │
                   │ instructions    │
                   └─────────────────┘
```

---

## Common Queries

### Get Student with Enrollments
```typescript
const student = await prisma.studentProfile.findUnique({
  where: { userId },
  include: {
    user: true,
    enrollments: {
      include: { course: true }
    }
  }
});
```

### Get Course with Lessons and Assignments
```typescript
const course = await prisma.course.findUnique({
  where: { id },
  include: {
    teacher: { include: { user: true } },
    lessons: { orderBy: { order: 'asc' } },
    assignments: true,
    enrollments: { include: { student: true } }
  }
});
```

### Get Submissions Pending Grading
```typescript
const submissions = await prisma.submission.findMany({
  where: { status: 'SUBMITTED' },
  include: {
    student: { include: { user: true } },
    assignment: true
  },
  orderBy: { submittedAt: 'asc' }
});
```

---

## Migrations

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Deploy Migrations (Production)
```bash
npx prisma migrate deploy
```

### Reset Database
```bash
npx prisma migrate reset
```

---

## Database Seeding

Seed file location: `prisma/seed.ts`

### Run Seed
```bash
npx prisma db seed
```

---

## Performance Considerations

1. **Indexing** - Primary keys and foreign keys are automatically indexed
2. **Soft Deletes** - Use `isActive` flag instead of hard deletes
3. **Connection Pooling** - Prisma manages connection pooling automatically
4. **Query Optimization** - Use `select` and `include` to fetch only needed data
