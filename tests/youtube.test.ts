import assert from "node:assert/strict";
import test from "node:test";
import { getYouTubeId, youTubeEmbedUrl, youTubeThumbnailUrl } from "../app/lib/youtube.ts";

test("getYouTubeId extrae el id de las formas comunes de URL", () => {
  assert.equal(getYouTubeId("https://youtu.be/26BCg5zhaLQ?si=QmIVe-B72CaLDvHm"), "26BCg5zhaLQ");
  assert.equal(getYouTubeId("https://www.youtube.com/watch?v=26BCg5zhaLQ"), "26BCg5zhaLQ");
  assert.equal(getYouTubeId("https://www.youtube.com/embed/26BCg5zhaLQ"), "26BCg5zhaLQ");
  assert.equal(getYouTubeId("https://www.youtube.com/shorts/26BCg5zhaLQ"), "26BCg5zhaLQ");
});

test("getYouTubeId rechaza URLs inválidas o de otros dominios", () => {
  assert.equal(getYouTubeId(null), null);
  assert.equal(getYouTubeId(""), null);
  assert.equal(getYouTubeId("no-es-una-url"), null);
  assert.equal(getYouTubeId("https://vimeo.com/12345"), null);
  assert.equal(getYouTubeId("https://youtu.be/"), null);
  assert.equal(getYouTubeId("https://youtu.be/id-invalido-por-largo"), null);
});

test("las URLs derivadas usan miniatura de ytimg y embed sin cookies", () => {
  assert.equal(youTubeThumbnailUrl("26BCg5zhaLQ"), "https://i.ytimg.com/vi/26BCg5zhaLQ/hqdefault.jpg");
  const embed = youTubeEmbedUrl("26BCg5zhaLQ");
  assert.ok(embed.startsWith("https://www.youtube-nocookie.com/embed/26BCg5zhaLQ"));
  assert.match(embed, /autoplay=1/);
});
