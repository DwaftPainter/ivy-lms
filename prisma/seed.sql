-- =============================================================
-- SEED SCRIPT — xoá course/lesson/assignment cũ rồi tạo mới
-- Giữ nguyên users & profiles nếu đã tồn tại
-- =============================================================

DO $$
DECLARE
  v_teacher_user_id    TEXT;
  v_teacher_profile_id TEXT;
  v_student1_user_id   TEXT;
  v_student1_id        TEXT;
  v_student2_user_id   TEXT;
  v_student2_id        TEXT;
  v_course1_id         TEXT;
  v_course2_id         TEXT;
  v_course3_id         TEXT;
BEGIN

-- =============================================================
-- STEP 0: XOÁ DATA CŨ (course-related, cascade thủ công)
-- =============================================================

DELETE FROM "CriterionScore";
DELETE FROM submission_comments;
DELETE FROM assignment_submissions;
DELETE FROM rubric_criteria;
DELETE FROM rubrics;
DELETE FROM assignments;
DELETE FROM lesson_progress;
DELETE FROM lesson_resources;
DELETE FROM lessons;
DELETE FROM attendances;
DELETE FROM class_sessions;
DELETE FROM enrollments;
DELETE FROM course_tags;
DELETE FROM courses;

RAISE NOTICE 'STEP 0 OK — old courses/lessons/assignments deleted';

-- =============================================================
-- STEP 1: USERS (upsert)
-- =============================================================

INSERT INTO users (
  id, email, password, "firstName", "lastName",
  role, "isActive", "authProvider", status,
  "failedLoginAttempts", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text, 'thanhlongxxx135@gmail.com', NULL,
  'Thanh Long', 'Nguyen',
  'TEACHER'::"Role", true, 'LOCAL'::"AuthProvider", 'ACTIVE'::"UserStatus",
  0, now(), now()
)
ON CONFLICT (email) DO UPDATE
  SET role = 'TEACHER'::"Role", "isActive" = true, "updatedAt" = now();

SELECT id::text INTO v_teacher_user_id FROM users WHERE email = 'thanhlongxxx135@gmail.com';

INSERT INTO users (
  id, email, password, "firstName", "lastName",
  role, "isActive", "authProvider", status,
  "failedLoginAttempts", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text, 'blingbling2k5@gmail.com', NULL,
  'Bling Bling', 'Tran',
  'STUDENT'::"Role", true, 'LOCAL'::"AuthProvider", 'ACTIVE'::"UserStatus",
  0, now(), now()
)
ON CONFLICT (email) DO UPDATE
  SET role = 'STUDENT'::"Role", "isActive" = true, "updatedAt" = now();

SELECT id::text INTO v_student1_user_id FROM users WHERE email = 'blingbling2k5@gmail.com';

INSERT INTO users (
  id, email, password, "firstName", "lastName",
  role, "isActive", "authProvider", status,
  "failedLoginAttempts", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text, 'nghiemthanhc@gmail.com', NULL,
  'Thanh C', 'Nghiem',
  'STUDENT'::"Role", true, 'LOCAL'::"AuthProvider", 'ACTIVE'::"UserStatus",
  0, now(), now()
)
ON CONFLICT (email) DO UPDATE
  SET role = 'STUDENT'::"Role", "isActive" = true, "updatedAt" = now();

SELECT id::text INTO v_student2_user_id FROM users WHERE email = 'nghiemthanhc@gmail.com';

RAISE NOTICE 'STEP 1 OK — teacher: %, s1: %, s2: %',
  v_teacher_user_id, v_student1_user_id, v_student2_user_id;

-- =============================================================
-- STEP 2: PROFILES (upsert)
-- =============================================================

INSERT INTO teacher_profiles (id, "userId", bio, expertise, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text, v_teacher_user_id,
  'Giảng viên IELTS 8+ năm kinh nghiệm, chuyên sâu Writing và Speaking.',
  ARRAY['WRITING','SPEAKING']::"IeltsSkill"[],
  now(), now()
)
ON CONFLICT ("userId") DO NOTHING;

