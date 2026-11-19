# SOURCES — 에셋 출처와 확장 가이드

이 아카이브에 들어 있는 이미지는 모두 **공개된 팬/위키 아카이브에서 실제로 내려받은 파일**입니다.
아래 경로를 그대로 쓰면 캐릭터별로 수십~수천 장까지 늘릴 수 있습니다.

> ⚠️ 모든 이미지의 권리는 원 저작권자(반다이남코, 프로젝트문, 넥슨게임즈, 시프트업 등)에게 있습니다.
> 개인 감상·정리용으로만 쓰고, 재배포·상업적 이용은 각 작품의 이용 약관을 확인하세요.

---

## 1. 아나스타샤 — 아이돌마스터 신데렐라 걸즈 (최애)

| 항목 | 내용 |
| --- | --- |
| 사용한 출처 | **Starlight Kirara** (데레스테 카드 DB) — https://starlight.kirara.ca |
| 캐릭터 페이지 | https://starlight.kirara.ca/char/227 |
| 이미지 호스트 | `https://hidamarirhodonite.kirara.ca` |
| 받은 이미지 | 카드 일러스트(spread) 6장, 1280×824 PNG |

### 대량으로 받는 방법

1. 전체 카드 목록(JSON, 약 1.3MB):
   ```bash
   curl -o cards.json https://starlight.kirara.ca/api/v1/list/card_t
   ```
2. 아나스타샤(`chara_id: 227`) 카드만 골라내기:
   ```bash
   python3 - <<'PY'
   import json
   data = json.load(open("cards.json"))["result"]
   for c in data:
       if c["chara_id"] == 227:
           print(c["id"], c["rarity_dep"]["rarity"], c.get("title"), c.get("has_spread"))
   PY
   ```
3. 카드 일러스트(spread) 내려받기 — `has_spread: true` 인 카드만 존재:
   ```bash
   curl -o 200117.png https://hidamarirhodonite.kirara.ca/spread/200117.png
   ```
4. 카드 썸네일(액자 포함, 272×340)은 `https://hidamarirhodonite.kirara.ca/card/{id}.png`.
5. 카드 상세 페이지: `https://starlight.kirara.ca/card/{id}`.

현재 수록 카드: 200065 스타리비치 · 200117 크리스탈 스노우 · 200291 별을 도는 이야기 ·
200391 Nothing but You · 200949 새해 여정 · 201411 써니 베케이션.
(아나스타샤 카드는 총 17장, 그중 spread 일러스트 16장 — 전부 받으면 최애 페이지를 훨씬 두껍게 만들 수 있습니다.)

---

## 2. 돈키호테 — 림버스 컴퍼니

| 항목 | 내용 |
| --- | --- |
| 사용한 출처 | **Limbus Company Wiki (wiki.gg)** |
| 카테고리 | https://limbuscompany.wiki.gg/wiki/Category:Don_Quixote_Sprites |
| 이미지 호스트 | `https://limbuscompany.wiki.gg/images/{파일명}` |
| 받은 이미지 | 투명 PNG 스탠딩/표정 7장, 632×1876 |

### 대량으로 받는 방법

카테고리에 **164개 파일**이 있습니다(기본 · 부상 · 기사 · 과거 · 산초 · 혈귀 · 실루엣 등 + 표정별 `Sprite N`).

- 이미지 파일은 **UA 헤더 없이** 받아야 합니다. `-A "Mozilla/5.0"` 처럼 브라우저 UA를 붙이면 403이 납니다.
  ```bash
  # OK
  curl -o standing.png "https://limbuscompany.wiki.gg/images/Don_Quixote_StandingSprite.png"
  # 403
  curl -A "Mozilla/5.0" -o standing.png "https://limbuscompany.wiki.gg/images/Don_Quixote_StandingSprite.png"
  ```
- 파일명 규칙: `Don Quixote Sprite {n}.png`(표정/포즈) · `Don Quixote {버전} StandingSprite.png`(기본 스탠딩).
  URL에서는 공백을 `_`로 바꿉니다.
- 짧은 시간에 10장 넘게 받으면 **429(Too Many Requests)** 가 뜹니다. 10초쯤 쉬었다가 이어 받으세요.
- 카테고리 목록 자체는 MediaWiki API(`api.php`)가 403이지만, **브라우저로 열면** 정상 표시됩니다.
  목록을 스크립트로 뽑고 싶다면 브라우저로 카테고리 페이지를 열어 파일명을 읽는 방식이 가장 확실합니다.

현재 수록: 기본 스탠딩 + 환한 웃음 · 놀람 · 차분 · 삐침 · 눈감은 미소 · 외침(각 `Sprite N`).

---

## 3. 리쿠하치마 아루 — 블루 아카이브

| 항목 | 내용 |
| --- | --- |
| 사용한 출처 | **Kivotos Expression Archive**(비공식 표정 아카이브) + 원본 저장소 **MoeTalk** |
| 사이트 | https://kivotos-unofficial-expressions.pages.dev |
| 원본 저장소 | https://github.com/ggg555ttt/MoeTalk (`GameData/BLDA/CharFace/`) |
| 받은 이미지 | 얼굴 표정 6장, 400×400 (원본 WebP → 배경을 투명 PNG로 정리) |

### 대량으로 받는 방법

1. 사이트의 카탈로그(캐릭터·세트·장수 목록, 약 180KB):
   ```bash
   curl -o catalog.json https://kivotos-unofficial-expressions.pages.dev/data/catalog.json
   ```
