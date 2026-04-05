# AI Grading Setup for IELTS Writing

## Environment Variables

Add these to your `.env` file:

```bash
# Ollama AI Configuration (for writing grading)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
```

## Ollama Installation

1. Install Ollama from https://ollama.ai

2. Pull a model:
```bash
ollama pull llama3.2
```

Or use alternative models:
- `ollama pull mistral` - Better for English writing
- `ollama pull codellama` - Good for structured outputs

3. Start Ollama server:
```bash
ollama serve
```

## Features

1. **AI Grading Button**: Students can click "Chấm bài với AI" after submitting their essay
2. **Corrections Modal**: Shows inline corrections with explanations in Vietnamese
3. **Request Teacher Regrade**: Students can request human grading after AI review

## API Endpoints

- `POST /api/student/assignments/[id]/ai-grade` - Grade essay with AI
- `GET /api/student/assignments/[id]/ai-grade` - Get AI grading results
- `POST /api/student/assignments/[id]/request-regrade` - Request teacher regrade