SELECT id::text INTO v_teacher_profile_id FROM teacher_profiles WHERE "userId" = v_teacher_user_id;

INSERT INTO student_profiles (id, "userId", "targetBandScore", "currentBandScore", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, v_student1_user_id, 7.0, 5.5, now(), now())
ON CONFLICT ("userId") DO NOTHING;

SELECT id::text INTO v_student1_id FROM student_profiles WHERE "userId" = v_student1_user_id;

INSERT INTO student_profiles (id, "userId", "targetBandScore", "currentBandScore", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, v_student2_user_id, 7.5, 6.0, now(), now())
ON CONFLICT ("userId") DO NOTHING;

SELECT id::text INTO v_student2_id FROM student_profiles WHERE "userId" = v_student2_user_id;

RAISE NOTICE 'STEP 2 OK — teacher_profile: %, s1_profile: %, s2_profile: %',
  v_teacher_profile_id, v_student1_id, v_student2_id;

-- =============================================================
-- STEP 3: COURSES
-- =============================================================

v_course1_id := gen_random_uuid()::text;
INSERT INTO courses (
  id, "teacherId", title, description,
  skill, level, "targetBand", "isPublished", "createdAt", "updatedAt"
) VALUES (
  v_course1_id, v_teacher_profile_id,
  'IELTS Writing Masterclass',
  'Khoá học toàn diện về Task 1 (biểu đồ) và Task 2 (luận văn) với chiến lược phản hồi chuyên sâu.',
  'WRITING'::"IeltsSkill", 'INTERMEDIATE'::"CourseLevel", 6.5, true, now(), now()
);

v_course2_id := gen_random_uuid()::text;
INSERT INTO courses (
  id, "teacherId", title, description,
  skill, level, "targetBand", "isPublished", "createdAt", "updatedAt"
) VALUES (
  v_course2_id, v_teacher_profile_id,
  'IELTS Speaking Confidence',
  'Xây dựng sự tự tin và trôi chảy cho cả 3 phần thi Speaking qua luyện tập có cấu trúc.',
  'SPEAKING'::"IeltsSkill", 'BEGINNER'::"CourseLevel", 5.5, true, now(), now()
);

v_course3_id := gen_random_uuid()::text;
INSERT INTO courses (
  id, "teacherId", title, description,
  skill, level, "targetBand", "isPublished", "createdAt", "updatedAt"
) VALUES (
  v_course3_id, v_teacher_profile_id,
  'IELTS Reading for Band 7+',
  'Chiến lược đọc nâng cao: skimming, scanning, suy luận — dành cho học viên mục tiêu band cao.',
  'READING'::"IeltsSkill", 'ADVANCED'::"CourseLevel", 7.5, true, now(), now()
);

RAISE NOTICE 'STEP 3 OK — c1: %, c2: %, c3: %', v_course1_id, v_course2_id, v_course3_id;

-- =============================================================
-- STEP 4: COURSE TAGS
-- =============================================================

INSERT INTO course_tags (id, "courseId", tag) VALUES
  (gen_random_uuid()::text, v_course1_id, 'writing'),
  (gen_random_uuid()::text, v_course1_id, 'task1'),
  (gen_random_uuid()::text, v_course1_id, 'task2'),
  (gen_random_uuid()::text, v_course1_id, 'grammar'),
  (gen_random_uuid()::text, v_course2_id, 'speaking'),
  (gen_random_uuid()::text, v_course2_id, 'fluency'),
  (gen_random_uuid()::text, v_course2_id, 'pronunciation'),
  (gen_random_uuid()::text, v_course3_id, 'reading'),
  (gen_random_uuid()::text, v_course3_id, 'advanced'),
  (gen_random_uuid()::text, v_course3_id, 'band7')
ON CONFLICT ("courseId", tag) DO NOTHING;

