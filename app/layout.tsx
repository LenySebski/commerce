import { ReactNode } from "react";
import "./globals.css";

// The root layout must be a minimal wrapper since we handle
// internationalization in the [locale] layout
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
