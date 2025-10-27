# DocuChat: AI-Powered Document Q&A  

**Live Demo:** [https://bit.ly/docuChat](https://bit.ly/docuChat)

---

## 🧠 Overview  
DocuChat is an AI-powered web app that lets users upload documents (`.pdf`, `.docx`, `.txt`, `.md`) and ask questions based on their content.  
Built with **Next.js**, **TypeScript**, and **Google’s Gemini model**, it provides accurate, context-based answers in a chat interface.

---

## ⚙️ Tech Stack  
- **Framework:** Next.js 14  
- **Language:** TypeScript  
- **AI Framework:** Genkit (Google GenAI plugin)  
- **Model:** Gemini 2.5 Flash  
- **UI:** Tailwind CSS, shadcn/ui, lucide-react  
- **Parsing:** pdf.js, JSZip  
- **Storage:** localStorage  

---

## 🔄 How It Works  
1. User uploads a document.  
2. Text is extracted on the **client-side**.  
3. User asks a question.  
4. The AI receives the full document as context and returns an accurate answer.  

---

## 🌟 Key Features  

✅ Multi-format file parsing (.pdf, .docx, .txt)  
✅ Genkit AI Flow Integration (type-safe with Zod)  
✅ Direct Context Q&A for document-grounded answers  
✅ Persistent multi-chat history (localStorage)  
✅ Modern, responsive UI built with shadcn/ui   

---

## 🚀 Run Locally  
```bash
git clone [Your-GitHub-Repo-URL]
cd [your-project-folder]
npm install

Create .env.local:

GEMINI_API_KEY=Your-Key-Here


Start the app:

npm run dev
