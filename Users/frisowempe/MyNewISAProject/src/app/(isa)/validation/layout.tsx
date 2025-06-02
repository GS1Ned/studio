
// src/app/(isa)/validation/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISA - Validation Tools",
  description: "Tools for validating GS1 standards and identifiers.",
};

export default function ValidationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

