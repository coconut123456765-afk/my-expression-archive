#!/usr/bin/env python3
"""버튼을 눌러도 화면이 튕기지 않는지 검사한다.

- 갤러리(스튜디오)에서 이전/다음·스와이프·칩·배경·보기·줌·자동재생·썸네일·선택
- 홈에서 작품 탭·검색·캐릭터 카드
- 각 동작 뒤 문서 스크롤 위치가 그대로인지, 화면(홈/스튜디오)이 유지되는지 확인
- 콘솔 오류 0 · 깨진 이미지 0 · 가로 스크롤 0

사용: python3 tools/qa-nav.py [스크린샷 폴더]
"""
import http.server, json, os, socketserver, sys, threading

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = sys.argv[1] if len(sys.argv) > 1 else "/tmp"
# 라이브 주소로도 같은 검사를 돌릴 수 있다:  QA_URL=https://… python3 tools/qa-nav.py
LIVE = os.environ.get("QA_URL")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", 0), Handler)
PORT = httpd.server_address[1]
threading.Thread(target=httpd.serve_forever, daemon=True).start()
BASE = LIVE or f"http://127.0.0.1:{PORT}/"

STATE = """() => ({
  screen: document.body.dataset.screen,
  y: Math.round(window.scrollY),
  hash: location.hash,
  counter: (document.querySelector('#stageCounter')||{}).textContent,
  stageTop: Math.round((document.querySelector('#stage')||{getBoundingClientRect:()=>({top:0})}).getBoundingClientRect().top),
  panelTop: document.querySelector('.thumb.is-active')
      ? Math.round(document.querySelector('.thumb.is-active').getBoundingClientRect().top) : null
})"""


