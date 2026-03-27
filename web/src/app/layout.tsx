import ProviderRedux from "@/components/provider/provider_redux";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ProviderRedux>{children}</ProviderRedux>
      </body>
    </html>
  );
}
