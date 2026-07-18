import assert from "node:assert/strict";
import test from "node:test";
import { facebookShareUrl, mailtoShareUrl, whatsAppShareUrl } from "../app/lib/share-links.ts";

test("whatsAppShareUrl combina texto y URL con encoding correcto", () => {
  const url = whatsAppShareUrl("«Xocolátl», de María García Esperón", "https://example.test/libro/xocolatl-1763");
  assert.ok(url.startsWith("https://wa.me/?text="));
  const text = decodeURIComponent(url.split("text=")[1]);
  assert.equal(text, "«Xocolátl», de María García Esperón https://example.test/libro/xocolatl-1763");
  assert.doesNotMatch(url, /[«á]/);
});

test("facebookShareUrl solo lleva la URL escapada", () => {
  const url = facebookShareUrl("https://example.test/libro/xocolatl-1763?a=1&b=2");
  assert.equal(url, `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://example.test/libro/xocolatl-1763?a=1&b=2")}`);
});

test("mailtoShareUrl escapa asunto y cuerpo con saltos de línea", () => {
  const url = mailtoShareUrl("Un libro para ti", "Mira esta historia.\n\nhttps://example.test/libro/x");
  assert.ok(url.startsWith("mailto:?subject=Un%20libro%20para%20ti&body="));
  assert.match(url, /%0A%0A/);
  assert.doesNotMatch(url.slice("mailto:?".length), /[\n ]/);
});
