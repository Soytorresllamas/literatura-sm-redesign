import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const animation = JSON.parse(await readFile(new URL("../app/components/favorite-heart-animation.json", import.meta.url), "utf8"));
const componentSource = await readFile(new URL("../app/components/favorite-heart.tsx", import.meta.url), "utf8");
const stylesheetSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

function collectAnimatedProperties(value, path = "animation", found = []) {
  if (!value || typeof value !== "object") return found;

  if (value.a === 1 && Array.isArray(value.k)) {
    found.push({ path, keyframes: value.k });
  }

  for (const [key, child] of Object.entries(value)) {
    collectAnimatedProperties(child, `${path}.${key}`, found);
  }

  return found;
}

test("favorite animation ends every animated property with a valid Lottie sentinel keyframe", () => {
  const animatedProperties = collectAnimatedProperties(animation);
  assert.ok(animatedProperties.length > 0);

  for (const { path, keyframes } of animatedProperties) {
    const terminal = keyframes.at(-1);
    assert.deepEqual(
      Object.keys(terminal).sort(),
      ["t"],
      `${path} must end with a time-only keyframe so Lottie can hold the final value`,
    );
  }
});

test("favorite animation gives every interpolated keyframe easing controls", () => {
  for (const { path, keyframes } of collectAnimatedProperties(animation)) {
    for (const [index, keyframe] of keyframes.slice(0, -1).entries()) {
      if (keyframe.h === 1) continue;
      assert.ok(keyframe.i && keyframe.o, `${path}.k.${index} must define Lottie easing controls`);
    }
  }
});

test("favorite animation settles on the exact active or inactive frame after playback", () => {
  assert.match(componentSource, /addEventListener\("complete", settleToCurrentState\)/);
  assert.match(componentSource, /goToAndStop\(activeRef\.current \? 44 : 0, true\)/);
});

test("favorite fill stays invisible through the inactive resting frames", () => {
  const fillLayer = animation.layers.find((layer) => layer.nm === "Corazón relleno");
  assert.equal(fillLayer.ks.o.k[0].h, 1);
  assert.deepEqual(fillLayer.ks.o.k[0].s, [0]);
  assert.ok(fillLayer.ks.o.k[1].t >= 2);
  assert.deepEqual(fillLayer.ks.o.k[1].s, [0]);
});

test("removing a favorite returns directly to the clean inactive frame", () => {
  assert.match(componentSource, /if \(!active\) \{\s*animation\.goToAndStop\(0, true\);\s*return;\s*\}/);
});

test("inactive favorites show the outline fallback while hiding the animated renderer", () => {
  assert.match(componentSource, /ready && active \? "is-hidden" : ""/);
  assert.match(stylesheetSource, /\.favorite-heart:not\(\.is-active\) \.favorite-heart-lottie\s*\{[^}]*opacity:\s*0/);
});
