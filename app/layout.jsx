import './globals.css';

export const metadata = {
  title: 'Chore Service',
  description: 'Mobile-first neighborhood chore service platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
