import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import type { LookupOptions } from "node:dns";
import { seedGuides } from "@/lib/seed-guides";
import type { GuideContent } from "@/lib/schema";

const network = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: network.lookup }));
vi.mock("node:https", () => ({ request: network.request }));
import {
  documentUrl,
  providerDomain,
  publicIpv4,
  readableDocument,
  retrieveEvidenceDocuments,
} from "@/lib/server/source-documents";

type PinnedOptions = {
  signal: AbortSignal;
  agent: false;
  family: number;
  lookup: (
    host: string,
    options: LookupOptions,
    callback: (
      error: Error | null,
      address: string | { address: string; family: number }[],
      family?: number,
    ) => void,
  ) => void;
  headers: Record<string, string>;
};

class ResponseFixture extends EventEmitter {
  statusCode = 200;
  headers: Record<string, string> = {
    "content-type": "text/html; charset=utf-8",
  };
  complete = false;
  destroyed = false;
  destroy() {
    this.destroyed = true;
    this.emit("close");
    return this;
  }
  send(
    body = "<p>Official documentation describes OAuth registration and the developer's application settings. Read the configuration requirements carefully.</p>",
  ) {
    if (this.destroyed) return;
    this.emit("data", Buffer.from(body));
    if (this.destroyed) return;
    this.complete = true;
    this.emit("end");
    this.emit("close");
  }
}

const responses: ResponseFixture[] = [];
let respond: (response: ResponseFixture, url: URL) => void;
let prepare: (response: ResponseFixture, url: URL) => void;

function content(count = 1): GuideContent {
  const guide = structuredClone(seedGuides[0]);
  guide.website = "https://docs.example.com";
  guide.sources = Array.from({ length: count }, (_, index) => ({
    ...guide.sources[0],
    id: `s${index}`,
    url: `https://docs.example.com/page${index}`,
  }));
  return guide;
}

beforeEach(() => {
  responses.length = 0;
  network.lookup
    .mockReset()
    .mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  respond = (response) => response.send();
  prepare = () => {};
  network.request
    .mockReset()
    .mockImplementation(
      (
        url: URL,
        options: PinnedOptions,
        listener: (response: ResponseFixture) => void,
      ) => {
        const request = new EventEmitter() as EventEmitter & { end(): void };
        const response = new ResponseFixture();
        responses.push(response);
        const aborted = () => {
          response.destroy();
          request.emit("error", options.signal.reason);
        };
        response.once("close", () =>
          options.signal.removeEventListener("abort", aborted),
        );
        options.signal.addEventListener("abort", aborted, { once: true });
        request.end = () =>
          queueMicrotask(() => {
            prepare(response, url);
            listener(response);
            respond(response, url);
          });
        return request;
      },
    );
});
afterEach(() => vi.restoreAllMocks());

