import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";
import { Agent } from "undici";
export function publicAddress(address) {
  try {
    const ip = ipaddr.process(address);
    return ip.range() === "unicast";
  } catch {
    return false;
  }
}
export function parsePublicUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid public catalog URL.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  )
    throw new Error("Only public HTTP/HTTPS catalog links are supported.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    (ipaddr.isValid(host) && !publicAddress(host))
  )
    throw new Error("Private network URLs are not allowed.");
  return url;
}
// Pin the validated DNS response to the connection; revalidate every redirect.
export async function fetchPublic(value, { maxBytes = 20 * 1024 * 1024 } = {}) {
  let url = parsePublicUrl(value);
  for (let redirect = 0; redirect <= 4; redirect++) {
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const records = ipaddr.isValid(host)
      ? [
          {
            address: host,
            family: ipaddr.parse(host).kind() === "ipv6" ? 6 : 4,
          },
        ]
      : await lookup(host, { all: true });
    if (!records.length || records.some((r) => !publicAddress(r.address)))
      throw new Error(
        "Catalog address resolves to a private or reserved network.",
      );
    const record = records[0];
    const dispatcher = new Agent({
      connect: {
        lookup: (_host, options, callback) =>
          options.all
            ? callback(null, [record])
            : callback(null, record.address, record.family),
      },
    });
    try {
      const response = await fetch(url, {
        redirect: "manual",
        dispatcher,
        signal: AbortSignal.timeout(25000),
        headers: {
          "user-agent": "CitrusProductsCatalogImporter/1.0",
          accept: "application/pdf,text/html,application/json,text/csv,*/*",
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const next = response.headers.get("location");
        await response.body?.cancel();
        if (!next) throw new Error("Invalid catalog redirect.");
        url = parsePublicUrl(new URL(next, url).href);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(
          `Catalog server returned HTTP ${response.status}. Download the file and upload it instead.`,
        );
      }
      const length = Number(response.headers.get("content-length") || 0);
      if (length > maxBytes) {
        await response.body?.cancel();
        throw new Error(
          "Catalog exceeds the 20 MB link download limit. Split it into smaller files.",
        );
      }
      const chunks = [];
      let size = 0;
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > maxBytes) throw new Error("Catalog file is too large.");
          chunks.push(value);
        }
      } finally {
        await reader.cancel().catch(() => {});
      }
      return {
        bytes: Buffer.concat(chunks),
        mime: (response.headers.get("content-type") || "").split(";")[0],
        url: url.href,
      };
    } finally {
      await dispatcher.close();
    }
  }
  throw new Error("Too many catalog redirects.");
}
