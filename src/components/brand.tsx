import { Github, Globe2, Hexagon, ShieldCheck } from "lucide-react";
import Image from "next/image";

const providerAssets = new Map([
  ["notion", "/provider-icons/notion.ico"],
  ["asana", "/provider-icons/asana.ico"],
  ["dropbox", "/provider-icons/dropbox.ico"],
  ["linear", "/provider-icons/linear.ico"],
]);

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <span
      className="brand-mark"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Hexagon size={size} fill="currentColor" strokeWidth={1.5} />
      <ShieldCheck
        className="brand-mark-shield"
        size={Math.round(size * 0.53)}
        strokeWidth={1.9}
      />
    </span>
  );
}

export function ProviderIcon({
  provider,
  size = 28,
}: {
  provider: string;
  size?: number;
}) {
  const name = provider.trim().toLowerCase();
  const asset = providerAssets.get(name);
  if (asset)
    return (
      <Image
        src={asset}
        alt=""
        width={size}
        height={size}
        unoptimized
        aria-hidden="true"
      />
    );
  if (name === "github")
    return <Github size={size} strokeWidth={1.7} aria-hidden="true" />;
  if (name === "google")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.01v2.5h3.22c1.89-1.74 2.99-4.3 2.99-7.34Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.22-2.5c-.9.6-2.04.97-3.39.97-2.6 0-4.81-1.76-5.6-4.12H3.09v2.57A10 10 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.4 13.92a6 6 0 0 1 0-3.84V7.51H3.09a10 10 0 0 0 0 8.98l3.31-2.57Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.96c1.47 0 2.78.51 3.82 1.51l2.87-2.87A9.58 9.58 0 0 0 12 2a10 10 0 0 0-8.91 5.51l3.31 2.57A5.98 5.98 0 0 1 12 5.96Z"
        />
      </svg>
    );
  if (name === "slack")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <g strokeWidth="3.3" strokeLinecap="round">
          <path stroke="#36C5F0" d="M8.2 3v7M3 8.2h2" />
          <path stroke="#2EB67D" d="M21 8.2h-7M15.8 3v2" />
          <path stroke="#ECB22E" d="M15.8 21v-7M21 15.8h-2" />
          <path stroke="#E01E5A" d="M3 15.8h7M8.2 21v-2" />
        </g>
      </svg>
    );
  return <Globe2 size={size} strokeWidth={1.7} aria-hidden="true" />;
}
