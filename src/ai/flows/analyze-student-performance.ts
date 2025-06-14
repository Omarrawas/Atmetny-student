'use server';

/**
 * @fileOverview Analyzes student test performance and provides personalized feedback.
 *
 * - analyzeStudentPerformance - A function that analyzes the student's performance and provides feedback.
 * - AnalyzeStudentPerformanceInput - The input type for the analyzeStudentPerformance function.
 * - AnalyzeStudentPerformanceOutput - The return type for the analyzeStudentPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStudentPerformanceInputSchema = z.object({
  testResults: z
    .string()
    .describe('The test results data, including questions, student answers, and correct answers, preferably in JSON format.'),
  studentGoals: z.string().describe('The student goals for the test.'),
});
export type AnalyzeStudentPerformanceInput = z.infer<
  typeof AnalyzeStudentPerformanceInputSchema
>;

const AnalyzeStudentPerformanceOutputSchema = z.object({
  overallFeedback: z.string().describe('Overall feedback on the student performance.'),
  areasToImprove: z
    .string()
    .describe('Specific areas where the student needs to improve, with actionable suggestions.'),
  strengths: z.string().describe('Areas where the student performed well.'),
  studyPlanSuggestions: z
    .string()
    .describe('Suggested study plan based on the analysis, including specific topics to review.'),
});
export type AnalyzeStudentPerformanceOutput = z.infer<
  typeof AnalyzeStudentPerformanceOutputSchema
>;

export async function analyzeStudentPerformance(
  input: AnalyzeStudentPerformanceInput
): Promise<AnalyzeStudentPerformanceOutput> {
  return analyzeStudentPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentPerformancePrompt',
  input: {schema: AnalyzeStudentPerformanceInputSchema},
  output: {schema: AnalyzeStudentPerformanceOutputSchema},
  prompt: `You are an AI performance analysis tool designed to help students improve their test scores.

Analyze the student's test results, identify areas for improvement, highlight strengths, and suggest a study plan.
The student's goals for this test are: {{{studentGoals}}}

Test Results:
{{{testResults}}}

Provide personalized feedback to the student based on their test performance, highlighting areas where they need to improve, so they can focus their studies effectively and achieve better results.

Output should be formatted as follows:
Overall Feedback: [overall feedback]
Areas to Improve: [specific areas where the student needs to improve, with actionable suggestions]
Strengths: [areas where the student performed well]
Study Plan Suggestions: [suggested study plan based on the analysis, including specific topics to review]`,
});

const analyzeStudentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeStudentPerformanceFlow',
    inputSchema: AnalyzeStudentPerformanceInputSchema,
    outputSchema: AnalyzeStudentPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