2. 카탈로그에서 아루(`cid: 157`) 세트 확인 — `CFID_6/CharID_157`(110장), `CFID_10/CharID_157-210`(265장), `CFID_4/CharID_157`(7장).
3. 표정 이미지 URL 규칙: `{CDN}/{CFID}/{폴더}/{번호}.webp` (번호는 0부터, 0 패딩 없음)
   ```bash
   # CDN 후보 (앞의 것이 막히면 다음 것)
   #  https://pub-dd7c68047288490aaed41bf7e8b16858.r2.dev
   #  https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace
   #  https://raw.githubusercontent.com/ggg555ttt/MoeTalk/main/GameData/BLDA/CharFace
   curl -o aru_00.webp "https://pub-dd7c68047288490aaed41bf7e8b16858.r2.dev/CFID_6/CharID_157/0.webp"
   ```
   ※ `https://ba-cdn.somethingnicehere.com` 은 직접 호출 시 403입니다.
4. 원본은 **배경이 있는 WebP**입니다. 투명하게 쓰려면 가장자리 색을 기준으로 플러드필 제거
   (이 프로젝트에서는 `tools/` 없이 Pillow로 처리했고, `SOURCES.md` 아래 "배경 제거" 참고).
5. 다른 캐릭터를 추가하려면 `catalog.json`의 `names.kr`/`names.jp`로 `cid`를 찾고 같은 방식으로 받으면 됩니다(총 145명).

---

## 4. 아니스 — 승리의 여신: 니케

| 항목 | 내용 |
| --- | --- |
| 사용한 출처 | **nikke.gg**(DotGG) 캐릭터 페이지 + **Nikke-db** GitHub 저장소 |
| 캐릭터 페이지 | https://nikke.gg/characters/anis/ (변형: `/anis-star/`, `/anis-sparkling-summer/`) |
| 이미지 호스트 | `https://static.dotgg.gg/nikke/characters-big/{id}.webp` (전신, 투명) |
| 받은 이미지 | 3장(기본 447×909 · 스파클링 서머 666×1022 · 스타 아니스 678×932) |

### 대량으로 받는 방법

- 캐릭터 페이지 HTML에서 `characters-big/{숫자}.webp` 를 찾으면 그 캐릭터의 전신 아트입니다.
  ```bash
  curl -sL -A "Mozilla/5.0" https://nikke.gg/characters/anis/ | grep -o 'characters-big/[0-9]*\.webp'
  curl -o anis.webp https://static.dotgg.gg/nikke/characters-big/12.webp
  ```
  (아니스 = 12, 스파클링 서머 = 15, 스타 아니스 = 17 / 소형 아이콘은 `characters/{id}.webp`)
- **Nikke-db 저장소**(스프라이트·Live2D 원본): https://github.com/Nikke-db/Nikke-db.github.io
  - `images/sprite/si_{코드}_{n}_s.png` — 128×128 치비 아이콘 (아니스 코드 `c017`)
  - `l2d/{코드}/*.png` — Live2D 텍스처 아틀라스(부위별로 흩어져 있어 그대로는 쓰기 어렵습니다)
  - 저장소 전체 트리: `https://api.github.com/repos/Nikke-db/Nikke-db.github.io/git/trees/main?recursive=1`

---

## 5. 배경 제거(투명 PNG 만들기) 메모

아루 표정처럼 배경이 있는 이미지는 Pillow로 가장자리에서 플러드필해 배경을 지웠습니다.
(밝은 배경 + 캐릭터가 테두리에 닿지 않는 이미지에 잘 맞습니다.)

```python
from PIL import Image
import numpy as np
from collections import deque

def bg_transparent(src, dst, tol=38, soft=24):
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
            if dist[y, x] <= thr: visited[y, x] = True; dq.append((y, x))
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
    Image.fromarray(out.astype(np.uint8), "RGBA").save(dst)
```

---

## 6. 캐릭터/컷을 추가하는 방법 (코덱스로 확장할 때)

1. 이미지를 `assets/{캐릭터id}/` 폴더에 넣습니다. 파일명은 `01-이름.png` 처럼 정렬되게 붙이면 편합니다.
2. `data/characters.json` 에 캐릭터 또는 컷을 추가합니다. 컷 한 개의 형식:

   ```json
   {
     "id": "anya-07",
     "file": "assets/anya/07-new-card.png",
     "title": "새 카드",
     "type": "일러스트",
     "emotion": "미소",
     "outfit": "원피스",
     "tags": ["봄", "벚꽃"],
     "w": 1280,
     "h": 824,
     "source": "https://starlight.kirara.ca/card/200527",
     "sourceLabel": "Starlight Kirara · card 200527"
   }
   ```
   - `type`(종류) · `emotion`(감정) · `outfit`(의상) 값은 그대로 필터 칩으로 만들어집니다.
   - 새 작품을 넣으려면 `works` 배열에 `{id, name, full, accent}` 를 추가하고 캐릭터의 `work` 에 그 id를 씁니다.
3. `data/characters.js` 를 다시 만듭니다(JSON을 그대로 감싸는 파일).
   ```bash
   python3 - <<'PY'
   import json
   d = json.load(open("data/characters.json", encoding="utf-8"))
   js = "window.ARCHIVE_DATA = " + json.dumps(d, ensure_ascii=False, indent=2) + ";\n"
   open("data/characters.js", "w", encoding="utf-8").write(js)
   PY
   ```
4. 내장 사본(더블클릭으로 열었을 때 저장·복사·ZIP용)을 갱신합니다.
   ```bash
   python3 tools/build-embed.py
   ```
5. `index.html` 을 새로고침해서 확인합니다.

> 내장 사본(`data/assets-embed.js`)은 WebP(q92) data URL 모음입니다. 이미지를 아주 많이 늘리면
> 파일이 커지므로, 그때는 `tools/build-embed.py` 를 건너뛰고 로컬 서버(`python3 -m http.server`)로
> 여는 방식을 쓰면 됩니다. 없는 이미지는 자동으로 `assets/` 경로로 대체됩니다.
