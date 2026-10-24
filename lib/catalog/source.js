import { load } from "cheerio";
import { PDFDocument } from "pdf-lib";
import ExcelJS from "exceljs";
import mammoth from "mammoth";
import { fetchPublic, parsePublicUrl } from "./safe-fetch.js";
const MAX_PARTS = 1200;
function textParts(text) {
  const parts = [];
  for (let i = 0; i < text.length; i += 16000)
    parts.push({
      type: "text",
      text: text.slice(Math.max(0, i - 500), i + 16000),
    });
  return parts;
}
export function discoverCatalogs(html, base) {
  const $ = load(html),
    seen = new Set(),
    links = [];
  $("a[href],iframe[src],frame[src],embed[src],object[data]").each((_, el) => {
    const value = $(el).attr("href") || $(el).attr("src") || $(el).attr("data");
    if (!value) return;
    try {
      const url = new URL(value, base).href;
      parsePublicUrl(url);
      const label =
        $(el).text().trim() ||
        $(el).attr("title") ||
        url.split("/").slice(-2).join("/");
      if (
        url !== base &&
        /\.pdf(?:\?|$)|activepoint\.com\/.+book\.html|fliphtml5|publitas|issuu|catalog.*\.(csv|xlsx|json)/i.test(
          url,
        ) &&
        !seen.has(url)
      ) {
        seen.add(url);
        links.push({ url, label: label.slice(0, 180) });
      }
    } catch {}
  });
  return links.slice(0, 60);
}
export async function prepareSource({
  bytes,
  mime = "",
  name = "catalog",
  url = null,
}) {
  const ext = name.toLowerCase().split("?")[0].split(".").pop();
  let parts = [],
    links = [],
    message = "",
    candidates = [];
  if (
    bytes.subarray(0, 5).toString() === "%PDF-" ||
    mime === "application/pdf" ||
    ext === "pdf"
  ) {
    const pdf = await PDFDocument.load(bytes);
    if (pdf.getPageCount() > 1000)
      throw new Error(
        "PDF supports up to 1,000 pages. Split this catalog first.",
      );
    for (let page = 0; page < pdf.getPageCount(); page++) {
      const slice = await PDFDocument.create();
      const [copied] = await slice.copyPages(pdf, [page]);
      slice.addPage(copied);
      parts.push({
        type: "file",
        mime: "application/pdf",
        base64: Buffer.from(await slice.save()).toString("base64"),
        page: page + 1,
      });
    }
  } else if (
    ["image/png", "image/jpeg", "image/webp"].includes(mime) ||
    ["png", "jpg", "jpeg", "webp"].includes(ext)
  ) {
    const imageMime = mime.startsWith("image/")
      ? mime
      : ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
    parts = [
      { type: "image", mime: imageMime, base64: bytes.toString("base64") },
    ];
  } else if (ext === "xlsx" || /spreadsheetml/.test(mime)) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes);
    for (const sheet of workbook.worksheets) {
      let rows = [];
      sheet.eachRow((row) => {
        rows.push(
          row.values
            .slice(1)
            .map((v) =>
              typeof v === "object"
                ? v?.text || v?.result || JSON.stringify(v)
                : v,
            ),
        );
      });
      for (let i = 1; i < rows.length; i += 35)
        parts.push({
          type: "text",
          text: JSON.stringify({
            sheet: sheet.name,
            headers: rows[0],
            rows: rows.slice(i, i + 35),
          }),
        });
    }
  } else if (ext === "docx" || /wordprocessingml/.test(mime)) {
    const { value } = await mammoth.extractRawText({ buffer: bytes });
    parts = textParts(value);
  } else if (
    /html/.test(mime) ||
    /<html|<!doctype html/i.test(bytes.subarray(0, 500).toString())
  ) {
    const html = bytes.toString("utf8");
    links = url ? discoverCatalogs(html, url) : [];
    const $ = load(html);
    $("script,style,nav,footer,header,noscript,svg").remove();
    if (url) {
      $("img[src]").each((_, el) => {
        try {
          const src = new URL($(el).attr("src"), url).href;
          parsePublicUrl(src);
          candidates.push(src);
          $(el).replaceWith(` [image: ${src}] `);
        } catch {}
      });
    }
    parts = textParts(
      $("body")
        .text()
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim(),
    );
    if (links.length) {
      message =
        "Catalog links found. Choose a specific catalog below; this index page has not been imported.";
      parts = [];
    } else if (
      !parts.length ||
      (url?.includes("activepoint.com") &&
        parts.reduce((n, p) => n + p.text.length, 0) < 500)
    ) {
      message =
        "This interactive flipbook renders its products in the browser. Use its Download PDF option and upload the PDF, or paste a direct PDF/CSV/XLSX link.";
      parts = [];
    }
  } else if (
    ["csv", "txt", "json"].includes(ext) ||
    /text\/|application\/json/.test(mime)
  ) {
    const text = bytes.toString("utf8");
    parts = textParts(text);
    candidates = Array.from(
      text.matchAll(/https?:\/\/[^\s"'<>]+/g),
      (m) => m[0],
    )
      .filter((u) => /\.(png|jpe?g|webp)(?:\?|$)/i.test(u))
      .slice(0, 2000);
  } else {
    throw new Error(
      "Supported files: PDF, CSV, XLSX, DOCX, JSON, TXT, HTML, PNG, JPG and WEBP. Export older XLS/DOC files to XLSX/PDF first.",
    );
  }
  if (parts.length > MAX_PARTS)
    throw new Error("Catalog is too large. Split it into smaller catalogs.");
  if (!parts.length && !links.length && !message)
    throw new Error("No readable catalog content was found.");
  for (const part of parts)
    if (part.type === "text") {
      for (const match of part.text.matchAll(/https?:\/\/[^\s"'<>]+/g))
        if (/\.(png|jpe?g|webp)(?:\?|$)/i.test(match[0]))
          candidates.push(match[0]);
    }
  return { parts, links, message, imageCandidates: [...new Set(candidates)] };
}
export async function readRemote(url) {
  const result = await fetchPublic(url);
  return {
    ...(await prepareSource({ ...result, name: new URL(result.url).pathname })),
    sourceUrl: result.url,
  };
}