RAISE NOTICE 'STEP 4 OK — tags inserted';

-- =============================================================
-- STEP 5: LESSONS — Course 1 (Writing)
-- =============================================================

INSERT INTO lessons (
  id, "courseId", title, description, type, "order",
  "durationMins", content, "isPublished", "isFreePreview", "createdAt", "updatedAt"
) VALUES
  (gen_random_uuid()::text, v_course1_id,
   'Giới thiệu IELTS Writing',
   'Tổng quan cấu trúc Task 1, Task 2 và thang điểm.',
   'VIDEO'::"LessonType", 1, 15,
   'Video giới thiệu định dạng, thời gian và band descriptor cho IELTS Writing.',
   true, true, now(), now()),

  (gen_random_uuid()::text, v_course1_id,
   'Task 1: Mô tả biểu đồ & đồ thị',
   'Phân tích và mô tả dữ liệu trực quan chính xác.',
   'VIDEO'::"LessonType", 2, 25,
   'Xác định xu hướng chính, so sánh số liệu, dùng từ vựng học thuật cho bar chart, line graph và pie chart.',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course1_id,
   'Task 1 Language Bank',
   'Từ vựng và cấu trúc câu thiết yếu.',
   'DOCUMENT'::"LessonType", 3, 10,
   '# Task 1 Language Bank

## Xu hướng
- Rose sharply / declined gradually / remained stable
- Peaked at / bottomed out at / fluctuated between

## So sánh
- In contrast to / Compared with / Whereas

## Tỉ lệ
- Accounted for / Made up / Represented approximately',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course1_id,
   'Task 2: Cấu trúc bài luận',
   'Xây dựng skeleton bài luận đạt điểm cao.',
   'VIDEO'::"LessonType", 4, 30,
   'Nắm vững cấu trúc 4 đoạn: Mở bài → Thân 1 → Thân 2 → Kết luận. Bao gồm ví dụ Opinion, Discussion và Problem-Solution.',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course1_id,
   'Lỗi ngữ pháp phổ biến trong Writing',
   'Tránh các lỗi làm mất điểm band.',
   'DOCUMENT'::"LessonType", 5, 20,
   '# Lỗi ngữ pháp thường gặp

1. Subject-verb agreement
2. Lạm dụng article (a/an/the)
3. Run-on sentences
4. Passive voice sai
5. Danh từ không đếm được dùng như đếm được',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course1_id,
   'Quiz luyện tập Writing',
   'Kiểm tra kiến thức chiến lược Task 1 và Task 2.',
   'QUIZ'::"LessonType", 6, 20,
   NULL,
   true, false, now(), now());

-- =============================================================
-- STEP 6: LESSONS — Course 2 (Speaking)
-- =============================================================

INSERT INTO lessons (
  id, "courseId", title, description, type, "order",
  "durationMins", content, "isPublished", "isFreePreview", "createdAt", "updatedAt"
) VALUES
  (gen_random_uuid()::text, v_course2_id,
   'Tổng quan kỳ thi Speaking',
   'Hiểu cấu trúc 3 phần thi.',
   'VIDEO'::"LessonType", 1, 10,
   'Overview 11-14 phút: structured interview → individual long turn → two-way discussion.',
   true, true, now(), now()),

  (gen_random_uuid()::text, v_course2_id,
   'Part 1: Chủ đề quen thuộc',
   'Cách trả lời mở rộng các câu hỏi thường ngày.',
   'VIDEO'::"LessonType", 2, 20,
   'Kỹ thuật mở rộng câu trả lời theo phương pháp AREA: Answer → Reason → Example → Alternative.',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course2_id,
   'Part 2: Chiến lược Cue Card',
   'Cách nói liên tục 2 phút không lạc đề.',
   'VIDEO'::"LessonType", 3, 25,
   'Lên kế hoạch trong 1 phút. Ghi chú mind-map. Cấu trúc story arc. Filler phrases để duy trì fluency.',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course2_id,
   'Phát âm & Ngữ điệu',
   'Các đặc điểm phát âm được đánh giá trong IELTS.',
   'DOCUMENT'::"LessonType", 4, 15,
   '# Checklist Phát âm

- Word stress (PHOtograph vs phoTOGraphy)
- Sentence stress để nhấn nghĩa
- Linking sounds: nối âm giữa các từ
- Ngữ điệu lên/xuống cho câu hỏi',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course2_id,
   'Buổi Speaking Mock',
   'Luyện tập trực tiếp có phản hồi.',
   'LIVE_SESSION'::"LessonType", 5, 60,
   NULL,
   true, false, now(), now());

