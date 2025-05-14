import { Lato } from "next/font/google";
import "./globals.css";

const roboto = Lato({ weight: ["400", "700"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ scrollBehavior: "smooth" }}
    >
      <body
        className={`${roboto.className} bg-gradient-to-b relative from-slate-900 to-gray-900 h-screen text-slate-200`}
      >
        <div className="flex flex-col justify-between relative min-h-screen">
          {/* Header */}

          {/* Body */}
          <div className="flex-grow max-w-screen-2xl mx-auto">{children}</div>

          {/* Footer */}
        </div>
      </body>
    </html>
  );
}
