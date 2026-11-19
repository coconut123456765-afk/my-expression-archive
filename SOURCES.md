# SOURCES — 에셋 출처와 다시 받는 방법 (v3)

이 아카이브의 117컷은 모두 **공개된 팬/위키 아카이브에서 실제로 내려받은 파일**입니다.
아래 명령을 그대로 쓰면 캐릭터별로 수십~수천 장까지 늘릴 수 있습니다.

> ⚠️ 모든 이미지의 권리는 원 저작권자(반다이남코, 프로젝트문, 넥슨게임즈, 시프트업 등)에게 있습니다.
> 개인 감상·정리용으로만 쓰고, 재배포·상업적 이용은 각 작품의 이용 약관을 확인하세요.

v3에서 늘어난 양

| 캐릭터 | v2 | v3 | 새로 받은 것 |
| --- | --- | --- | --- |
| 아나스타샤 | 6 | **32** | 각성 카드 16장 전부 + 미각성(2D) 16장 |
| 돈키호테 | 7 | **41** | 기본 표정 11 + 기사/혈귀/산초/과거/부상/실루엣/만우절 |
| 리쿠하치마 아루 | 6 | **35** | 기본 12 · 이야기 8 · 안경 8 · 감정 폭발 7 |
| 아니스 | 3 | **9** | 버스트 컷 3 + SD 3 |

---

## 1. 아나스타샤 — 아이돌마스터 신데렐라 걸즈 (최애)

| 항목 | 내용 |
| --- | --- |
| 출처 | **Starlight Kirara** (데레스테 카드 DB) — https://starlight.kirara.ca |
| 캐릭터 페이지 | https://starlight.kirara.ca/char/227 |
| 이미지 호스트 | `https://hidamarirhodonite.kirara.ca` |
| 받은 것 | 각성 일러스트 `spread/{카드id}.png` 16장 (1280×824), 미각성 일러스트 `chara2/227/{pose}.png` 16장 (220×464 ~ 780×646, 투명 PNG) |

### 다시 받는 방법

```bash
# 1) 전체 카드 목록(JSON, 약 1.3MB)에서 아나스타샤(chara_id 227)만 고르기
curl -o cards.json https://starlight.kirara.ca/api/v1/list/card_t
python3 - <<'PY'
import json
for c in json.load(open("cards.json"))["result"]:
    if c["chara_id"] == 227:
        print(c["id"], c["rarity_dep"]["rarity"], c["has_spread"], c.get("title"), c["pose"])
PY

# 2) 각성 일러스트 (has_spread=true 인 카드만 존재)
curl -o 200117.png https://hidamarirhodonite.kirara.ca/spread/200117.png
# 3) 미각성(2D) 일러스트 — pose 번호를 쓴다 (1,3,5 … 33)
curl -o 200117-u.png https://hidamarirhodonite.kirara.ca/chara2/227/5.png
```

- 카드 상세 페이지: `https://starlight.kirara.ca/card/{id}`
- 아나스타샤 카드는 총 17장이고, 그중 `has_spread` 가 있는 16장을 모두 넣었습니다(200039는 spread 없음).
- `chara2/{chara_id}/{pose}.png` 는 카드의 미각성 일러스트를 잘라 둔 투명 PNG 입니다. 크기가 카드마다 다릅니다.

현재 수록 카드: 200065 스타리비치 · 200117 크리스탈 스노우 · 200175 오르골의 작은 상자 ·
200291 별을 도는 이야기 · 200391 Nothing but You · 200449 오로라의 선율 · 200527 벚꽃 바람 ·
200617 워밍 하트 · 200727 TRUE COLORS · 200783 설매의 깃옷 · 200949 새해 여정 ·
201047 스타라이트 스쿨 · 201097 영원히 지지 않는 꽃 · 201203 금빛 가을의 마음단장 ·
201411 욕심쟁이 써니 베케이션 · 201483 샤인 바이 미

---

## 2. 돈키호테 — 림버스 컴퍼니

| 항목 | 내용 |
| --- | --- |
| 출처 | **Limbus Company Wiki (wiki.gg)** |
| 카테고리 | https://limbuscompany.wiki.gg/wiki/Category:Don_Quixote_Sprites (파일 164개) |
| 이미지 호스트 | `https://limbuscompany.wiki.gg/images/{파일명}` |
| 받은 것 | 41장 — 기본 스탠딩 + 표정 11, 기사 7, 혈귀 4, 산초 6, 산초(과거) 4, 과거 2, 부상 2, 실루엣 2, 만우절 2 (632×1876 · 736×1864 · 476×1302 등 투명 PNG) |

