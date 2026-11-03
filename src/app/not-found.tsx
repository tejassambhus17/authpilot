import Link from "next/link";
import { Compass } from "lucide-react";
export default function NotFound() {
  return (
    <div className="page-container error-page">
      <Compass size={30} />
      <h1>This path doesn’t have a guide yet.</h1>
      <p>
        The link may be incomplete, or the guide may belong to another
        deployment. Find a provider in the library or research a new one.
      </p>
      <div className="error-actions">
        <Link className="button button-primary" href="/">
          Open provider library
        </Link>
        <Link className="button" href="/research">
          Research a provider
        </Link>
      </div>
    </div>
  );
}
