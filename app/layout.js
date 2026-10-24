import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "./globals.css";
import { Toaster } from "sonner";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata = {
  icons: {
    icon: [{ url: "/citrus-icon.svg?v=2", type: "image/svg+xml" }],
    shortcut: "/favicon.ico?v=2",
  },
  title: { default: "Citrus Products | Office Supplies & Amazon Services", template: "%s | Citrus Products" },
  description: "Discover office supplies, paper, stationery and practical Amazon wholesale, product research, listing and account management support from Citrus Products.",
};
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
    >
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