def run(browser, vp, label, out):
    ctx = browser.new_context(viewport=vp, is_mobile=vp["width"] < 500,
                              has_touch=vp["width"] < 500, device_scale_factor=1)
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: errors.append((m.type, m.text)) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(("pageerror", str(e))))
    page.on("requestfailed", lambda r: errors.append(("requestfailed", r.url)))
    page.goto(BASE + "index.html", wait_until="load")
    page.wait_for_timeout(700)

    bad = []

    maxy = lambda: page.evaluate("Math.round(document.scrollingElement.scrollHeight - innerHeight)")

    def step(lbl, action, settle=650, allow_screen_change=False, allow_clamp=False, allow_layout=False, ignore_scroll=False):
        before = page.evaluate(STATE)
        max_before = maxy()
        action()
        page.wait_for_timeout(settle)
        after = page.evaluate(STATE)
        max_after = maxy()
        same_screen = before["screen"] == after["screen"] or allow_screen_change
        moved = abs(after["y"] - before["y"])
        # 목록이 짧아져 문서 끝을 넘어선 경우(스크롤이 최대치로 밀린 경우)는 내용이 줄어든 결과다
        clamped = allow_clamp and after["y"] == max_after and max_after < max_before
        # 검색바처럼 요소가 열리고 닫히며 생기는 레이아웃 변화
        laid_out = allow_layout and (moved <= 60)
        ok = same_screen and (moved <= 2 or clamped or laid_out or ignore_scroll)
        if not ok:
            bad.append({"step": lbl, "before": before, "after": after})
        print(f"  {'OK  ' if ok else 'BAD '} {lbl:26s} y {before['y']:>4}→{after['y']:>4}"
              f"  screen {before['screen']}→{after['screen']}  {after['counter']}")

    click = lambda sel: page.evaluate("s => document.querySelector(s).click()", sel)

    print(f"===== {label} {vp[0] if isinstance(vp, tuple) else vp}")
    # ---- 홈 ----
    step("홈 작품 탭(림버스)", lambda: click(".tab:nth-child(3)"))
    step("홈 작품 탭(전체)", lambda: click(".tab:nth-child(1)"))
    page.evaluate("window.scrollTo(0, 300)"); page.wait_for_timeout(250)
    step("스크롤 후 작품 탭", lambda: click(".tab:nth-child(2)"), allow_clamp=True)
    step("검색 열기", lambda: click("#searchToggle"), allow_layout=True)
    page.fill("#searchInput", "수영장"); page.wait_for_timeout(400)
    step("검색 닫기", lambda: click("#searchToggle"), allow_layout=True)
    step("작품 탭 전체", lambda: click(".tab:nth-child(1)"), allow_clamp=True)
    page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(200)

    # ---- 스튜디오 진입 (스크롤된 홈에서 카드 탭) ----
    page.evaluate("window.scrollTo(0, 240)"); page.wait_for_timeout(250)
    before = page.evaluate(STATE)
    page.evaluate("document.querySelector('.char-card').click()")
    page.wait_for_timeout(900)
    after = page.evaluate(STATE)
    ok = after["screen"] == "studio" and abs(after["stageTop"] - 54) < 40
    if not ok:
        bad.append({"step": "스크롤된 홈에서 스튜디오 진입", "before": before, "after": after})
    print(f"  {'OK  ' if ok else 'BAD '} {'스튜디오 진입(스크롤 상태)':26s} y {before['y']:>4}→{after['y']:>4}  stageTop {after['stageTop']}")

    # ---- 갤러리 안에서 ----
    for i in range(6):
        step(f"다음 #{i+1}", lambda: click("#nextBtn"), 380)
    for i in range(3):
        step(f"이전 #{i+1}", lambda: click("#prevBtn"), 380)
    step("키보드 →", lambda: page.keyboard.press("ArrowRight"), 380)
    step("배경 화이트", lambda: click(".bg-dots button[data-bg='white']"))
    step("보기 얼굴", lambda: click("#viewSwitch button[data-view='face']"))
    step("보기 전체", lambda: click("#viewSwitch button[data-view='fit']"))
    step("줌 +", lambda: click("#zoomIn"))
    step("줌 ↺", lambda: click("#zoomReset"))
    step("칩 폼", lambda: click(".chip-row:nth-child(1) .chip:nth-child(2)"), allow_clamp=True)
    step("칩 폼 전체", lambda: click(".chip-row:nth-child(1) .chip:nth-child(1)"), allow_clamp=True)
    step("칩 감정", lambda: click(".chip-row:nth-child(2) .chip:nth-child(3)"), allow_clamp=True)
    step("칩 감정 전체", lambda: click(".chip-row:nth-child(2) .chip:nth-child(1)"), allow_clamp=True)

    # 썸네일 하나를 실제 터치로 (화면에 보이는 것을 고른다)
    idx = page.evaluate("""() => {
      const ts=[...document.querySelectorAll('.thumb')];
      return ts.findIndex(t => { const r=t.getBoundingClientRect();
        return r.top>120 && r.bottom<innerHeight-40; });
    }""")
    if idx >= 0:
        box = page.evaluate("""i => { const r=document.querySelectorAll('.thumb')[i].getBoundingClientRect();
            return {x:r.x+r.width/2, y:r.y+r.height/2} }""", idx)
        step(f"썸네일 #{idx+1} 탭", lambda: page.mouse.click(box["x"], box["y"]), 700)
    else:
        step("썸네일 #7 클릭", lambda: click(".thumb:nth-child(7)"))

    step("전체 선택", lambda: click("#selectAllBtn"))
    step("선택 해제", lambda: click("#selClear"))
    step("자동재생 켜기", lambda: click("#playBtn"), 2600)
    step("자동재생 유지", lambda: page.wait_for_timeout(2600), 100)
    step("자동재생 끄기", lambda: click("#playBtn"), 500)

    # 스와이프 (모바일)
    if vp["width"] < 500:
        cdp = ctx.new_cdp_session(page)

        def swipe(dx):
            box = page.evaluate("""() => { const r=document.querySelector('#stage').getBoundingClientRect();
                return {x:r.x, y:r.y, w:r.width, h:r.height} }""")
            cx, cy = box["x"] + box["w"] / 2, box["y"] + box["h"] * 0.45
            cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": cx + dx / 2, "y": cy}]})
            for i in range(1, 11):
                cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": cx + dx / 2 - dx * i / 10, "y": cy}]})
                page.wait_for_timeout(14)
            cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})

        step("스와이프 ←(다음)", lambda: swipe(-120), 700)
        step("스와이프 ←(다음)", lambda: swipe(-120), 700)
        step("스와이프 →(이전)", lambda: swipe(120), 700)

    # 아래로 스크롤한 뒤에도 버튼이 위치를 바꾸지 않는지
    page.evaluate("window.scrollTo(0, Math.min(600, document.scrollingElement.scrollHeight - innerHeight))")
    page.wait_for_timeout(300)
    step("스크롤 상태에서 다음", lambda: click("#nextBtn"), 600)
    step("스크롤 상태에서 칩", lambda: click(".chip-row:nth-child(1) .chip:nth-child(2)"), 600, allow_clamp=True)
    step("스크롤 상태에서 배경", lambda: click(".bg-dots button[data-bg='navy']"), 500)

    page.screenshot(path=os.path.join(out, f"qa-{label}.png"))
    page.evaluate("window.scrollTo(0,0)")
    page.wait_for_timeout(200)
    step("뒤로(목록)", lambda: click("#backBtn"), 700, allow_screen_change=True, ignore_scroll=True)

    broken = page.evaluate("[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&i.naturalWidth===0).length")
    hover = page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
    print(f"  broken={broken} hOverflow={hover} errors={errors}")
    if bad:
        print("  BAD:", json.dumps(bad, ensure_ascii=False, indent=1))
    ctx.close()
    return bad, errors, broken, hover


def main():
    os.makedirs(SHOTS, exist_ok=True)
    total_bad, total_err = [], []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for vp, label in [({"width": 390, "height": 844}, "mobile-390"),
                          ({"width": 360, "height": 640}, "mobile-360"),
                          ({"width": 1440, "height": 900}, "desktop")]:
            bad, err, broken, hover = run(b, vp, label, SHOTS)
            total_bad += bad
            total_err += err
            assert broken == 0, f"{label}: 깨진 이미지 {broken}"
            assert hover <= 0, f"{label}: 가로 스크롤 {hover}"
        b.close()
    print("\n결과:", "PASS" if not total_bad and not total_err else "FAIL")
    if total_err:
        print("콘솔 오류:", total_err)
    return 0 if not total_bad and not total_err else 1


if __name__ == "__main__":
    sys.exit(main())
