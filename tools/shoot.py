#!/usr/bin/env python3
"""v3 검증: 콘솔 오류 · 깨진 이미지 · 가로 스크롤 확인 + 스크린샷."""
import functools, http.server, socketserver, threading, json
from playwright.sync_api import sync_playwright

ROOT = "/workspace/projects/my-expression-archive"
OUT = "/workspace/downloads"
QA = "/workspace/tmp"
PORT = 8823

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

errors = []
def watch(page):
    page.on("console", lambda m: errors.append((m.type, m.text)) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(("pageerror", str(e))))
    page.on("requestfailed", lambda r: errors.append(("requestfailed", r.url)))

def lazy_all(page):
    page.evaluate("""async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 45)); }
      window.scrollTo(0, 0);
    }""")
    page.wait_for_timeout(900)

checks = {}
with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------- 데스크톱 ----------
    page = b.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    watch(page)
    page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
    page.wait_for_timeout(900)
    lazy_all(page)
    checks["desktop"] = page.evaluate("""() => ({
      screen: document.body.dataset.screen,
      cards: document.querySelectorAll('.char-card').length,
      tabs: document.querySelectorAll('.tab').length,
      hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      broken: [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).length,
      heroVisible: !!document.querySelector('.hero-card').offsetHeight
    })""")
    page.screenshot(path=f"{OUT}/my-expression-archive-v3-desktop.png", full_page=True)

    # 스튜디오 (아나스타샤)
    page.click(".char-card")
    page.wait_for_timeout(900)
    lazy_all(page)
    checks["studio-anya"] = page.evaluate("""() => ({
      name: document.querySelector('#studioName').textContent,
      thumbs: document.querySelectorAll('.thumb').length,
      chips: document.querySelectorAll('.chip').length,
      hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      broken: [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).length,
      stageHasImg: !!document.querySelector('#stageImg').getAttribute('src')
    })""")
    page.screenshot(path=f"{QA}/v3-studio-desktop.png", full_page=False)

    # 돈키호테 : 얼굴 보기 + 필터
    page.goto(f"http://127.0.0.1:{PORT}/index.html#/don", wait_until="networkidle")
    page.wait_for_timeout(900)
    page.click("#viewSwitch [data-view='face']")
    page.wait_for_timeout(400)
    page.screenshot(path=f"{QA}/v3-studio-don-face.png")
    page.click(".chip-row:nth-child(1) .chip:nth-child(3)")
    page.wait_for_timeout(400)
    checks["don-filter"] = page.evaluate("""() => ({
      thumbs: document.querySelectorAll('.thumb').length,
      activeChip: document.querySelector('.chip.is-active + .chip.is-active') ? true : false
    })""")
    page.screenshot(path=f"{QA}/v3-studio-don-filter.png")

    # 아루 : ZIP 선택
    page.goto(f"http://127.0.0.1:{PORT}/index.html#/aru", wait_until="networkidle")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(900)
    print("ARU PAGE:", page.text_content("#studioName"))
    page.click("#selectAllBtn")
    page.wait_for_timeout(300)
    checks["aru-zip"] = page.evaluate("() => ({ sel: document.querySelectorAll('.thumb.is-selected').length, bar: !document.querySelector('#selBar').hidden })")
    page.screenshot(path=f"{QA}/v3-studio-aru-select.png")

    # ---------- 모바일 ----------
    m = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    watch(m)
    m.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
    m.wait_for_timeout(900)
    lazy_all(m)
    checks["mobile"] = m.evaluate("""() => ({
      hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      broken: [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).length,
      cols: getComputedStyle(document.querySelector('.char-grid')).gridTemplateColumns.split(' ').length,
      cardsPerRow: (() => { const c = document.querySelector('.char-card').getBoundingClientRect(); return Math.round(document.querySelector('.char-grid').getBoundingClientRect().width / c.width); })()
    })""")
    m.screenshot(path=f"{OUT}/my-expression-archive-v3-mobile.png", full_page=True)

    m.goto(f"http://127.0.0.1:{PORT}/index.html#/anya", wait_until="networkidle")
    m.wait_for_timeout(800)
    m.screenshot(path=f"{QA}/v3-mobile-studio.png")
    checks["mobile-studio"] = m.evaluate("""() => ({
      hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stageH: document.querySelector('#stage').offsetHeight,
      thumbs: document.querySelectorAll('.thumb').length,
      ctrlBottom: Math.round(document.querySelector('#controlBar').getBoundingClientRect().bottom)
    })""")
    m.screenshot(path=f"{QA}/v3-mobile-studio-full.png", full_page=True)

    b.close()

httpd.shutdown()
print(json.dumps(checks, ensure_ascii=False, indent=1))
print("CONSOLE_ISSUES", len(errors))
for e in errors[:30]:
    print(e)
