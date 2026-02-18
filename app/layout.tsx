import "@/components/app/triconnect/triconnect.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata = {
  title: "TriConnect — AI App Builder",
  description: "Build connected apps fast with AI. TriConnect workspace with chat, todo tracking, code editor, and device preview.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
