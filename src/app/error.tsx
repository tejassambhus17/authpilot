"use client";
import Link from "next/link";
import { CircleAlert, RotateCcw } from "lucide-react";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-container error-page">
      <CircleAlert size={30} />
      <h1>We couldn’t load this workspace.</h1>
      <p>
        A temporary service or storage issue interrupted the request. Try again.
        If the problem continues, check your database environment variables and
        server logs.
      </p>
      <div className="error-actions">
        <button className="button button-primary" onClick={reset}>
          <RotateCcw size={14} />
          Try again
        </button>
        <Link className="button" href="/methodology#setup">
          Setup instructions
        </Link>
      </div>
    </div>
  );
}
