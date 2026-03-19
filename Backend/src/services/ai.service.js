const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        questions: z.string().describe("The technical questions that can be asked in the interview"),
        intentions: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        questions: z.string().describe("The behavioral questions that can be asked in the interview"),
        intentions: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill in which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day, e.g. data structures, system design, mock interview etc"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day")
    })).describe("A day wise preparation plan for the candidate")
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `
You are a strict JSON generator. Return ONLY a JSON object with EXACTLY this structure, no extra fields:

{
  "matchScore": <number 0-100>,
  "technicalQuestions": [
    {
      "questions": "<question text>",
      "intentions": "<interviewer intention>",
      "answer": "<how to answer>"
    }
  ],
  "behavioralQuestions": [
    {
      "questions": "<question text>",
      "intentions": "<interviewer intention>",
      "answer": "<how to answer>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "severity": "<low|medium|high>"
    }
  ],
  "preparationPlan": [
    {
      "day": <number>,
      "focus": "<focus area>",
      "tasks": ["<task1>", "<task2>"]
    }
  ]
}

RULES:
- Return ONLY the JSON above, no explanation, no markdown, no code blocks
- Do NOT add any extra fields like candidate_name, position_applied, status etc.
- technicalQuestions must have at least 5 items
- behavioralQuestions must have at least 3 items
- skillGaps must have at least 3 items
- preparationPlan must have at least 5 days

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });


    try {
        const text = typeof response.text === "function"
            ? response.text()
            : response.text;


        const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const data = JSON.parse(cleaned);

        return interviewReportSchema.parse(data);

    } catch (err) {
        if (err.status === 429) {
            return { error: "AI quota exceeded. Please try again later." };
        }
        console.error(" Failed to parse AI response:", err);
        return { error: "Invalid structured response" };
    }
}

module.exports = generateInterviewReport;