import { Link } from "react-router";
import { buttonStyles } from "../components/Button";
import { Container } from "../components/Container";

export default function NotFoundPage() {
  return (
    <main className="flex-1 py-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Page not found</h1>
          <p className="mt-3 text-ink-muted">We couldn't find the page you were looking for.</p>
          <Link to="/book" className={buttonStyles("primary", "lg", "mt-8")}>
            Book an appointment
          </Link>
        </div>
      </Container>
    </main>
  );
}