### 다시 받는 방법

```bash
# 카테고리 페이지에서 파일명 목록 뽑기 (curl 기본 UA 로 받아야 한다)
curl -o don_cat.html https://limbuscompany.wiki.gg/wiki/Category:Don_Quixote_Sprites
grep -o 'href="/wiki/File:[^"#]*"' don_cat.html | sed 's|href="/wiki/File:||;s|"$||' | sed 's|_| |g' | sort -u

# 파일 받기 — UA 헤더를 붙이면 403, 브라우저처럼 보이면 429 가 난다. 기본 curl UA + 0.5초 간격이 안전.
curl -o standing.png "https://limbuscompany.wiki.gg/images/Don_Quixote_StandingSprite.png"
sleep 0.5
curl -o knight.png "https://limbuscompany.wiki.gg/images/Don_Quixote_Knight_StandingSprite.png"
```

- 이름 규칙: `Don Quixote {폼} StandingSprite.png`(스탠딩), `Don Quixote {폼} Sprite {n}.png`(표정·포즈). URL 에서 공백은 `_`.
- 폼: 기본(없음) · `Knight` 기사 · `Bloodfiend` 혈귀 · `Bloodfiend Weapon` · `Sancho` 산초 ·
  `Sancho Past` 산초 과거 · `Sancho Past Human Eyes` · `Sancho Injured` · `Past` 과거 · `Injured` 부상 ·
  `Shadow` · `Sancho Silhouette` · `AF 2025` / `AF 2026` 만우절.
- 10장 넘게 빠르게 받으면 429 가 뜹니다. 6~10초 쉬었다가 이어 받으세요.
- 카테고리 목록은 `curl` 로 받아지지만 `api.php`(MediaWiki API)는 403 입니다.

---

## 3. 리쿠하치마 아루 — 블루 아카이브

| 항목 | 내용 |
| --- | --- |
| 출처 | **Kivotos Expression Archive** + 원본 저장소 **MoeTalk** |
| 사이트 | https://kivotos-unofficial-expressions.pages.dev |
| 원본 | https://github.com/ggg555ttt/MoeTalk (`GameData/BLDA/CharFace/`) |
| 받은 것 | 35장 (400×400, 배경을 투명 PNG 로 정리) |

### 다시 받는 방법

```bash
# 1) 카탈로그(캐릭터 145명 · 세트 355개)
curl -o catalog.json https://kivotos-unofficial-expressions.pages.dev/data/catalog.json
python3 - <<'PY'
import json
for c in json.load(open("catalog.json"))["characters"]:
    if c["cid"] == 157:
        print(c["names"], c["totalSprites"], c["sets"])
PY

# 2) 세트별로 0.webp, 1.webp … 를 받는다 (CDN 3곳 중 아무거나)
#    CFID_6/CharID_157 (110장) · CFID_10/CharID_157-210 (265장) · CFID_4/CharID_157 (7장)
seq 0 109 | xargs -P 8 -I{} curl -s -o {}.webp \
  "https://pub-dd7c68047288490aaed41bf7e8b16858.r2.dev/CFID_6/CharID_157/{}.webp"

# CDN 대체 경로
#  https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace/{CFID}/{폴더}/{n}.webp
#  https://raw.githubusercontent.com/ggg555ttt/MoeTalk/main/GameData/BLDA/CharFace/{CFID}/{폴더}/{n}.webp
```

