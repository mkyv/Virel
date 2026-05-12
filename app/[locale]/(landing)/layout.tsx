import { ReactNode } from "react";

// Group layout for the marketing/landing section.
// Add marketing-specific chrome here (e.g. shared <Header /> / <Footer />)
// when individual landing pages don't render their own.
export default function LandingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
