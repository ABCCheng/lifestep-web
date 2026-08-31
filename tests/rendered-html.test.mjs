import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships LifeStep metadata, localized home, and main routes", async () => {
  const [layout, home, homeContent, i18n, journey, scenario] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../features/home/HomePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/app/[locale]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/app/[locale]/scenario/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /LifeStep - Practice Real-Life English/);
  assert.match(home, /HomePage/);
  assert.match(homeContent, /Step into real life/);
  assert.match(i18n, /"zh-Hans"/);
  assert.match(i18n, /"zh-Hant"/);
  assert.match(i18n, /"pa"/);
  assert.match(journey, /Life stages map|mapLabel/);
  assert.match(scenario, /conversation/);
  assert.match(scenario, /complete/);
});
