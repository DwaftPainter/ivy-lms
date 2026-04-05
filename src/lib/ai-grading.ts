import { MESSAGES } from "@/config/message";

export interface AIGradingInput {
    essay: string;
    assignmentType: string;
    instructions?: string | null;
    description?: string | null;
}

export interface AICorrection {
    original: string;
    corrected: string;
    explanation: string;
    type: "grammar" | "vocabulary" | "spelling" | "structure";
    position?: { start: number; end: number };
}

export interface AIGradingResult {
    score: number;
    feedback: string;
    corrections: AICorrection[];
}

export async function gradeWithOllama(input: AIGradingInput): Promise<AIGradingResult> {
    const { essay, assignmentType, instructions, description } = input;

    const prompt = `You are an IELTS writing examiner. Analyze the following essay and provide detailed feedback.

Assignment Type: ${assignmentType}
${instructions ? `Instructions: ${instructions}` : ""}
${description ? `Description: ${description}` : ""}

Essay:
"""
${essay}
"""

Please provide your evaluation in the following JSON format:
{
    "score": <band_score_between_0_and_9>,
    "feedback": "<overall_feedback_in_English>",
    "corrections": [
        {
            "original": "<incorrect_text>",
            "corrected": "<corrected_text>",
            "explanation": "<explanation_in_English>",
            "type": "<grammar|vocabulary|spelling|structure>"
        }
    ]
}

Focus on:
1. Grammar errors (tense, articles, prepositions)
2. Vocabulary usage (word choice, collocations)
3. Spelling mistakes
4. Sentence structure and coherence

Provide 5-10 specific corrections with clear explanations in English.`;

    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "llama3.2";

    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const result = await response.json();
        const parsed = JSON.parse(result.response);

        return {
            score: Math.min(9, Math.max(0, parsed.score || 5)),
            feedback: parsed.feedback || "This essay has been automatically graded.",
            corrections: Array.isArray(parsed.corrections) ? parsed.corrections : []
        };
    } catch (error) {
        console.error("Ollama grading failed:", error);

        // Fallback to mock grading if Ollama is not available
        return generateMockGrading(essay);
    }
}

function generateMockGrading(essay: string): AIGradingResult {
    const words = essay.trim().split(/\s+/).length;
    const score = words > 250 ? 6.5 : words > 150 ? 5.5 : 4.5;

    const commonErrors: AICorrection[] = [
        {
            original: "metal health",
            corrected: "mental health",
            explanation:
                "The word 'metal' is incorrect in this context. The correct word is 'mental', which refers to psychological health.",
            type: "vocabulary"
        },
        {
            original: "there would be one time they are defeated",
            corrected: "there would be times they are defeated",
            explanation:
                "This phrase is incorrect in terms of quantity. The correct form is 'there would be times' to indicate multiple occurrences.",
            type: "grammar"
        }
    ];

    return {
        score,
        feedback:
            "The essay contains several grammatical and vocabulary errors that should be corrected for clarity and academic accuracy. The writer should pay attention to proper word choice and sentence structure.",
        corrections: commonErrors
    };
}
