-- IVY LMS fixtures for disposable development and QA databases.
-- Apply after Prisma migrations. Run this entire file in one connection.
-- Sign in as admin, teacher, student, student2, or empty @ivy-mock.test.
-- All five accounts use the public fixture password IvyMock2026.
-- Reruns add missing fixtures and refresh fixture schedule dates and deadlines.
-- This script never deletes rows. Use only on a development database.

BEGIN;

SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh';

CREATE TEMP TABLE ivy_mock_seed_context ON COMMIT DROP AS
SELECT
    CURRENT_DATE AS today,
    date_trunc('month', CURRENT_DATE)::date AS month_start,
    -- Half-second PCM WAV tone for testing audio controls without external media.
    'data:audio/wav;base64,' || replace(encode(
        decode('52494646c40f000057415645666d74201000000001000100401f0000401f00000100080064617461a00f0000', 'hex')
        || decode(string_agg(
            lpad(to_hex(128 + round(30 * sin(2 * pi() * 440 * n / 8000))::integer), 2, '0'),
            '' ORDER BY n
        ), 'hex'),
        'base64'
    ), chr(10), '') AS audio_url
FROM generate_series(0, 3999) AS samples(n);

-- Accounts and profiles
INSERT INTO users (id, email, password, "firstName", "lastName", role, "authProvider", "updatedAt")
SELECT
    'ivy-mock-user-' || account,
    account || '@ivy-mock.test',
    '$2b$10$xdxihbqTvfgmzDQtvhSzVu530mPSTg1IMB20ITNYzBWbaFSP31/oe',
    first_name, last_name, role::"Role", 'LOCAL', now()
FROM (VALUES
    ('admin', 'Alex', 'Morgan', 'ADMIN'),
    ('teacher', 'Linh', 'Nguyen', 'TEACHER'),
    ('student', 'Mai', 'Tran', 'STUDENT'),
    ('student2', 'Anh', 'Le', 'STUDENT'),
    ('empty', 'Kim', 'Pham', 'STUDENT')
) AS accounts(account, first_name, last_name, role)
ON CONFLICT (id) DO NOTHING;

