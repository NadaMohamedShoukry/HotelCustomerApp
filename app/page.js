import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <div>
      <h1>Hello Next!</h1>
      {/* first : it will prefetch all the routes that are linked on a
      certain page (This only works in production not in development)
      each page we visit in the browser will be cached in the browser */}
    </div>
  );
}
