import Navigation from "./components/Navigation";

export const metadata = {
  title: "The Wild Oasis",
  description: "Developed by Nada Shoukry",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