INSERT INTO teacher_profiles (id, "userId", bio, expertise, "updatedAt")
VALUES (
    'ivy-mock-teacher', 'ivy-mock-user-teacher',
    'IELTS instructor for the four-skills practice programme.',
    ARRAY['READING', 'LISTENING', 'WRITING', 'SPEAKING']::"IeltsSkill"[], now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_profiles (id, "userId", "targetBandScore", "currentBandScore", "updatedAt")
VALUES
    ('ivy-mock-student', 'ivy-mock-user-student', 7, 6.5, now()),
    ('ivy-mock-student2', 'ivy-mock-user-student2', 7.5, 6, now()),
    ('ivy-mock-empty', 'ivy-mock-user-empty', 6.5, NULL, now())
ON CONFLICT (id) DO NOTHING;

-- Courses, lessons and progress
INSERT INTO courses (
    id, "teacherId", title, description, "thumbnailUrl", skill, level, "targetBand", "isPublished", "updatedAt"
)
SELECT
    'ivy-mock-course-' || code, 'ivy-mock-teacher', title, description,
    '/IVY_IELTS_Logo.svg', skill::"IeltsSkill", level::"CourseLevel", target_band, published, now()
FROM (VALUES
    ('reading', 'Academic Reading Strategies', 'Find evidence, recognise paraphrase and manage reading time.', 'READING', 'INTERMEDIATE', 7.0, true),
    ('listening', 'Listening for Detail', 'Recognise dates, numbers and matching information.', 'LISTENING', 'BEGINNER', 6.5, true),
    ('writing', 'Academic Writing Workshop', 'Compare data and develop evidence-based essays.', 'WRITING', 'INTERMEDIATE', 7.0, true),
    ('speaking', 'Speaking with Confidence', 'Practise introductions, cue cards and follow-up questions.', 'SPEAKING', 'ADVANCED', 7.5, true),
    ('draft', 'Advanced Reading Clinic', 'A course draft to review before publication.', 'READING', 'ADVANCED', 8.0, false)
) AS catalog(code, title, description, skill, level, target_band, published)
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_tags (id, "courseId", tag)
SELECT 'ivy-mock-tag-' || code || '-' || tag, 'ivy-mock-course-' || code, tag
FROM (VALUES
    ('reading', 'Academic'), ('reading', 'Timed practice'), ('listening', 'Audio practice'),
    ('writing', 'Task 2'), ('speaking', 'Mock interview'), ('draft', 'Academic')
) AS tags(code, tag)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (
    id, "courseId", title, description, type, "order", "durationMins",
    content, "isPublished", "isFreePreview", "scheduledStart", "scheduledEnd", "updatedAt"
)
SELECT
    'ivy-mock-lesson-' || code, 'ivy-mock-course-' || code, title, description,
    lesson_type::"LessonType", 1, duration_mins, body, true, free_preview,
    CASE WHEN lesson_type = 'LIVE_SESSION' THEN today + 8 + TIME '18:00' END,
    CASE WHEN lesson_type = 'LIVE_SESSION' THEN today + 8 + TIME '19:00' END,
    now()
FROM ivy_mock_seed_context
CROSS JOIN (VALUES
    ('reading', 'Identify a writer''s claim', 'Guided reading notes', 'DOCUMENT', 35, 'Read each paragraph and write its main claim in one sentence.', true),
    ('listening', 'Numbers and dates', 'Short answer practice', 'QUIZ', 25, 'Listen for dates and check each answer against the word limit.', true),
    ('writing', 'Compare key figures', 'An overview and comparison checklist', 'DOCUMENT', 45, 'Group related figures and describe the biggest change.', false),
    ('speaking', 'Cue card rehearsal', 'Live Part 2 practice', 'LIVE_SESSION', 60, 'Prepare a cue card and speak for two minutes.', false)
) AS lessons_data(code, title, description, lesson_type, duration_mins, body, free_preview)
ON CONFLICT (id) DO UPDATE SET
    "scheduledStart" = EXCLUDED."scheduledStart", "scheduledEnd" = EXCLUDED."scheduledEnd", "updatedAt" = now()
WHERE EXCLUDED.id = 'ivy-mock-lesson-speaking'
    AND (lessons."scheduledStart", lessons."scheduledEnd") IS DISTINCT FROM (EXCLUDED."scheduledStart", EXCLUDED."scheduledEnd");

INSERT INTO lesson_resources (id, "lessonId", name, "fileUrl", "fileType")
VALUES ('ivy-mock-lesson-resource', 'ivy-mock-lesson-reading', 'Practice cover', '/IVY_IELTS_Logo.svg', 'image/svg+xml')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lesson_progress (id, "studentId", "lessonId", "isCompleted", "watchedSecs", "completedAt", "updatedAt")
VALUES
    ('ivy-mock-progress-reading', 'ivy-mock-student', 'ivy-mock-lesson-reading', true, 0, now() - interval '10 days', now()),
    ('ivy-mock-progress-writing', 'ivy-mock-student', 'ivy-mock-lesson-writing', false, 0, NULL, now()),
    ('ivy-mock-progress-listening', 'ivy-mock-student2', 'ivy-mock-lesson-listening', true, 25, now() - interval '5 days', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO enrollments (id, "studentId", "courseId", status, "enrolledAt", "completedAt", "updatedAt")
SELECT
    'ivy-mock-enrollment-' || student || '-' || course,
    'ivy-mock-' || student, 'ivy-mock-course-' || course, status::"EnrollmentStatus",
    now() - interval '30 days', CASE WHEN status = 'DONE' THEN now() - interval '7 days' END, now()
FROM (VALUES
    ('student', 'reading', 'STUDYING'), ('student', 'listening', 'STUDYING'),
    ('student', 'writing', 'STUDYING'), ('student', 'speaking', 'DONE'),
    ('student2', 'reading', 'STUDYING'), ('student2', 'writing', 'STUDYING'),
    ('student2', 'listening', 'UPCOMING')
) AS roster(student, course, status)
ON CONFLICT (id) DO NOTHING;

-- Four skill filters in the current month, even at month end.
INSERT INTO class_sessions (
    id, "courseId", "teacherId", title, description, skill,
    "sessionType", "scheduledDate", "startTime", "endTime", "durationMins", "isPublished", "updatedAt"
)
SELECT
    'ivy-mock-session-' || code, 'ivy-mock-course-' || course, 'ivy-mock-teacher',
    title, description, skill::"IeltsSkill", session_type,
    CASE WHEN in_month THEN month_start ELSE today END + day_offset,
    start_time, end_time, extract(epoch FROM (end_time::time - start_time::time)) / 60,
    published, now()
FROM ivy_mock_seed_context
CROSS JOIN (VALUES
    ('reading-month', 'reading', 'Reading evidence lab', 'Read a short passage about a community garden.', 'READING', 'WORKSHOP', true, 4, '09:00', '10:15', true),
    ('listening-month', 'listening', 'Listening for details', 'Practise word limits and spelling.', 'LISTENING', 'LIVE', true, 11, '18:30', '19:30', true),
    ('writing-month', 'writing', 'Writing feedback clinic', 'Review examples of clear supporting evidence.', 'WRITING', 'LIVE', true, 18, '19:00', '20:30', true),
    ('speaking-month', 'speaking', 'Speaking mock interviews', 'Use follow-up questions to develop answers.', 'SPEAKING', 'LIVE', true, 25, '17:45', '18:45', true),
    ('reading-next', 'reading', 'Fast reading practice', 'Build a strategy for timed practice.', 'READING', 'LIVE', false, 2, '18:30', '19:30', true),
    ('listening-next', 'listening', 'Audio practice lab', 'Review the format and try the audio player.', 'LISTENING', 'WORKSHOP', false, 4, '13:30', '14:30', true),
    ('writing-next', 'writing', 'Chart and essay workshop', 'Outline an essay and review a model overview.', 'WRITING', 'WORKSHOP', false, 6, '19:00', '20:30', true),
    ('speaking-next', 'speaking', 'Speaking Part 2 rehearsal', 'Prepare a cue card for a practice interview.', 'SPEAKING', 'LIVE', false, 8, '18:00', '19:00', true),
    ('writing-past', 'writing', 'Paragraph review', 'Feedback and examples from a previous class.', 'WRITING', 'LIVE', false, -14, '19:00', '20:00', true),
    ('draft', 'draft', 'Unpublished reading workshop', 'A draft for checking publish controls.', 'READING', 'WORKSHOP', false, 9, '09:30', '10:30', false)
) AS sessions(code, course, title, description, skill, session_type, in_month, day_offset, start_time, end_time, published)
ON CONFLICT (id) DO UPDATE SET "scheduledDate" = EXCLUDED."scheduledDate", "updatedAt" = now()
WHERE class_sessions."scheduledDate" IS DISTINCT FROM EXCLUDED."scheduledDate";

INSERT INTO "_ClassSessionToEnrollment" ("A", "B")
SELECT session.id, enrollment.id
FROM class_sessions AS session
JOIN enrollments AS enrollment ON enrollment."courseId" = session."courseId"
WHERE session.id LIKE 'ivy-mock-session-%'
    AND enrollment.id LIKE 'ivy-mock-enrollment-%'
    AND enrollment.status IN ('STUDYING', 'DONE')
ON CONFLICT ("A", "B") DO NOTHING;

INSERT INTO attendances (id, "classSessionId", "enrollmentId", "attendedAt", status, notes, "updatedAt")
VALUES
    ('ivy-mock-attendance-attended', 'ivy-mock-session-writing-past', 'ivy-mock-enrollment-student-writing', now() - interval '14 days', 'ATTENDED', NULL, now()),
    ('ivy-mock-attendance-absent', 'ivy-mock-session-writing-past', 'ivy-mock-enrollment-student2-writing', NULL, 'ABSENT', 'Did not join the review.', now()),
    ('ivy-mock-attendance-excused', 'ivy-mock-session-reading-month', 'ivy-mock-enrollment-student2-reading', NULL, 'EXCUSED', 'Absence agreed before class.', now()),
    ('ivy-mock-attendance-scheduled', 'ivy-mock-session-reading-next', 'ivy-mock-enrollment-student-reading', NULL, 'SCHEDULED', NULL, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO session_materials (id, "sessionId", name, "fileUrl", "fileType")
SELECT 'ivy-mock-material-audio', 'ivy-mock-session-listening-next', 'Audio playback sample', audio_url, 'audio/wav'
FROM ivy_mock_seed_context
UNION ALL
SELECT 'ivy-mock-material-cover', 'ivy-mock-session-reading-next', 'Practice cover', '/IVY_IELTS_Logo.svg', 'image/svg+xml'
ON CONFLICT (id) DO NOTHING;

-- Assignment content follows the Reading/Listening builder's stored JSON contract.
WITH builder_content AS (
    SELECT
        $reading${
            "sections": [
                {
                    "id": "ivy-mock-reading-part-1", "title": "A community garden", "partNumber": 1, "timeLimit": 10,
                    "passage": {
                        "id": "ivy-mock-reading-passage-1", "title": "A community garden",
                        "content": "Riverside's community garden opened on a vacant lot in 2019. Volunteers were initially expected to grow vegetables, but the neighbourhood soon used the garden for workshops. In its second year a school started bringing students on Fridays to learn about insects."
                    },
                    "questions": [
                        {"id":"ivy-mock-reading-q1","type":"multiple_choice_single","questionNumber":1,"instructions":"Choose one answer.","questionText":"What was the original plan for the garden?","points":1,"config":{"options":["Growing vegetables","Holding workshops","Teaching about insects"],"correctAnswer":"Growing vegetables","allowMultiple":false,"showOptions":"vertical"}},
                        {"id":"ivy-mock-reading-q2","type":"true_false_not_given","questionNumber":2,"instructions":"Choose True, False or Not Given.","questionText":"The school visited on Fridays.","points":1,"config":{"statements":[{"id":"ivy-mock-reading-statement","text":"The school visited on Fridays.","correctAnswer":"true"}]}}
                    ]
                },
                {
                    "id": "ivy-mock-reading-part-2", "title": "The repair café", "partNumber": 2, "timeLimit": 10,
                    "passage": {
                        "id": "ivy-mock-reading-passage-2", "title": "The repair café",
                        "content": "A library in Harbourside hosts a repair café every Saturday. Visitors bring small appliances and learn how to identify common faults. The organisers lend tools so that visitors can try simple repairs themselves."
                    },
                    "questions": [
                        {"id":"ivy-mock-reading-q3","type":"short_answer","questionNumber":3,"instructions":"Write no more than one word.","questionText":"What do the organisers lend?","points":1,"config":{"wordLimit":1,"questions":[{"id":"ivy-mock-reading-short","text":"What do the organisers lend?","answer":"tools"}]}}
                    ]
                }
            ],
            "totalTime": 20, "totalPoints": 3
        }$reading$::jsonb AS reading,
        jsonb_set($listening${
            "sections": [
                {
                    "id": "ivy-mock-listening-part-1", "title": "Library tour", "partNumber": 1, "timeLimit": 5,
                    "passage": {
                        "id": "ivy-mock-listening-passage-1", "title": "Audio control sample and tour transcript",
                        "content": "Practice transcript: The library tour starts at ten in the morning. Please meet by the main entrance. The tour is free for registered visitors.",
                        "audioUrl": "", "audioDuration": 0.5,
                        "transcript": "The library tour starts at ten in the morning. Please meet by the main entrance. The tour is free for registered visitors."
                    },
                    "questions": [
                        {"id":"ivy-mock-listening-q1","type":"sentence_completion","questionNumber":1,"instructions":"Write one number.","questionText":"The tour starts at ___ in the morning.","points":1,"config":{"text":"The tour starts at ___ in the morning.","blanks":[{"id":"ivy-mock-listening-time","answer":"10"}],"wordLimit":1,"requireExactMatch":true}},
                        {"id":"ivy-mock-listening-q2","type":"multiple_choice_single","questionNumber":2,"instructions":"Choose one answer.","questionText":"Where should visitors meet?","points":1,"config":{"options":["Main entrance","Reception desk","Reading room"],"correctAnswer":"Main entrance","allowMultiple":false,"showOptions":"vertical"}}
                    ]
                }
            ],
            "totalTime": 5, "totalPoints": 2
        }$listening$::jsonb, '{sections,0,passage,audioUrl}', to_jsonb(audio_url)) AS listening
    FROM ivy_mock_seed_context
)
INSERT INTO assignments (
    id, "classSessionId", title, description, type, skill, "dueDate", instructions,
    "isPublished", content, "updatedAt"
)
SELECT
    'ivy-mock-assignment-' || code, 'ivy-mock-session-' || session_code,
    title, description, assignment_type::"AssignmentType", skill::"IeltsSkill",
    today + due_offset + TIME '23:59', instructions, published,
    CASE content_kind WHEN 'reading' THEN reading WHEN 'listening' THEN listening END, now()
FROM ivy_mock_seed_context
CROSS JOIN builder_content
CROSS JOIN (VALUES
    ('reading', 'reading-next', 'Academic Reading mini-test', 'Two short passages with three questions.', 'READING', 'READING', 7, 'Read both passages and answer all three questions.', true, 'reading'),
    ('reading-draft', 'reading-month', 'Academic Reading builder draft', 'A populated draft for editing and preview.', 'READING', 'READING', 14, 'Review the passage and question configurations before publishing.', false, 'reading'),
    ('mock-test', 'reading-month', 'IELTS Reading timed mock', 'A timed rehearsal using two short passages.', 'MOCK_TEST', 'READING', 18, 'Review the two passages before the time limit.', true, 'reading'),
    ('listening', 'listening-next', 'Listening practice: Library tour', 'The audio is a test tone. Use the transcript in the passage to answer.', 'LISTENING', 'LISTENING', 10, 'Play the sample tone to test the player, then follow the transcript.', true, 'listening'),
    ('writing-1', 'writing-next', 'Writing Task 1: Library visits', 'Library visits in thousands: Central 42 in 2022, 47 in 2023 and 54 in 2024. Riverside 38 in 2022, 39 in 2023 and 41 in 2024. Summarise the main trends and make comparisons.', 'WRITING_TASK1', 'WRITING', 12, 'Write at least 150 words.', true, NULL),
    ('writing-2', 'writing-past', 'Writing Task 2: Public transport', 'Should cities invest more in public transport? Discuss the advantages and disadvantages and give your opinion.', 'WRITING_TASK2', 'WRITING', -8, 'Write at least 250 words and support your argument with examples.', true, NULL),
    ('writing-review', 'writing-next', 'Writing Task 2: School gardens', 'Should schools use part of the week for practical activities, such as gardening? Discuss both views and state your own position.', 'WRITING_TASK2', 'WRITING', 8, 'Write at least 250 words and support your argument with examples.', true, NULL),
    ('speaking', 'speaking-next', 'Speaking mock: Home and travel', 'Interview practice with a cue card and short recordings.', 'SPEAKING', 'SPEAKING', 12, 'Record each response separately.', true, NULL)
) AS tasks(code, session_code, title, description, assignment_type, skill, due_offset, instructions, published, content_kind)
ON CONFLICT (id) DO UPDATE SET "dueDate" = EXCLUDED."dueDate", "updatedAt" = now()
WHERE assignments."dueDate" IS DISTINCT FROM EXCLUDED."dueDate";

INSERT INTO rubrics (id, "assignmentId", "updatedAt")
SELECT 'ivy-mock-rubric-' || code, 'ivy-mock-assignment-' || code, now()
FROM (VALUES ('reading'), ('writing-1'), ('writing-2'), ('writing-review'), ('speaking')) AS tasks(code)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubric_criteria (id, "rubricId", name, description, "maxScore")
SELECT
    'ivy-mock-criterion-' || code || '-' || criterion,
    'ivy-mock-rubric-' || code, name, description, max_score
FROM (VALUES
    ('reading', 'accuracy', 'Answer accuracy', 'Answers reflect the evidence in the passages.', 9),
    ('writing-1', 'task', 'Task Achievement', 'Covers key figures and gives a clear overview.', 9),
    ('writing-2', 'task', 'Task Response', 'Addresses both sides and states a consistent position.', 9),
    ('writing-2', 'cohesion', 'Coherence and Cohesion', 'Organises paragraphs and connects arguments clearly.', 9),
    ('writing-2', 'lexical', 'Lexical Resource', 'Uses topic vocabulary accurately and avoids repetition.', 9),
    ('writing-2', 'grammar', 'Grammatical Range and Accuracy', 'Uses a range of accurate sentence structures.', 9),
    ('writing-review', 'task', 'Task Response', 'Addresses the prompt and gives relevant examples.', 9),
    ('writing-review', 'grammar', 'Grammatical Range and Accuracy', 'Varies sentence structures and uses accurate grammar.', 9),
    ('speaking', 'fluency', 'Fluency and Coherence', 'Develops ideas in connected speech.', 9),
    ('speaking', 'pronunciation', 'Pronunciation', 'Uses clear sounds, stress and intonation.', 9)
) AS criteria(code, criterion, name, description, max_score)
ON CONFLICT (id) DO NOTHING;

-- Draft, submitted, graded and returned responses. Other assignments have no response yet.
INSERT INTO assignment_submissions (
    id, "assignmentId", "studentId", "gradedById", status, content, "audioUrl", "audioUrls",
    score, "bandScore", feedback, "submittedAt", "gradedAt", "updatedAt",
    "aiScore", "aiFeedback", "aiGradedAt", "aiCorrections", "teacherRegradeRequested", "regradeRequestedAt"
)
VALUES
    (
        'ivy-mock-submission-writing-returned', 'ivy-mock-assignment-writing-2', 'ivy-mock-student', 'ivy-mock-teacher',
        'RETURNED',
        $essay$Public transport can help cities reduce congestion, but its benefits depend on the quality of service. In my view, cities should invest in reliable routes first and expand the network as demand grows.

A frequent bus service gives people an alternative to driving for ordinary journeys. If buses arrive every ten minutes, passengers can travel to work without organising their day around a timetable. Priority lanes can also make bus journey times more predictable during busy periods. In neighbourhoods where several routes meet, passengers can reach more destinations with a single ticket.

The disadvantage is that the city must pay for vehicles, drivers and maintenance before many passengers change their habits. A poorly planned route might carry few people while still costing money to operate. Cities can limit this risk by testing a route, publishing ridership figures and making changes when demand is weak. A trial that includes weekend services can also show whether the route serves purposes besides commuting.

Overall, investment is worthwhile when it improves journeys people already need to make. A measured launch gives the city time to learn which services offer the greatest benefit.$essay$,
        NULL, NULL, 6.5, 6.5, 'Your position is clear. Develop one concrete example and write a fuller conclusion.',
        now() - interval '9 days', now() - interval '7 days', now(),
        NULL, NULL, NULL, NULL, false, NULL
    ),
    (
        'ivy-mock-submission-writing-review', 'ivy-mock-assignment-writing-review', 'ivy-mock-student', NULL,
        'SUBMITTED',
        $essay$Practical activities can help students see how school subjects connect to their lives. A garden gives teachers an example for science lessons because students can measure plant growth and discuss the effect of light and water.

On the other hand, schools has limited time. If a practical project is poorly supervised, students may spend most of the lesson waiting for equipment. Schools could start with a small garden club and use its results to plan lessons for more classes.

I believe practical activities should support existing subjects. Teachers can set one measurable learning goal for each activity and review the results with students afterwards.$essay$,
        NULL, NULL, NULL, NULL, NULL, now() - interval '1 day', NULL, now(),
        6.0, 'The introduction gives a clear position. Develop both sides with specific examples and review subject–verb agreement.',
        now() - interval '20 hours',
        '[{"original":"schools has","corrected":"schools have","explanation":"Use have with the plural subject schools.","type":"grammar"}]'::jsonb,
        true, now() - interval '18 hours'
    ),
    (
        'ivy-mock-submission-writing-pending', 'ivy-mock-assignment-writing-1', 'ivy-mock-student', NULL,
        'PENDING', 'Overall, visits rose at both libraries, with the largest increase at the Central library.',
        NULL, NULL, NULL, NULL, NULL, NULL, NULL, now(),
        NULL, NULL, NULL, NULL, false, NULL
    ),
    (
        'ivy-mock-submission-reading-graded', 'ivy-mock-assignment-reading', 'ivy-mock-student', 'ivy-mock-teacher',
        'GRADED', '{"ivy-mock-reading-q1":"Growing vegetables","ivy-mock-reading-q2":"True","ivy-mock-reading-q3":"equipment"}',
        NULL, NULL, 6.5, 6.5, 'Recheck the exact wording in the final passage.',
        now() - interval '3 days', now() - interval '2 days', now(),
        NULL, NULL, NULL, NULL, false, NULL
    ),
    (
        'ivy-mock-submission-reading-submitted', 'ivy-mock-assignment-reading', 'ivy-mock-student2', NULL,
        'SUBMITTED', '{"ivy-mock-reading-q1":"Holding workshops","ivy-mock-reading-q2":"True","ivy-mock-reading-q3":"tools"}',
        NULL, NULL, NULL, NULL, NULL, now() - interval '1 day', NULL, now(),
        NULL, NULL, NULL, NULL, false, NULL
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO assignment_submissions (
    id, "assignmentId", "studentId", status, "audioUrl", "audioUrls", "submittedAt", "updatedAt"
)
SELECT
    'ivy-mock-submission-speaking-submitted', 'ivy-mock-assignment-speaking', 'ivy-mock-student',
    'SUBMITTED', audio_url,
    jsonb_build_array(
        jsonb_build_object('questionId', 'speak-1-1', 'url', audio_url, 'duration', 0.5),
        jsonb_build_object('questionId', 'speak-1-2', 'url', audio_url, 'duration', 0.5),
        jsonb_build_object('questionId', 'speak-2-1', 'url', audio_url, 'duration', 0.5)
    ),
    now() - interval '4 hours', now()
FROM ivy_mock_seed_context
ON CONFLICT (id) DO NOTHING;

INSERT INTO "CriterionScore" (id, score, "submissionId", "criterionId", "updatedAt")
SELECT 'ivy-mock-score-' || code || '-' || criterion, score,
    'ivy-mock-submission-' || submission, 'ivy-mock-criterion-' || code || '-' || criterion, now()
FROM (VALUES
    ('writing-2', 'task', 'writing-returned', 6.5),
    ('writing-2', 'cohesion', 'writing-returned', 7.0),
    ('writing-2', 'lexical', 'writing-returned', 6.5),
    ('writing-2', 'grammar', 'writing-returned', 6.0),
    ('reading', 'accuracy', 'reading-graded', 6.5)
) AS scores(code, criterion, submission, score)
ON CONFLICT (id) DO NOTHING;

INSERT INTO submission_comments (id, "submissionId", "authorId", content, "createdAt", "updatedAt")
VALUES
    ('ivy-mock-comment-teacher', 'ivy-mock-submission-writing-returned', 'ivy-mock-user-teacher',
        'Please add one example that shows how you would evaluate a pilot route.', now() - interval '7 days', now()),
    ('ivy-mock-comment-student', 'ivy-mock-submission-writing-returned', 'ivy-mock-user-student',
        'Would comparing weekday and weekend ridership give enough detail?', now() - interval '6 days', now())
ON CONFLICT (id) DO NOTHING;

-- Progress chart and read/unread notification states
INSERT INTO band_score_history (id, "studentId", skill, band, source, "takenAt")
SELECT
    'ivy-mock-band-' || code, 'ivy-mock-student', skill::"IeltsSkill", band, source, now() - weeks_ago * interval '1 week'
FROM (VALUES
    ('reading-initial', 'READING', 5.5, 'Placement test', 5),
    ('reading-checkpoint', 'READING', 6.0, 'Practice checkpoint', 3),
    ('reading-recent', 'READING', 6.5, 'Academic Reading mini-test', 0),
    ('listening-initial', 'LISTENING', 5.5, 'Placement test', 5),
    ('listening-recent', 'LISTENING', 6.0, 'Practice checkpoint', 1),
    ('writing-initial', 'WRITING', 5.5, 'Placement test', 5),
    ('writing-recent', 'WRITING', 6.5, 'Writing Task 2', 1),
    ('speaking-initial', 'SPEAKING', 6.0, 'Placement test', 5),
    ('speaking-recent', 'SPEAKING', 6.5, 'Mock interview', 2)
) AS history(code, skill, band, source, weeks_ago)
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, "userId", title, body, "isRead", link, "createdAt")
VALUES
    ('ivy-mock-notification-grade', 'ivy-mock-user-student', 'Writing feedback is ready', 'Open your public transport essay to read the feedback.', false, '/assignments/ivy-mock-assignment-writing-2', now() - interval '7 days'),
    ('ivy-mock-notification-review', 'ivy-mock-user-teacher', 'Teacher review requested', 'Mai Tran requested a review of the school gardens essay.', false, '/teacher/assignments/ivy-mock-assignment-writing-review/grade', now() - interval '18 hours'),
    ('ivy-mock-notification-reading', 'ivy-mock-user-student', 'Reading result available', 'Your mini-test has been graded.', true, '/assignments/ivy-mock-assignment-reading', now() - interval '2 days'),
    ('ivy-mock-notification-new', 'ivy-mock-user-student2', 'New reading practice', 'A timed reading mock is available.', false, '/assignments/ivy-mock-assignment-mock-test', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

COMMIT;