describe("bounded documentation retrieval", () => {
  it.each([
    "0.1.2.3",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.0.0.1",
    "192.0.2.1",
    "192.88.99.2",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "1.2.3.",
    "1.2.3.999",
    "::1",
  ])("denies private/reserved or malformed address %s", (address) => {
    expect(publicIpv4(address)).toBe(false);
  });

  it("does not reject unrelated public ranges because their first octets resemble TEST-NET", () => {
    for (const address of [
      "8.8.8.8",
      "93.184.216.34",
      "192.2.1.2",
      "198.51.1.2",
      "203.0.1.2",
    ])
      expect(publicIpv4(address)).toBe(true);
  });

  it.each([
    "http://docs.example.com",
    "https://docs.example.com:8443",
    "https://user:private@docs.example.com",
    "https://127.1",
    "https://0x7f000001",
    "https://[::1]",
    "https://local.internal",
  ])("rejects unsupported URL before connecting: %s", (url) => {
    expect(() => documentUrl(url)).toThrow();
  });

  it("recognizes explicit documentation siblings without trusting lookalike domains", () => {
    expect(
      providerDomain("https://slack.com", "https://docs.slack.dev/a"),
    ).toBe(true);
    expect(
      providerDomain("https://notion.so", "https://developers.notion.com/a"),
    ).toBe(true);
    expect(
      providerDomain(
        "https://www.dropbox.com",
        "https://docs.dropboxapi.com/a",
      ),
    ).toBe(true);
    expect(
      providerDomain(
        "https://www.dropbox.com",
        "https://docs.dropboxapi.com.attacker.test/a",
      ),
    ).toBe(false);
    expect(
      providerDomain(
        "https://example.com",
        "https://example.com.attacker.test/a",
      ),
    ).toBe(false);
    expect(
      providerDomain("https://example.com", "https://notexample.com/a"),
    ).toBe(false);
  });

  it("rejects a host with even one private DNS answer before any HTTPS request", async () => {
    network.lookup.mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ]);
    const documents = await retrieveEvidenceDocuments(
      content(),
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("unavailable");
    expect(network.request).not.toHaveBeenCalled();
  });

  it("pins the validated address for both lookup callback forms and preserves the TLS hostname", async () => {
    const documents = await retrieveEvidenceDocuments(
      content(),
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("retrieved");
    expect(documents[0].contentHash).toMatch(/^[a-f0-9]{64}$/);
    const [url, options] = network.request.mock.calls[0] as [
      URL,
      PinnedOptions,
    ];
    expect(url.hostname).toBe("docs.example.com");
    expect(options.family).toBe(4);
    expect(options.agent).toBe(false);
    const callback = vi.fn();
    options.lookup("docs.example.com", {}, callback);
    expect(callback).toHaveBeenLastCalledWith(null, "93.184.216.34", 4);
    options.lookup("docs.example.com", { all: true }, callback);
    expect(callback).toHaveBeenLastCalledWith(null, [
      { address: "93.184.216.34", family: 4 },
    ]);
    expect(network.lookup).toHaveBeenCalledTimes(1);
  });

  it("closes a redirect body and rejects a private redirect address after fresh validation", async () => {
    network.lookup
      .mockResolvedValueOnce([{ address: "93.184.216.34", family: 4 }])
      .mockResolvedValueOnce([{ address: "169.254.169.254", family: 4 }]);
    prepare = (response) => {
      response.statusCode = 302;
      response.headers.location = "/redirect";
    };
    const documents = await retrieveEvidenceDocuments(
      content(),
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("unavailable");
    expect(responses[0].destroyed).toBe(true);
    expect(network.request).toHaveBeenCalledTimes(1);
    expect(network.lookup).toHaveBeenCalledTimes(2);
  });

  it("does not connect after a DNS lookup resolves late following cancellation", async () => {
    let finish: (
      value: { address: string; family: number }[],
    ) => void = () => {};
    network.lookup.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const controller = new AbortController();
    const result = retrieveEvidenceDocuments(content(), controller.signal);
    controller.abort(new DOMException("Cancelled", "AbortError"));
    await expect(result).rejects.toThrow("Cancelled");
    finish([{ address: "93.184.216.34", family: 4 }]);
    await Promise.resolve();
    await Promise.resolve();
    expect(network.request).not.toHaveBeenCalled();
  });

  it("rejects an oversized streamed body and closes it immediately", async () => {
    respond = (response) => response.send("x".repeat(2_000_001));
    const documents = await retrieveEvidenceDocuments(
      content(),
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("unavailable");
    expect(documents[0].detail).toMatch(/size limit/);
    expect(responses[0].destroyed).toBe(true);
  });

  it("rejects a truncated response rather than using its partial passage", async () => {
    respond = (response) => {
      response.emit("data", Buffer.from("Some documentation ".repeat(20)));
      response.emit("close");
    };
    const documents = await retrieveEvidenceDocuments(
      content(),
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("unavailable");
    expect(documents[0].detail).toMatch(/complete response/);
  });

  it.each([
    { status: 403, type: "text/html", encoding: "", length: "" },
    { status: 200, type: "application/pdf", encoding: "", length: "" },
    { status: 200, type: "text/html-invalid", encoding: "", length: "" },
    { status: 200, type: "text/html", encoding: "gzip", length: "" },
    { status: 200, type: "text/html", encoding: "", length: "2000001" },
  ])(
    "closes rejected status/content without draining its body: %o",
    async ({ status, type, encoding, length }) => {
      prepare = (response) => {
        response.statusCode = status;
        response.headers = {
          "content-type": type,
          "content-encoding": encoding,
          "content-length": length,
        };
      };
      const documents = await retrieveEvidenceDocuments(
        content(),
        new AbortController().signal,
      );
      expect(documents[0].status).toBe("unavailable");
      expect(responses[0].destroyed).toBe(true);
    },
  );

  it("bounds redirect chains and closes every superseded response", async () => {
    prepare = (response) => {
      response.statusCode = 302;
      response.headers.location = "/again";
    };
    const documents = await retrieveEvidenceDocuments(
      content(),
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("unavailable");
    expect(documents[0].detail).toMatch(/redirect limit/);
    expect(network.request).toHaveBeenCalledTimes(4);
    expect(responses.every((response) => response.destroyed)).toBe(true);
  });

  it("preserves the original canonical provider across redirects between its subdomains", async () => {
    const guide = content();
    guide.website = "https://example.com";
    prepare = (response, url) => {
      if (url.hostname === "docs.example.com") {
        response.statusCode = 301;
        response.headers.location =
          "https://www.example.com/official-documentation";
      }
    };
    const documents = await retrieveEvidenceDocuments(
      guide,
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("retrieved");
    expect(
      network.request.mock.calls.map(([url]) => (url as URL).hostname),
    ).toEqual(["docs.example.com", "www.example.com"]);
    expect(responses[0].destroyed).toBe(true);
    expect(network.lookup).toHaveBeenCalledTimes(2);
  });

  it("follows Dropbox's independently documented new documentation domain", async () => {
    const guide = content();
    guide.website = "https://www.dropbox.com";
    guide.sources[0].url = "https://developers.dropbox.com/oauth-guide";
    prepare = (response, url) => {
      if (url.hostname === "developers.dropbox.com") {
        response.statusCode = 301;
        response.headers.location =
          "https://docs.dropboxapi.com/dropbox-api/docs/oauth";
      }
    };
    const documents = await retrieveEvidenceDocuments(
      guide,
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("retrieved");
    expect(network.request).toHaveBeenCalledTimes(2);
    expect(network.lookup).toHaveBeenCalledTimes(2);
  });

  it("still stops a redirect outside the canonical provider family before DNS", async () => {
    const guide = content();
    guide.website = "https://example.com";
    prepare = (response) => {
      response.statusCode = 302;
      response.headers.location = "https://docs.attacker.test/oauth";
    };
    const documents = await retrieveEvidenceDocuments(
      guide,
      new AbortController().signal,
    );
    expect(documents[0].status).toBe("unavailable");
    expect(documents[0].detail).toMatch(/different publisher/);
    expect(network.request).toHaveBeenCalledTimes(1);
    expect(network.lookup).toHaveBeenCalledTimes(1);
  });

  it("limits concurrent response work to four documents per round", async () => {
    const pending: ResponseFixture[] = [];
    respond = (response) => {
      pending.push(response);
    };
    const result = retrieveEvidenceDocuments(
      content(8),
      new AbortController().signal,
    );
    await vi.waitFor(() => expect(network.request).toHaveBeenCalledTimes(4));
    pending.splice(0).forEach((response) => response.send());
    await vi.waitFor(() => expect(network.request).toHaveBeenCalledTimes(8));
    pending.splice(0).forEach((response) => response.send());
    expect(await result).toHaveLength(8);
  });

  it("bounds source count and declines unrelated publishers without connecting", async () => {
    const guide = content(12);
    const documents = await retrieveEvidenceDocuments(
      guide,
      new AbortController().signal,
    );
    expect(documents).toHaveLength(8);
    expect(network.request).toHaveBeenCalledTimes(8);
    network.request.mockClear();
    network.lookup.mockClear();
    guide.sources[0].url = "https://community.unrelated.test/docs";
    const unrelated = await retrieveEvidenceDocuments(
      { ...guide, sources: [guide.sources[0]] },
      new AbortController().signal,
    );
    expect(unrelated[0].authority).toBe("unverified");
    expect(network.lookup).not.toHaveBeenCalled();
    expect(network.request).not.toHaveBeenCalled();
  });

  it("extracts readable text without scripts and decodes ordinary entities", () => {
    expect(
      readableDocument(
        "<p>OAuth &amp; review &mdash; read this.</p><script>secretInstruction()</script><style>body{}</style>",
      ),
    ).toBe("OAuth & review — read this.");
  });

  it("handles repeated unterminated tags/scripts without rescanning the remaining body", () => {
    expect(readableDocument("<x ".repeat(50_000))).toBe("");
    expect(
      readableDocument("<script>".repeat(20_000) + "private script text"),
    ).toBe("");
    expect(
      readableDocument('<p title="a > b">A readable requirement.</p>'),
    ).toBe("A readable requirement.");
    expect(readableDocument("<!-- unclosed comment <p>not evidence</p>")).toBe(
      "",
    );
  });
});
