import "server-only";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { GuideContent } from "@/lib/schema";
import type { EvidenceDocument } from "./evidence";
import { collectClaims, consequentialClaim } from "@/lib/claim-evidence";

const MAX_BYTES = 2_000_000;
const PAGE_TIMEOUT = 10_000;
const MAX_DOCUMENTS = 8;

export function publicIpv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split(".").map(Number);
  // IANA special-use ranges, plus multicast. This deliberately excludes the
  // whole protocol-assignment /24 rather than attempting service exceptions.
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 192 &&
      (b === 168 ||
        (b === 0 && (c === 0 || c === 2)) ||
        (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113)
  );
}

export function documentUrl(value: string): URL {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    !url.hostname.includes(".") ||
    /^[\d.]+$/.test(url.hostname) ||
    url.hostname.includes(":") ||
    /\.(?:local|internal|localhost|localdomain)\.?$/i.test(url.hostname)
  )
    throw new Error(
      "Only public HTTPS documentation on the default port can be retrieved.",
    );
  url.hash = "";
  return url;
}

export function providerDomain(website: string, source: string): boolean {
  try {
    const base = new URL(website).hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    const host = new URL(source).hostname.toLowerCase().replace(/\.$/, "");
    // Explicit sibling documentation domains, never a broad suffix guess.
    const families = [
      ["slack.com", "slack.dev"],
      ["notion.so", "notion.com"],
      // Verified 2026-11-03 against Dropbox's 2026-09-21 announcement:
      // https://dropbox.tech/developers/new-dropbox-api-documentation
      ["dropbox.com", "dropboxapi.com"],
    ];
    const domains = families.find((family) => family.includes(base)) || [base];
    return domains.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

export function readableDocument(html: string): string {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    rsquo: "’",
    lsquo: "‘",
    ldquo: "“",
    rdquo: "”",
  };
  const parts: string[] = [];
  const lower = html.toLowerCase();
  let cursor = 0;
  // A forward-only scan avoids quadratic regex work on repeated, unclosed
  // markup. This is a conservative text reader, not an HTML execution engine.
  while (cursor < html.length) {
    const open = html.indexOf("<", cursor);
    if (open < 0) {
      parts.push(html.slice(cursor));
      break;
    }
    parts.push(html.slice(cursor, open));
    if (html.startsWith("<!--", open)) {
      const end = html.indexOf("-->", open + 4);
      if (end < 0) break;
      cursor = end + 3;
      parts.push(" ");
      continue;
    }
    let end = open + 1;
    let quote = "";
    for (; end < html.length; end++) {
      const character = html[end];
      if (quote) {
        if (character === quote) quote = "";
      } else if (character === '"' || character === "'") quote = character;
      else if (character === ">") break;
    }
    if (end >= html.length) break;
    const tag = html.slice(open + 1, end);
    const name = /^\s*([a-z][a-z0-9:-]*)\b/i.exec(tag)?.[1]?.toLowerCase();
    cursor = end + 1;
    if (name && ["script", "style", "noscript", "svg"].includes(name)) {
      const prefix = `</${name}`;
      let close = lower.indexOf(prefix, cursor);
      while (close >= 0 && !/[\s>]/.test(lower[close + prefix.length] || ""))
        close = lower.indexOf(prefix, close + prefix.length);
      if (close < 0) break;
      const closeEnd = html.indexOf(">", close + prefix.length);
      if (closeEnd < 0) break;
      cursor = closeEnd + 1;
    }
    parts.push(" ");
  }
  return parts
    .join("")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (original, entity: string) => {
      if (entity[0] !== "#") return entities[entity.toLowerCase()] ?? original;
      const number =
        entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : Number(entity.slice(1));
      return number > 0 && number <= 0x10ffff
        ? String.fromCodePoint(number)
        : " ";
    })
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160_000);
}

