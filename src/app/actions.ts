'use server';

import {
  answerQuestionsFromDocument,
  type AnswerQuestionsFromDocumentInput,
} from '@/ai/flows/answer-questions-from-document';

export async function getAIResponse(
  input: AnswerQuestionsFromDocumentInput
): Promise<{ answer: string }> {
  try {
    const output = await answerQuestionsFromDocument(input);
    if (!output?.answer) {
      return { answer: "I couldn't find an answer to that in the document." };
    }
    return output;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw new Error('Failed to get response from AI. Please try again later.');
  }
}
