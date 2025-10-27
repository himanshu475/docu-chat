import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// This is a simplified list of files. In a real scenario, you might fetch this list
// or have a more robust way of gathering all project files.
const filePaths = [
  '.env',
  'README.md',
  'apphosting.yaml',
  'components.json',
  'next.config.ts',
  'package.json',
  'src/ai/dev.ts',
  'src/ai/flows/answer-questions-from-document.ts',
  'src/ai/flows/summarize-uploaded-document.ts',
  'src/ai/genkit.ts',
  'src/app/actions.ts',
  'src/app/globals.css',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/chat-message.tsx',
  'src/components/logo.tsx',
  'src/components/ui/accordion.tsx',
  'src/components/ui/alert-dialog.tsx',
  'src/components/ui/alert.tsx',
  'src/components/ui/avatar.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/carousel.tsx',
  'src/components/ui/chart.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/collapsible.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/menubar.tsx',
  'src/components/ui/popover.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/scroll-area.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/slider.tsx',
  'src/components/ui/switch.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/toaster.tsx',
  'src/components/ui/tooltip.tsx',
  'src/components/ui/visually-hidden.tsx',
  'src/hooks/use-mobile.tsx',
  'src/hooks/use-toast.ts',
  'src/lib/docx-extractor.ts',
  'src/lib/download-code.ts',
  'src/lib/placeholder-images.json',
  'src/lib/placeholder-images.ts',
  'src/lib/utils.ts',
  'tailwind.config.ts',
  'tsconfig.json',
];

async function fetchFileContent(path: string): Promise<string | null> {
  try {
    // Construct the URL relative to the public directory
    const url = `/${path}`;
    const response = await fetch(url);
    if (!response.ok) {
        // This is a fallback to try fetching from root.
        // In a typical Next.js app, files are not served from root this way,
        // but this environment might be different.
        const rootResponse = await fetch(`/${path.split('/').pop()}`);
        if (!rootResponse.ok) {
            console.error(`Failed to fetch ${path} from both src and root`);
            return `// Error: Could not load content for ${path}`;
        }
        return rootResponse.text();
    }
    return response.text();
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    return `// Error: Exception while fetching ${path}`;
  }
}

export async function downloadCode() {
  const zip = new JSZip();

  const filePromises = filePaths.map(async (path) => {
    // Correctly reference the existing project files by their actual paths
    // The web server serves them from the root.
    const response = await fetch(path);
    const content = await response.text();
    zip.file(path, content);
  });

  await Promise.all(filePromises);

  // Generate zip and trigger download
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'docuchat-source-code.zip');
  });
}