- 원본은 **배경이 있는 WebP**(흰 배경 + 분홍 헤일로)입니다. 이 프로젝트는 가장자리에서 플러드필해 배경을 지우고 내용에 맞게 잘랐습니다(`tol=42`, `soft=30`). 코드는 아래 [배경 제거](#5-배경-제거투명-png-만들기) 참고.
- 세트 의미: `CFID_6` 기본 의상, `CFID_10`은 안경 없는 버전(0~120)과 안경 버전(128~264), `CFID_4`는 감정 폭발(울먹/폭소) 7장.
- 다른 캐릭터를 넣으려면 `catalog.json` 의 `names.kr`/`names.jp` 로 `cid` 를 찾아 같은 방식으로 받으면 됩니다.

---

## 4. 아니스 — 승리의 여신: 니케

| 항목 | 내용 |
| --- | --- |
| 출처 | **nikke.gg**(DotGG) + **Nikke-db** GitHub 저장소 |
| 캐릭터 페이지 | https://nikke.gg/characters/anis · `/anis-sparkling-summer` · `/anis-star` |
| 이미지 호스트 | `https://static.dotgg.gg/nikke/characters-big/{id}.webp` (전신, 투명) · `characters/{id}.webp` (256×256 버스트 컷) |
| 받은 것 | 9장 — 전신 3(447×909 · 666×1022 · 678×932), 버스트 컷 3(256×256), SD 3(128×128) |

### 다시 받는 방법

```bash
# 전신 아트 (아니스 12, 스파클링 서머 15, 스타 아니스 17)
curl -o anis.webp https://static.dotgg.gg/nikke/characters-big/12.webp
curl -o anis-summer.webp https://static.dotgg.gg/nikke/characters-big/15.webp
curl -o anis-star.webp https://static.dotgg.gg/nikke/characters-big/17.webp

# 버스트 컷(256)
curl -o anis-bust.webp https://static.dotgg.gg/nikke/characters/12.webp

# SD 스프라이트 (Nikke-db, 아니스 코드 c017)
curl -L -o sd.png https://raw.githubusercontent.com/Nikke-db/Nikke-db.github.io/main/images/sprite/si_c017_00_s.png
```

- 캐릭터 페이지 HTML 에서 `characters-big/[0-9]+\.webp` 를 grep 하면 그 캐릭터의 전신 아트 번호를 찾을 수 있습니다.
- `l2d/c017/...` 의 Live2D 텍스처 아틀라스는 부위가 흩어져 있어 그대로는 쓸 수 없습니다.

---

## 5. 배경 제거(투명 PNG 만들기)

아루 표정처럼 배경이 있는 이미지는 Pillow 로 가장자리에서 플러드필해 배경을 지웠습니다.
(밝은 단색 배경 + 캐릭터가 테두리에 닿지 않는 이미지에 잘 맞습니다. v3는 `tol=42`, `soft=30`.)

```python
from PIL import Image
import numpy as np
from collections import deque

def bg_transparent(src, dst, tol=42, soft=30):
    im = Image.open(src).convert("RGBA")
    a = np.array(im).astype(np.int16)
    h, w = a.shape[:2]
    rgb = a[:, :, :3]
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((rgb.astype(np.float32) - bg) ** 2).sum(axis=2))
    visited = np.zeros((h, w), bool); dq = deque(); thr = tol + soft
    for x in range(w):
        for y in (0, h - 1):
            if dist[y, x] <= thr and not visited[y, x]: visited[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if dist[y, x] <= thr and not visited[y, x]: visited[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and dist[ny, nx] <= thr:
                visited[ny, nx] = True; dq.append((ny, nx))
    alpha = a[:, :, 3].astype(np.float32)
    alpha[visited & (dist <= tol)] = 0
    m = visited & (dist > tol) & (dist < thr)
    alpha[m] = np.minimum(alpha[m], 255 * (thr - dist[m]) / soft)
    out = a.copy(); out[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    res = Image.fromarray(out.astype(np.uint8), "RGBA")
    bbox = res.split()[3].getbbox()
    if bbox: res = res.crop(bbox)      # 여백도 함께 정리
    res.save(dst)
    return res.size
```

---

## 6. 썸네일 만들기 (v3)

목록이 100컷을 넘어서, 그리드에는 원본 대신 **4:5 얼굴 중심 썸네일**(WebP 320×400, q82)을 씁니다.
원본은 스테이지에서만 불러옵니다.

- 얼굴 위치(`focus`)를 아는 이미지는 그 지점이 썸네일 가운데에 오도록 4:5로 잘라 냅니다.
  - 세로 전신(돈키호테): 금발 머리 픽셀이 처음 나오는 행을 찾아 `focus = 그 행 / 높이 + 0.05`.
  - 투명 일러스트(아나스타샤 미각성): 알파가 있는 영역의 위에서 16% 지점.
  - 가로 일러스트·정사각 얼굴: 0.42~0.5.
- `data/characters.json` 의 `focus` 값이 스테이지 `얼굴` 보기의 `object-position` 과 썸네일 크롭에 함께 쓰입니다.

---

## 7. 캐릭터/컷을 추가하는 방법

1. 이미지를 `assets/{캐릭터id}/NN-이름.png` 에 넣고, 같은 이름의 썸네일을 `assets/thumbs/{캐릭터id}/NN-이름.webp` 로 만듭니다.
2. `data/characters.json` 에 항목을 추가합니다(형식은 README 참고).
3. `data/characters.js` 를 다시 만듭니다(README 의 3번).
