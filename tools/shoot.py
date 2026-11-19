#!/usr/bin/env python3
"""v2 검증 스크립트: 로컬 서버로 열어 콘솔 에러를 모으고 스크린샷을 찍습니다.

사용:
    LD_LIBRARY_PATH=... PLAYWRIGHT_BROWSERS_PATH=... python3 tools/shoot.py
"""
import functools
import http.server
import socketserver
import threading
from playwright.sync_api import sync_playwright

ROOT = "/workspace/projects/my-expression-archive"
OUT = "/workspace/downloads"
QA = "/workspace/tmp"
PORT = 8813

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

errors = []


def watch(page):
    page.on("console", lambda m: errors.append((m.type, m.text)) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(("pageerror", str(e))))


def settle(page, ms=500):
    page.wait_for_timeout(ms)


with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    watch(page)
    page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
    settle(page, 1200)

    # lazy 이미지까지 모두 로드시킨 뒤 맨 위로
    page.evaluate("""async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    }""")
    settle(page, 1200)

    page.screenshot(path=f"{OUT}/my-expression-archive-v2-desktop.png", full_page=True)

    # 얼굴 포커스(돈키호테) — 프레임 개선이 가장 잘 보이는 조합
    page.evaluate("window.__archive.selectCharacter('don', false)")
    settle(page, 700)
    page.click(".view-btn[data-view='face']")
    settle(page, 600)
    page.evaluate("document.querySelector('#inspector').scrollIntoView({block:'start'})")
    settle(page, 700)
    page.screenshot(path=f"{OUT}/my-expression-archive-v2-inspector.png")

    # QA 컷들
    page.locator(".roster").screenshot(path=f"{QA}/v2-roster.png")
    page.click(".view-btn[data-view='fit']")
    settle(page, 500)
    page.screenshot(path=f"{QA}/v2-inspector-don-fit.png")
    page.evaluate("window.__archive.selectCharacter('anis', false)")
    settle(page, 600)
    page.screenshot(path=f"{QA}/v2-inspector-anis-fit.png")
    page.click(".view-btn[data-view='face']")
    settle(page, 500)
    page.screenshot(path=f"{QA}/v2-inspector-anis-face.png")
    page.evaluate("window.__archive.selectCharacter('aru', false)")
    settle(page, 600)
    page.screenshot(path=f"{QA}/v2-inspector-aru-face.png")
    page.click(".view-btn[data-view='fit']")
    settle(page, 400)
    page.locator(".inspector").screenshot(path=f"{QA}/v2-inspector-aru-fit.png")

    # 배경 4종 확인 (네이비에서 앰비언트 글로우가 보이는지)
    page.evaluate("window.__archive.selectCharacter('anis', false)")
    settle(page, 500)
    page.click(".bg-btn[data-bg='navy']")
    settle(page, 400)
    page.screenshot(path=f"{QA}/v2-bg-navy.png")
    page.click(".bg-btn[data-bg='white']")
    settle(page, 300)
    page.click(".bg-btn[data-bg='green']")
    settle(page, 300)
    page.click(".bg-btn[data-bg='checker']")
    settle(page, 300)

    # 줌 · 팬 · 키보드
    page.click("#zoomIn")
    page.click("#zoomIn")
    settle(page, 200)
    zoom_label = page.text_content("#zoomLabel")
    page.keyboard.press("0")
    page.keyboard.press("g")
    key_view = page.get_attribute("#stage", "data-view")
    page.keyboard.press("f")
    key_view2 = page.get_attribute("#stage", "data-view")

    # 모바일
    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    watch(mobile)
    mobile.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
    settle(mobile, 1000)
    mobile.screenshot(path=f"{QA}/v2-mobile.png")
    mobile.evaluate("window.__archive.selectCharacter('anis', false)")
    settle(mobile, 700)
    mobile.evaluate("document.querySelector('#inspector').scrollIntoView({block:'start'})")
    settle(mobile, 600)
    mobile.screenshot(path=f"{QA}/v2-mobile-stage.png")

    checks = page.evaluate("""() => {
      const st = document.querySelector('#stage');
      const frames = [...document.querySelectorAll('.char-thumb')].map(f => f.dataset.fit);
      return {
        stageView: st.dataset.view,
        cards: frames,
        cardBackdrops: document.querySelectorAll('.char-thumb .media-bd').length,
        thumbBackdrops: document.querySelectorAll('.thumb .media-bd').length,
        thumbs: document.querySelectorAll('.thumb').length,
        spotlightBackdrop: !!document.querySelector('#spotlightBd').getAttribute('src'),
        hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length
      };
    }""")
    print("CHECKS", checks)
    print("ZOOM", zoom_label, "KEY_G", key_view, "KEY_F", key_view2)
    browser.close()

httpd.shutdown()
print("CONSOLE_ISSUES", len(errors))
for e in errors:
    print(e)