-- =============================================================
-- STEP 7: LESSONS — Course 3 (Reading)
-- =============================================================

INSERT INTO lessons (
  id, "courseId", title, description, type, "order",
  "durationMins", content, "isPublished", "isFreePreview", "createdAt", "updatedAt"
) VALUES
  (gen_random_uuid()::text, v_course3_id,
   'Tổng quan IELTS Reading',
   'Loại passage, loại câu hỏi và chiến lược thời gian.',
   'VIDEO'::"LessonType", 1, 12,
   'Academic reading: 3 passages, 40 câu, 60 phút. Phân tích 13 loại câu hỏi và phân bổ thời gian.',
   true, true, now(), now()),

  (gen_random_uuid()::text, v_course3_id,
   'Kỹ thuật Skimming & Scanning',
   'Đọc nhanh mà không bỏ sót đáp án.',
   'VIDEO'::"LessonType", 2, 22,
   'Skimming lấy ý chính vs scanning tìm thông tin cụ thể. Keyword spotting. Nhận biết paraphrase trong passage.',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course3_id,
   'True / False / Not Given',
   'Loại câu bị hiểu sai nhiều nhất.',
   'VIDEO'::"LessonType", 3, 18,
   'Phân biệt FALSE (bị bác bỏ) và NOT GIVEN (không đề cập). Decision tree từng bước cho mỗi statement.',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course3_id,
   'Từ vựng trong ngữ cảnh',
   'Đoán nghĩa từ mà không cần từ điển.',
   'DOCUMENT'::"LessonType", 4, 15,
   '# Chiến lược với từ lạ

1. Dùng ngữ cảnh câu xung quanh
2. Nhận biết prefix/suffix (un-, mis-, -tion, -ous)
3. Xác định sắc thái tích cực hay tiêu cực
4. Dùng logic bài để loại nghĩa không hợp lý',
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course3_id,
   'Luyện đề Reading có tính giờ',
   'Mô phỏng điều kiện thi thật.',
   'QUIZ'::"LessonType", 5, 60,
   NULL,
   true, false, now(), now()),

  (gen_random_uuid()::text, v_course3_id,
   'Reading Masterclass — Hỏi đáp trực tiếp',
   'Buổi live review lỗi thường gặp.',
   'LIVE_SESSION'::"LessonType", 6, 45,
   NULL,
   true, false, now(), now());

RAISE NOTICE 'STEP 5-7 OK — lessons inserted';

-- =============================================================
-- STEP 8: ASSIGNMENTS — Course 1 (Writing)
-- =============================================================

