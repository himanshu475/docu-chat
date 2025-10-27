'use server';

/**
 * @fileOverview A document summarization AI agent.
 *
 * - summarizeUploadedDocument - A function that handles the document summarization process.
 * - SummarizeUploadedDocumentInput - The input type for the summarizeUploadedDocument function.
 * - SummarizeUploadedDocumentOutput - The return type for the summarizeUploadedDocument function.
 */

import { model } from '@/ai/genkit';

export type SummarizeUploadedDocumentInput = {
  documentText: string;
  question?: string;
};

export type SummarizeUploadedDocumentOutput = {
  summary: string;
};

export async function summarizeUploadedDocument(
  input: SummarizeUploadedDocumentInput
): Promise<SummarizeUploadedDocumentOutput> {
  const prompt = `You are an expert summarizer, able to distill complex documents into concise and informative summaries.

Document text: ${input.documentText}

${input.question ? `Considering the question: ${input.question}` : ''}

Please provide a summary of the document, highlighting the key points and main arguments. The summary should be no more than 3 paragraphs.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const summary = response.text();

  return { summary };
}
