export default function Loading() {
  return (
    <div
      className="page-container"
      role="status"
      aria-label="Loading page"
      style={{ paddingTop: 55, paddingBottom: 50 }}
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" style={{ width: "50%" }} />
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton skeleton-panel" />
      ))}
      <span className="sr-only">Loading your workspace…</span>
    </div>
  );
}