INSERT INTO assignments (
  id, "courseId", title, description, type, skill,
  "dueDate", "maxScore", instructions, "isPublished", "createdAt", "updatedAt"
) VALUES
  (gen_random_uuid()::text, v_course1_id,
   'Task 1: Phân tích Bar Chart',
   'Phân tích biểu đồ cột và viết bài tóm tắt 150 từ.',
   'WRITING_TASK1'::"AssignmentType", 'WRITING'::"IeltsSkill",
   now() + INTERVAL '7 days', 9.0,
   'Viết ít nhất 150 từ. Nêu xu hướng chính, so sánh và ngoại lệ đáng chú ý. Không đưa ý kiến cá nhân.',
   true, now(), now()),

  (gen_random_uuid()::text, v_course1_id,
   'Task 2: Opinion Essay — Công nghệ',
   'Viết bài Task 2 hoàn chỉnh về chủ đề công nghệ và giáo dục.',
   'WRITING_TASK2'::"AssignmentType", 'WRITING'::"IeltsSkill",
   now() + INTERVAL '14 days', 9.0,
   'Viết ít nhất 250 từ. Nêu rõ quan điểm trong mở bài. Mỗi đoạn thân bài cần ví dụ cụ thể. Kết bằng kết luận rõ ràng.',
   true, now(), now()),

  (gen_random_uuid()::text, v_course1_id,
   'Mock Test Writing',
   'Hoàn thành Task 1 và Task 2 trong 60 phút.',
   'MOCK_TEST'::"AssignmentType", 'WRITING'::"IeltsSkill",
   now() + INTERVAL '21 days', 9.0,
   '60 phút tổng cộng: 20 phút Task 1, 40 phút Task 2. Không dùng tài liệu.',
   true, now(), now());

-- =============================================================
-- STEP 9: ASSIGNMENTS — Course 2 (Speaking)
-- =============================================================

INSERT INTO assignments (
  id, "courseId", title, description, type, skill,
  "dueDate", "maxScore", instructions, "isPublished", "createdAt", "updatedAt"
) VALUES
  (gen_random_uuid()::text, v_course2_id,
   'Part 1: Tự giới thiệu (Recording)',
   'Thu âm trả lời 5 câu hỏi Part 1 về quê hương và sở thích.',
   'SPEAKING'::"AssignmentType", 'SPEAKING'::"IeltsSkill",
   now() + INTERVAL '5 days', 9.0,
   'Thu âm 2-3 phút. Trả lời mỗi câu ít nhất 3 câu. Upload file MP3 hoặc M4A.',
   true, now(), now()),

  (gen_random_uuid()::text, v_course2_id,
   'Part 2 Cue Card: Mô tả một người',
   'Thu âm phần trả lời 2 phút cho cue card về người ảnh hưởng đến bạn.',
   'SPEAKING'::"AssignmentType", 'SPEAKING'::"IeltsSkill",
   now() + INTERVAL '10 days', 9.0,
   'Dành 1 phút chuẩn bị. Nói đúng 2 phút. Bao phủ tất cả bullet point trên cue card.',
   true, now(), now());

-- =============================================================
-- STEP 10: ASSIGNMENTS — Course 3 (Reading)
-- =============================================================

INSERT INTO assignments (
  id, "courseId", title, description, type, skill,
  "dueDate", "maxScore", instructions, "isPublished", "createdAt", "updatedAt"
) VALUES
  (gen_random_uuid()::text, v_course3_id,
   'Luyện Reading Passage — Set 1',
   'Hoàn thành câu 1-14 của passage Cambridge được cung cấp.',
   'READING'::"AssignmentType", 'READING'::"IeltsSkill",
   now() + INTERVAL '7 days', 9.0,
   'Không vượt 20 phút. Viết câu trả lời rõ ràng. Kiểm tra chính tả với câu trả lời ngắn.',
   true, now(), now()),

  (gen_random_uuid()::text, v_course3_id,
   'Mock Test Reading Toàn Phần',
   'Hoàn thành 40 câu trên 3 passages trong điều kiện thi.',
   'MOCK_TEST'::"AssignmentType", 'READING'::"IeltsSkill",
   now() + INTERVAL '14 days', 9.0,
   'Đúng 60 phút. Không dùng từ điển. Điền đáp án vào answer sheet ở cuối.',
   true, now(), now());

RAISE NOTICE 'STEP 8-10 OK — assignments inserted';

-- =============================================================
-- STEP 11: ENROLLMENTS
-- =============================================================

