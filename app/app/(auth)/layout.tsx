import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s - Aether Mail",
    default: "Aether Mail",
  },
  description:
    "Aether Mail - A lightweight, open-source email client built for privacy, speed, and seamless integration within the Aether Office ecosystem.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">{children}</div>
    </div>
  );
}
