import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const origin = process.env.NOMADS_BASE_URL || 'http://127.0.0.1:3102';
const output = process.env.NOMADS_MAP_OUTPUT || '.cache/nomads-map';
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN, headless: true });
await fs.mkdir(output, { recursive: true });
const evidence = [], errors = [];
let page;

async function inspect() {
  return page.evaluate(() => {
    const element = document.querySelector('.leaflet-container');
    // Inspect the real map without adding a test-only global to the shipped component.
    let map;
    for (let fiber = element[Object.keys(element).find(key => key.startsWith('__reactFiber'))]; fiber && !map; fiber = fiber.return) {
      for (let hook = fiber.memoizedState; hook; hook = hook.next) {
        const candidate = hook.memoizedState?.map;
        if (candidate?.getCenter) { map = candidate; break; }
      }
    }
    if (!map) throw new Error('Leaflet context not found');
    const box = element.getBoundingClientRect(), size = map.getSize(), bounds = map.getBounds();
    let renderer;
    const markers = [];
    map.eachLayer(layer => {
      if (layer.getMaplibreMap) renderer = layer.getMaplibreMap();
      if (layer.getLatLng && (layer.getElement || layer.getRadius) && !layer.getContent) {
        const latlng = layer.getLatLng(), point = map.latLngToContainerPoint(latlng);
        const markerElement = layer.getElement?.(), rect = markerElement?.getBoundingClientRect();
        if (point.x > 30 && point.x < size.x - 70 && point.y > 30 && point.y < size.y - 30) {
          markers.push({ latlng, x: box.x + point.x, y: box.y + point.y, cluster: !!markerElement?.classList.contains('nomad-place-cluster'), domError: rect ? Math.hypot(rect.x + rect.width / 2 - box.x - point.x, rect.y + rect.height / 2 - box.y - point.y) : 0 });
        }
      }
    });
    const canvas = renderer?.getCanvas(), canvasBox = canvas?.getBoundingClientRect();
    const alignment = renderer ? markers.map(marker => {
      const projected = renderer.project([marker.latlng.lng, marker.latlng.lat]);
      return Math.hypot(canvasBox.x + projected.x * canvasBox.width / canvas.clientWidth - marker.x, canvasBox.y + projected.y * canvasBox.height / canvas.clientHeight - marker.y);
    }) : [];
    return {
      zoom: map.getZoom(), minZoom: map.getMinZoom(), maxZoom: map.getMaxZoom(), center: map.getCenter(),
      bounds: { west: bounds.getWest(), east: bounds.getEast(), north: bounds.getNorth(), south: bounds.getSouth() },
      size, box: box.toJSON(), markers, maxAlignmentError: Math.max(0, ...alignment),
      renderSize: renderer ? { width: renderer.transform.width, height: renderer.transform.height } : null,
      canvasSize: canvas ? { width: canvas.clientWidth, height: canvas.clientHeight } : null,
      basemap: element.dataset.basemap, ready: element.dataset.basemapReady, moving: element.dataset.moving,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
}

async function settled() {
  await expect(page.locator('.leaflet-container')).toHaveAttribute('data-moving', 'false');
  await page.waitForTimeout(100);
}

async function record(label, { tiles = false } = {}) {
  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  await settled();
  if (tiles) await expect(page.locator('.leaflet-container')).toHaveAttribute('data-basemap-ready', 'true', { timeout: 90000 });
  const state = await inspect();
  assert.ok(!state.overflow, `${label}: horizontal overflow`);
  assert.ok(state.zoom >= state.minZoom - 0.001 && state.zoom <= state.maxZoom, `${label}: zoom limits`);
  assert.ok(state.bounds.west >= -180.5 && state.bounds.east <= 180.5 && state.bounds.south >= -85.1 && state.bounds.north <= 85.1, `${label}: escaped world bounds ${JSON.stringify(state.bounds)}`);
  assert.ok(state.maxAlignmentError < 2, `${label}: markers drifted ${state.maxAlignmentError}px from the basemap`);
  assert.ok(state.markers.every(marker => marker.domError < 2), `${label}: cluster icon moved away from its coordinates`);
  if (state.renderSize) assert.deepEqual(state.renderSize, state.canvasSize, `${label}: stale renderer dimensions`);
  evidence.push({ label, ...state, markers: state.markers.length });
  await page.screenshot({ path: `${output}/${label}.png` });
  console.log(`PASS ${label}: zoom=${state.zoom.toFixed(3)}, markers=${state.markers.length}, alignment=${state.maxAlignmentError.toFixed(2)}px`);
  return state;
}

async function pinch(context, startRadius, endRadius) {
  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  const box = await page.locator('.leaflet-container').boundingBox();
  const cdp = await context.newCDPSession(page), x = box.x + box.width / 2, y = box.y + box.height / 2;
  const points = radius => [{ x: x - radius, y, id: 1 }, { x: x + radius, y, id: 2 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(startRadius) });
  for (let step = 1; step <= 15; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(startRadius + (endRadius - startRadius) * step / 15) });
    await page.waitForTimeout(25);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach(); await settled();
}

async function drag(dx, dy) {
  const box = await page.locator('.leaflet-container').boundingBox();
  const x = box.x + box.width / 2 - dx / 2, y = box.y + box.height / 2 - dy / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 20 }); await page.mouse.up();
  await settled();
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch: true });
  await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
  await context.route(/(posthog|clarity|googletagmanager|google-analytics)\./, route => route.fulfill({ status: 204 }));
  if (process.env.NOMADS_SOURCE_FIXTURE === '1') {
    await context.route('**/data/nomads/places.json', route => route.fulfill({ path: 'content/nomads/places.json', contentType: 'application/json' }));
  }
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /Map container|Runtime Error|Invalid LatLng|WebGL/i.test(message.text())) errors.push(message.text()); });
  await page.goto(`${origin}/nomads`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 60000 });
  const overview = await record('desktop-world', { tiles: true });
  assert.ok(256 * 2 ** overview.zoom >= overview.size.x - 1, 'Zoomed-out world is narrower than the viewport');
  const zoomIn = page.getByRole('button', { name: 'Zoom in', exact: true });
  const zoomOut = page.getByRole('button', { name: 'Zoom out', exact: true });
  const reset = page.getByRole('button', { name: 'Reset map view', exact: true });
  const search = page.getByRole('searchbox', { name: 'Search cities and places', exact: true });

  await page.mouse.move(overview.box.x + overview.size.x * 0.55, overview.box.y + overview.size.y / 2);
  await page.mouse.wheel(0, -300); await page.waitForTimeout(400); await settled();
  const wheelIn = await record('desktop-wheel-in');
  assert.ok(wheelIn.zoom > overview.zoom + 0.5, 'Wheel zoom-in did nothing');
  await page.mouse.wheel(0, 300); await page.waitForTimeout(400); await settled();
  assert.ok((await inspect()).zoom < wheelIn.zoom - 0.5, 'Wheel zoom-out did nothing');

  await reset.click(); await settled();
  for (let count = 0; count < 3; count++) { await zoomIn.click(); await page.waitForTimeout(60); }
  await settled();
  assert.ok(Math.abs((await inspect()).zoom - (Math.floor(overview.zoom) + 3)) < 0.001, 'Rapid zoom-in clicks were lost');
  for (let count = 0; count < 2; count++) { await zoomOut.click(); await page.waitForTimeout(60); }
  await settled();
  assert.ok(Math.abs((await inspect()).zoom - (Math.floor(overview.zoom) + 1)) < 0.001, 'Rapid zoom-out clicks were lost');
  await record('desktop-rapid-buttons');
  await zoomIn.click(); await page.waitForTimeout(100); await reset.click(); await settled();
  assert.ok(Math.abs((await inspect()).zoom - overview.zoom) < 0.001, 'Reset lost to an interrupted flight');
  await zoomIn.click(); await page.waitForTimeout(80); await expect(zoomOut).toBeEnabled();
  await zoomOut.click(); await settled();
  assert.ok(Math.abs((await inspect()).zoom - overview.zoom) < 0.001, 'Could not reverse zoom before its animation finished');
  await expect(zoomOut).toBeDisabled();
  for (const [dx, dy] of [[600, 0], [-600, 0], [0, 280], [0, -280]]) await drag(dx, dy);
  await record('desktop-pan-bounds', { tiles: true });
  await reset.click(); await settled();

  await zoomIn.focus(); await page.keyboard.press('Enter'); await settled();
  assert.ok((await inspect()).zoom > overview.zoom, 'Keyboard zoom failed');
  await page.keyboard.press('Tab'); await expect(zoomOut).toBeFocused();
  await page.keyboard.press('Enter'); await settled();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await zoomIn.click(); await expect(page.locator('.leaflet-container')).toHaveAttribute('data-moving', 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await search.fill('Portugal'); await page.waitForTimeout(1000); await settled();
  await record('desktop-country', { tiles: true });
  await search.fill('Lisbon'); await page.waitForTimeout(1000); await settled();
  const city = await record('desktop-city', { tiles: true });
  assert.ok(city.zoom > 10, 'City filter did not focus the map');
  const cluster = city.markers.find(marker => marker.cluster);
  assert.ok(cluster, 'No city cluster to select');
  await page.mouse.click(cluster.x, cluster.y); await settled();
  assert.ok((await inspect()).zoom > city.zoom, 'Cluster selection did not zoom');
  while ((await inspect()).zoom < 16) { await zoomIn.click(); await settled(); }
  const place = (await inspect()).markers.find(marker => !marker.cluster);
  assert.ok(place, 'No selectable place at street zoom');
  await page.mouse.click(place.x, place.y);
  await expect(page.locator('.leaflet-popup')).toBeVisible(); await settled();
  await expect(page.locator('.leaflet-popup a', { hasText: 'Directions' })).toHaveAttribute('href', /google\.com\/maps\/search/);
  await record('desktop-place-detail', { tiles: true });
  await page.locator('.leaflet-popup-close-button').click();
  await expect(page.locator('.leaflet-popup')).toHaveCount(0);

  const beforeResize = await inspect();
  await page.locator('[aria-label="Places map"]').evaluate(element => { element.style.width = '650px'; element.style.height = '380px'; });
  await expect.poll(async () => (await inspect()).size.x).toBe(648);
  const resized = await record('container-resize', { tiles: true });
  assert.ok(Math.abs(resized.center.lat - beforeResize.center.lat) < 0.01 && Math.abs(resized.center.lng - beforeResize.center.lng) < 0.01, 'Container resize lost the selected area');
  await page.locator('[aria-label="Places map"]').evaluate(element => { element.style.width = ''; element.style.height = ''; });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250); await record(`resize-${width}`);
  }

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobile.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
  if (process.env.NOMADS_SOURCE_FIXTURE === '1') await mobile.route('**/data/nomads/places.json', route => route.fulfill({ path: 'content/nomads/places.json', contentType: 'application/json' }));
  const desktopPage = page;
  page = await mobile.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/nomads?city=lisbon`, { waitUntil: 'domcontentloaded' });
  await expect.poll(async () => Number(await page.locator('.leaflet-container').getAttribute('data-zoom')), { timeout: 30000 }).toBeGreaterThan(10);
  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  const mobileCity = await record('mobile-city', { tiles: true });
  await pinch(mobile, 35, 100);
  assert.ok((await inspect()).zoom > mobileCity.zoom + 1, 'Pinch zoom-in failed');
  await record('mobile-pinch-in');
  const pinchedZoom = (await inspect()).zoom;
  await pinch(mobile, 100, 35);
  assert.ok((await inspect()).zoom < pinchedZoom - 1, 'Pinch zoom-out failed');
  await record('mobile-pinch-out');
  const mobileZoomIn = page.getByRole('button', { name: 'Zoom in', exact: true });
  while ((await inspect()).zoom < 16) { await mobileZoomIn.tap(); await settled(); }
  const mobilePlace = (await inspect()).markers.find(marker => !marker.cluster);
  assert.ok(mobilePlace, 'No mobile place to select');
  await page.touchscreen.tap(mobilePlace.x, mobilePlace.y);
  await expect(page.locator('.leaflet-popup')).toBeVisible(); await settled();
  await record('mobile-place-detail', { tiles: true });
  await page.locator('.leaflet-popup-close-button').tap();
  while (await mobileZoomIn.isEnabled()) { await mobileZoomIn.tap(); await settled(); }
  assert.equal((await inspect()).zoom, 19, 'Maximum zoom was not reached');
  await pinch(mobile, 35, 100);
  assert.equal((await inspect()).zoom, 19, 'Pinch exceeded maximum zoom');
  await record('mobile-maximum');
  await page.getByRole('button', { name: 'Zoom out', exact: true }).tap(); await settled();
  await expect(mobileZoomIn).toBeEnabled();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).tap(); await settled();
  while (await page.getByRole('button', { name: 'Zoom out', exact: true }).isEnabled()) { await page.getByRole('button', { name: 'Zoom out', exact: true }).tap(); await settled(); }
  await pinch(mobile, 100, 35); await record('mobile-minimum', { tiles: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect.poll(async () => (await inspect()).minZoom).toBeGreaterThan(2);
  await record('minimum-resize-desktop', { tiles: true });
  await expect(page.getByRole('button', { name: 'Zoom out', exact: true })).toBeDisabled();
  await mobile.close();
  page = desktopPage;

  await page.route('**/positron-gl-style/style.json', route => route.abort());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.leaflet-container')).toHaveAttribute('data-basemap', 'openstreetmap', { timeout: 30000 });
  await record('fallback-city', { tiles: true });
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click(); await settled();
  await record('fallback-zoom');
  assert.deepEqual(errors, [], 'Map runtime errors');
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ origin, sourceCatalogFixture: process.env.NOMADS_SOURCE_FIXTURE === '1', evidence, errors }, null, 2));
  console.log(`PASS: ${evidence.length} map checks; desktop, mobile, resize, keyboard, reduced motion and fallback.`);
} catch (error) {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: `${output}/failure.png` });
    await fs.writeFile(`${output}/failure.json`, JSON.stringify({ error: String(error), evidence, errors, state: await inspect().catch(() => null) }, null, 2));
  }
  throw error;
} finally { await browser.close(); }