async function fetchDocument(
  value: string,
  signal: AbortSignal,
  canonicalWebsite: string,
  redirects = 0,
): Promise<{ text: string; finalUrl: string }> {
  const url = documentUrl(value);
  if (!providerDomain(canonicalWebsite, url.toString()))
    throw new Error(
      "Documentation redirected to a different publisher; inspect it manually.",
    );
  signal.throwIfAborted();
  // IPv4-only, deny private/reserved ranges, and pin the checked address into
  // the TLS connection. This avoids a second DNS lookup/rebinding window.
  const addresses = await lookup(url.hostname, { family: 4, all: true });
  signal.throwIfAborted();
  if (!addresses.length || addresses.some((item) => !publicIpv4(item.address)))
    throw new Error(
      "Documentation host did not resolve exclusively to public addresses.",
    );
  const address = addresses[0].address;
  return await new Promise((resolve, reject) => {
    let settled = false;
    let redirected = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const succeed = (value: { text: string; finalUrl: string }) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const req = request(
      url,
      {
        signal,
        // A fresh direct socket ensures this request uses the pinned lookup,
        // rather than a connection inherited from an application-wide agent.
        agent: false,
        family: 4,
        lookup: (_hostname, options, callback) =>
          options.all
            ? callback(null, [{ address, family: 4 }])
            : callback(null, address, 4),
        headers: {
          "User-Agent": "AuthPilot/1.0 documentation evidence reader",
          Accept: "text/html,text/plain,text/markdown",
          "Accept-Encoding": "identity",
        },
      },
      (response) => {
        response.once("error", (error) => {
          if (!redirected) fail(error);
        });
        response.once("aborted", () => {
          if (!redirected)
            fail(
              new Error(
                "Documentation connection ended before the complete response was received.",
              ),
            );
        });
        response.once("close", () => {
          if (!redirected && !response.complete)
            fail(
              new Error(
                "Documentation connection ended before the complete response was received.",
              ),
            );
        });
        const discard = (error: Error) => {
          fail(error);
          response.destroy();
        };
        const status = response.statusCode || 0;
        if ([301, 302, 303, 307, 308].includes(status)) {
          if (redirects >= 3 || !response.headers.location) {
            discard(new Error("Documentation redirect limit reached."));
            return;
          }
          let next: URL;
          try {
            next = documentUrl(
              new URL(response.headers.location, url).toString(),
            );
          } catch {
            discard(
              new Error(
                "Documentation redirected to an unsafe or unsupported URL.",
              ),
            );
            return;
          }
          // Do not follow a redirect to an unrelated publisher or forward credentials.
          if (!providerDomain(canonicalWebsite, next.origin)) {
            discard(
              new Error(
                "Documentation redirected to a different publisher; inspect it manually.",
              ),
            );
            return;
          }
          redirected = true;
          // Never drain arbitrary redirect bodies: close the old connection first.
          response.destroy();
          fetchDocument(
            next.toString(),
            signal,
            canonicalWebsite,
            redirects + 1,
          ).then(succeed, fail);
          return;
        }
        if (status !== 200) {
          discard(new Error(`Documentation returned HTTP ${status}.`));
          return;
        }
        const type = (response.headers["content-type"] || "")
          .split(";")[0]
          .trim()
          .toLowerCase();
        if (
          ![
            "text/html",
            "text/plain",
            "text/markdown",
            "application/xhtml+xml",
          ].includes(type)
        ) {
          discard(new Error("Documentation was not readable HTML or text."));
          return;
        }
        if (
          response.headers["content-encoding"] &&
          response.headers["content-encoding"] !== "identity"
        ) {
          discard(
            new Error("Documentation used unsupported content encoding."),
          );
          return;
        }
        if (Number(response.headers["content-length"]) > MAX_BYTES) {
          discard(new Error("Documentation exceeds the evidence size limit."));
          return;
        }
        const chunks: Buffer[] = [];
        let bytes = 0;
        response.on("data", (chunk: Buffer) => {
          if (settled) return;
          bytes += chunk.length;
          if (bytes > MAX_BYTES)
            discard(
              new Error("Documentation exceeds the evidence size limit."),
            );
          else chunks.push(chunk);
        });
        response.on("end", () => {
          if (settled) return;
          if (!response.complete) {
            discard(
              new Error(
                "Documentation connection ended before the complete response was received.",
              ),
            );
            return;
          }
          const body = Buffer.concat(chunks).toString("utf8");
          const text = /html/i.test(type)
            ? readableDocument(body)
            : body.replace(/\s+/g, " ").trim().slice(0, 160_000);
          if (text.length < 80) {
            fail(
              new Error(
                "Documentation had too little readable text; it may require JavaScript or sign-in.",
              ),
            );
            return;
          }
          succeed({ text, finalUrl: url.toString() });
        });
      },
    );
    req.on("error", (error) => {
      if (!redirected) fail(error);
    });
    req.end();
  });
}

function withinSignal<T>(
  signal: AbortSignal,
  task: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const aborted = () => {
      signal.removeEventListener("abort", aborted);
      reject(signal.reason);
    };
    signal.addEventListener("abort", aborted, { once: true });
    task().then(
      (value) => {
        signal.removeEventListener("abort", aborted);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", aborted);
        reject(error);
      },
    );
  });
}

export async function retrieveEvidenceDocuments(
  content: GuideContent,
  signal: AbortSignal,
): Promise<EvidenceDocument[]> {
  const priorities = new Map<string, number>();
  for (const { claim, section } of collectClaims(content))
    for (const id of claim.sourceIds)
      priorities.set(
        id,
        (priorities.get(id) || 0) +
          (consequentialClaim(section, claim) ? 5 : 1),
      );
  const selected = [...content.sources]
    .sort((a, b) => (priorities.get(b.id) || 0) - (priorities.get(a.id) || 0))
    .slice(0, MAX_DOCUMENTS);
  const documents: EvidenceDocument[] = [];
  // Four concurrent requests, two bounded rounds at most. Page deadlines cover
  // DNS as well as I/O; late DNS answers never initiate an aborted connection.
  for (let index = 0; index < selected.length; index += 4) {
    signal.throwIfAborted();
    const batch = await Promise.all(
      selected.slice(index, index + 4).map(async (source) => {
        const fetchedAt = new Date().toISOString();
        const authority = providerDomain(content.website, source.url)
          ? ("provider-domain" as const)
          : ("unverified" as const);
        const base = {
          sourceId: source.id,
          url: source.url,
          fetchedAt,
          authority,
        };
        if (authority === "unverified")
          return {
            ...base,
            status: "unavailable" as const,
            text: "",
            detail:
              "The source does not match the researched provider domain or a recognized documentation sibling. Publisher identity needs manual review.",
          };
        const pageSignal = AbortSignal.any([
          signal,
          AbortSignal.timeout(PAGE_TIMEOUT),
        ]);
        try {
          const fetched = await withinSignal(pageSignal, () =>
            fetchDocument(source.url, pageSignal, content.website),
          );
          return {
            ...base,
            status: "retrieved" as const,
            text: fetched.text,
            contentHash: createHash("sha256")
              .update(fetched.text)
              .digest("hex"),
            detail:
              "Public documentation text retrieved over HTTPS. Domain association is a heuristic, not independent proof of publisher ownership.",
          };
        } catch (error) {
          if (signal.aborted) throw signal.reason;
          return {
            ...base,
            status: "unavailable" as const,
            text: "",
            detail:
              error instanceof Error && !/Abort|timeout/i.test(error.name)
                ? error.message
                : "Documentation retrieval timed out. Inspect the page manually.",
          };
        }
      }),
    );
    documents.push(...batch);
  }
  return documents;
}