INSERT INTO enrollments (id, "studentId", "courseId", status, "enrolledAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_student1_id, v_course1_id, 'STUDYING'::"EnrollmentStatus", now(), now()),
  (gen_random_uuid()::text, v_student1_id, v_course2_id, 'STUDYING'::"EnrollmentStatus", now(), now()),
  (gen_random_uuid()::text, v_student1_id, v_course3_id, 'STUDYING'::"EnrollmentStatus", now(), now()),
  (gen_random_uuid()::text, v_student2_id, v_course1_id, 'STUDYING'::"EnrollmentStatus", now(), now()),
  (gen_random_uuid()::text, v_student2_id, v_course2_id, 'STUDYING'::"EnrollmentStatus", now(), now()),
  (gen_random_uuid()::text, v_student2_id, v_course3_id, 'STUDYING'::"EnrollmentStatus", now(), now())
ON CONFLICT ("studentId", "courseId") DO NOTHING;

RAISE NOTICE 'STEP 11 OK — enrollments inserted';
RAISE NOTICE '=== ALL DONE: 3 courses | 17 lessons | 7 assignments | 6 enrollments ===';

-- =============================================================
-- STEP 12: CLASS SESSIONS (Lịch học tương lai)
-- =============================================================

-- Session cho Course 1: Writing Task 1 Live Review
INSERT INTO class_sessions (
  id, "courseId", "teacherId", title, description,
  skill, "sessionType", "scheduledDate", "startTime", "endTime", 
  "durationMins", "meetingUrl", "isPublished", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text, v_course1_id, v_teacher_profile_id,
  'Live Correction: Bar Chart & Line Graph',
  'Sửa bài trực tiếp và giải đáp thắc mắc về cách gom nhóm số liệu.',
  'WRITING'::"IeltsSkill", 'LIVE', 
  (CURRENT_DATE + INTERVAL '2 days'), '19:30', '21:00',
  90, 'https://zoom.us/j/ivy-lms-writing', true, now(), now()
);

-- Session cho Course 2: Speaking Mock với Teacher
INSERT INTO class_sessions (
  id, "courseId", "teacherId", title, description,
  skill, "sessionType", "scheduledDate", "startTime", "endTime", 
  "durationMins", "meetingUrl", "isPublished", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text, v_course2_id, v_teacher_profile_id,
  'Speaking Mock Test - Part 2 Focus',
  'Thực hành 1-1 các chủ đề Describe a Person/Place.',
  'SPEAKING'::"IeltsSkill", 'LIVE', 
  (CURRENT_DATE + INTERVAL '4 days'), '14:00', '15:00',
  60, 'https://meet.google.com/ivy-lms-speaking', true, now(), now()
);

-- Session cho Course 3: Reading Strategy Workshop
INSERT INTO class_sessions (
  id, "courseId", "teacherId", title, description,
  skill, "sessionType", "scheduledDate", "startTime", "endTime", 
  "durationMins", "meetingUrl", "isPublished", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text, v_course3_id, v_teacher_profile_id,
  'Reading Workshop: Taming True/False/Not Given',
  'Chiến thuật xử lý các câu hỏi gây nhiễu trong Reading.',
  'READING'::"IeltsSkill", 'WORKSHOP', 
  (CURRENT_DATE + INTERVAL '7 days'), '09:00', '10:30',
  90, 'https://teams.microsoft.com/ivy-lms-reading', true, now(), now()
);

-- =============================================================
-- STEP 13: ATTENDANCES (Gắn học sinh vào các buổi học trên)
-- =============================================================

-- Đăng ký cho Student 1 và Student 2 vào tất cả các buổi Live của khóa họ đã học
INSERT INTO attendances (id, "classSessionId", "enrollmentId", status, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  cs.id,
  e.id,
  'SCHEDULED'::"AttendanceStatus",
  now(),
  now()
FROM class_sessions cs
JOIN enrollments e ON cs."courseId" = e."courseId"
ON CONFLICT ("classSessionId", "enrollmentId") DO NOTHING;

RAISE NOTICE 'STEP 12-13 OK — 3 future sessions & attendances created';

END $$;