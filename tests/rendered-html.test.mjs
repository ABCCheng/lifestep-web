import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships LifeStep metadata, localized home, and main routes", async () => {
  const [layout, home, homeContent, i18n, journey, scenario] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../messages/lifestep.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/app/scenario/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /LifeStep - Practice Real-Life English/);
  assert.match(home, /HomePage/);
  assert.match(homeContent, /Practice Real-Life English/);
  assert.match(await readFile(new URL("../features/home/HomePage.tsx", import.meta.url), "utf8"), /Step into real life/);
  assert.match(i18n, /"zh-Hans"/);
  assert.match(i18n, /"zh-Hant"/);
  assert.match(i18n, /"pa"/);
  assert.match(journey, /What brings you to Canada/);
  assert.match(scenario, /Conversation/);
  assert.match(scenario, /Complete this scenario/);
});
