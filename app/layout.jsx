import './globals.css';

export const metadata = {
  title: 'The Garden Unit',
  description: 'Professional service management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
