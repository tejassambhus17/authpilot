// Shared with the browser input boundary. This checks the spelling of a public
// provider URL, not DNS ownership; retrieval separately resolves and pins DNS.
export function publicProviderHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return (
    host.includes(".") &&
    !host.includes(":") &&
    !/^[\d.]+$/.test(host) &&
    !/(?:^|\.)(?:localhost|localdomain|local|internal|lan|home|arpa)$/.test(
      host,
    )
  );
}

export function isPublicProviderQuery(value: string): boolean {
  const query = value.trim();
  if (/^(?:\d+|0x[\da-f]+)$/i.test(query)) return false;
  if (/^(?:localhost|localhost\.|localhost:\d+|\[?::1\]?)$/i.test(query))
    return false;
  // Plain provider names (including spaces) do not need a guessed domain.
  const looksLikeUrl =
    /^[a-z][a-z\d+.-]*:/i.test(query) ||
    (!/\s/.test(query) && /[./?@#:\[\]]/.test(query));
  if (!looksLikeUrl) return true;
  try {
    const url = new URL(
      /^https?:\/\//i.test(query) ? query : `https://${query}`,
    );
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.port &&
      publicProviderHostname(url.hostname)
    );
  } catch {
    return false;
  }
}

// Remove known campaign identifiers only. Keep semantic query parameters and
// their ordering; a provider may use them to select the document/version.
export function canonicalSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !publicProviderHostname(url.hostname)
    )
      return null;
    url.hostname = url.hostname.replace(/\.$/, "");
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(?:utm_.+|gclid|fbclid|msclkid|mc_cid|mc_eid|_ga|_gl)$/i.test(key))
        url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}
