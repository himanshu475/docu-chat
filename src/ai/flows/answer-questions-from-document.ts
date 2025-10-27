'use server';

/**
 * @fileOverview A Genkit flow that allows users to upload a document and ask questions about its content.
 *
 * - answerQuestionsFromDocument - A function that handles the question answering process.
 * - AnswerQuestionsFromDocumentInput - The input type for the answerQuestionsFromDocument function.
 * - AnswerQuestionsFromDocumentOutput - The return type for the answerQuestionsFromDocument function.
 */

import { model } from '@/ai/genkit';

export type AnswerQuestionsFromDocumentInput = {
  documentText: string;
  question: string;
};

export type AnswerQuestionsFromDocumentOutput = {
  answer: string;
};

export async function answerQuestionsFromDocument(input: AnswerQuestionsFromDocumentInput): Promise<AnswerQuestionsFromDocumentOutput> {
  const prompt = `You are a chatbot that answers questions based on the content of a document.

Document: ${input.documentText}

Question: ${input.question}

Based *only* on the document provided, what is the answer to the question?`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const answer = response.text();

  return { answer };
}
