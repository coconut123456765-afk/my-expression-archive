#!/usr/bin/env python3
"""data/assets-embed.js 생성기.

assets/*/*.png 를 WebP(q92) data URL 로 묶어 data/assets-embed.js 를 만듭니다.
이 파일이 있으면 index.html 을 file:// 로 더블클릭해 열어도
PNG 저장 · PNG 복사 · 선택 ZIP 이 모두 동작합니다.

사용법:
    python3 tools/build-embed.py            # 프로젝트 루트 기준
    python3 tools/build-embed.py --root .   # 경로 지정

필요: Pillow (pip install pillow)
"""
import argparse
import base64
import glob
import io
import os

from PIL import Image

HEADER = """/* 나만의 표정 아카이브 — 내장 이미지 사본 (assets-embed.js)
   index.html 을 file:// 로 더블클릭해 열어도 PNG 저장 · PNG 복사 · 선택 ZIP 이 동작하도록
   assets/*.png 를 WebP(q92)로 인코딩해 data URL 로 담아 둔 파일입니다.
   원본 PNG 는 assets/ 폴더에 그대로 있습니다.
   이미지를 추가/교체하면 tools/build-embed.py 를 다시 실행해 이 파일을 갱신하세요. */
window.ARCHIVE_EMBED = {
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ap.add_argument("--quality", type=int, default=92)
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    files = sorted(glob.glob(os.path.join(root, "assets", "*", "*.png")))
    if not files:
        raise SystemExit("assets/*/*.png 를 찾지 못했습니다: " + root)

    parts = []
    for path in files:
        rel = os.path.relpath(path, root).replace(os.sep, "/")
        image = Image.open(path).convert("RGBA")
        buf = io.BytesIO()
        image.save(buf, "WEBP", quality=args.quality, method=4)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        parts.append('  "%s": "data:image/webp;base64,%s"' % (rel, b64))

    out = HEADER + ",\n".join(parts) + "\n};\n"
    target = os.path.join(root, "data", "assets-embed.js")
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(target, "w", encoding="utf-8") as f:
        f.write(out)
    print("%s  (%d images, %.1f MB)" % (target, len(files), len(out) / 1024 / 1024))


if __name__ == "__main__":
    main()
