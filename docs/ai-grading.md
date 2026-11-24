# AI Grading Feature

Documentation for the AI-powered IELTS writing grading system.

---

## Overview

IVY LMS integrates with Ollama (local LLM) to provide automated essay grading for IELTS Writing Task 1 and Task 2.

## Features

1. **Automated Scoring** - Band score from 0-9
2. **Detailed Feedback** - Specific improvement suggestions
3. **Inline Corrections** - Highlighted errors with explanations
4. **Vietnamese Language Support** - Feedback in Vietnamese
5. **Teacher Override** - Students can request human regrade

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐
│   Student   │────▶│  Submit Essay │────▶│  AI Grading │────▶│  Ollama │
│   Portal    │     │    (/api/*)   │     │    Service  │     │  Server │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────┘
                              │                                  │
                              │                                  │
                              ▼                                  ▼
                       ┌──────────────┐                    ┌────────────┐
                       │   Database   │◀───────────────────│   Results  │
                       │  (Prisma)    │                    │  Storage   │
                       └──────────────┘                    └────────────┘
```

---

## Setup

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai)

### 2. Pull a Model

```bash
# Recommended for IELTS grading
ollama pull llama3.2

# Alternative options
ollama pull mistral       # Better English
ollama pull codellama     # Structured outputs
```

### 3. Start Ollama Server

```bash
ollama serve
```

### 4. Configure Environment

Add to `.env`:

```env
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
```

---

## Grading Prompt

The AI uses a structured prompt to evaluate essays:

```typescript
const gradingPrompt = `
Bạn là một giám khảo IELTS chuyên nghiệp. Hãy chấm bài viết sau theo tiêu chuẩn IELTS.

Loại bài: ${assignmentType}
Đề bài: ${prompt}
Bài viết: ${essayContent}

Hãy đánh giá và trả về JSON theo định dạng:
{
  "overallBand": number (0-9),
  "taskResponse": { "score": number, "feedback": "string" },
  "coherenceCohesion": { "score": number, "feedback": "string" },
  "lexicalResource": { "score": number, "feedback": "string" },
  "grammaticalRange": { "score": number, "feedback": "string" },
  "corrections": [
    { "original": "string", "corrected": "string", "explanation": "string" }
  ],
  "overallFeedback": "string"
}

Viết phản hồi bằng tiếng Việt.
`;
```

---

## API Endpoints

### POST /api/student/assignments/[id]/ai-grade

Request AI grading for a submission.

**Response:**
```json
{
  "success": true,
  "data": {
    "overallBand": 7.5,
    "taskResponse": {
      "score": 8,
      "feedback": "Trả lời đầy đủ yêu cầu đề bài..."
    },
    "coherenceCohesion": {
      "score": 7,
      "feedback": "Bài viết có cấu trúc rõ ràng..."
    },
    "lexicalResource": {
      "score": 7,
      "feedback": "Từ vựng đa dạng..."
    },
    "grammaticalRange": {
      "score": 7,
      "feedback": "Ngữ pháp tốt..."
    },
    "corrections": [
      {
        "original": "I very like",
        "corrected": "I really like",
        "explanation": "Sử dụng 'really' thay vì 'very' với động từ 'like'"
      }
    ],
    "overallFeedback": "Bài viết tốt, cần cải thiện..."
  }
}
```

### GET /api/student/assignments/[id]/ai-grade

Retrieve existing AI grading results.

### POST /api/student/assignments/[id]/request-regrade

Request teacher regrade after AI review.

---

## Grading Criteria

### Task Response (Writing Task 2)

| Band | Description |
|------|-------------|
| 9 | Fully addresses all parts; clear position throughout |
| 7-8 | Addresses all parts; clear position; main ideas supported |
| 5-6 | Addresses the task only partially; position may be unclear |
| 3-4 | Responds to task in minimal way; no clear position |

### Coherence and Cohesion

| Band | Description |
|------|-------------|
| 9 | Skilfully manages paragraphing; cohesive features unobtrusive |
| 7-8 | Logically organizes; clear progression; uses range of cohesive devices |
| 5-6 | Organizes information; cohesive devices inadequate or overused |
| 3-4 | No clear progression; inaccurate linking |

### Lexical Resource

| Band | Description |
|------|-------------|
| 9 | Full flexibility; precise, sophisticated vocabulary |
| 7-8 | Wide vocabulary; skillfully uses uncommon words |
| 5-6 | Limited vocabulary; makes noticeable errors |
| 3-4 | Very limited vocabulary; errors impede meaning |

### Grammatical Range and Accuracy

| Band | Description |
|------|-------------|
| 9 | Wide range of structures; full flexibility; rare errors |
| 7-8 | Variety of structures; majority error-free sentences |
| 5-6 | Limited variety; frequent errors; some grammar problems |
| 3-4 | Very limited sentence forms; frequent error; meaning obscured |

---

## Frontend Components

### AIGradeButton

Button to trigger AI grading:

```tsx
<AIGradeButton 
  submissionId="uuid"
  onGradeComplete={(result) => handleResult(result)}
/>
```

### CorrectionsModal

Display inline corrections:

```tsx
<CorrectionsModal 
  corrections={corrections}
  essayContent={content}
  isOpen={isOpen}
  onClose={onClose}
/>
```

### RegradeRequestButton

Request human regrade:

```tsx
<RegradeRequestButton
  submissionId="uuid"
  disabled={!hasAIGrade}
/>
```

---

## Testing AI Grading

### Test Script

```typescript
// Test AI grading manually
async function testAIGrading() {
  const response = await fetch('/api/student/assignments/test-id/ai-grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: 'Test essay content...'
    })
  });
  
  const result = await response.json();
  console.log(result);
}
```

---

## Troubleshooting

### Ollama Connection Failed

**Problem**: Cannot connect to Ollama server

**Solutions**:
1. Verify Ollama is running: `ollama serve`
2. Check OLLAMA_URL environment variable
3. Ensure firewall allows port 11434

### Model Not Found

**Problem**: Model not available

**Solutions**:
```bash
ollama pull llama3.2
ollama list  # Verify model exists
```

### Timeout Errors

**Problem**: Grading takes too long

**Solutions**:
- Use smaller/faster model
- Reduce essay length
- Check server resources

---

## Future Enhancements

- [ ] Support for Speaking evaluation
- [ ] Reading comprehension analysis
- [ ] Listening accuracy assessment
- [ ] Progress tracking over time
- [ ] Comparative analysis with previous submissions
