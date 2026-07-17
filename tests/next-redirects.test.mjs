import assert from "node:assert/strict";
import test from "node:test";
import { PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server.js";
import configModule from "next/dist/server/config.js";

const { default: loadConfig } = configModule;
const nextConfig = await loadConfig(PHASE_PRODUCTION_BUILD, process.cwd(), { silent: true });

test("handles /lista according to the favorites UI flag", async () => {
  const { FAVORITES_UI_ENABLED } = await import("../app/lib/features.ts");

  const response = await unstable_getResponseFromNextConfig({
    url: "https://example.test/lista",
    nextConfig,
  });

  if (FAVORITES_UI_ENABLED) {
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("location"), null);
  } else {
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location")).pathname, "/seccion");
  }
});

test("does not redirect unrelated paths", async () => {
  const response = await unstable_getResponseFromNextConfig({
    url: "https://example.test/seccion",
    nextConfig,
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
});
