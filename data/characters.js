/* 나만의 표정 아카이브 — 데이터 (characters.json 과 같은 내용)
   file:// 로 index.html 을 바로 열어도 CORS 없이 동작하도록 window.ARCHIVE_DATA 로 노출합니다. */
window.ARCHIVE_DATA = {
  "meta": {
    "title": "나만의 표정 아카이브",
    "latin": "MY EXPRESSION ARCHIVE",
    "version": "1차 프로토타입",
    "updated": "2026-11-19",
    "note": "최애 1명 + 서브 3명, 4개 작품의 실제 공개 에셋으로 구성한 개인 표정 아카이브."
  },
  "works": [
    {
      "id": "cgss",
      "name": "신데렐라 걸즈",
      "full": "아이돌마스터 신데렐라 걸즈",
      "accent": "#9dc2ff"
    },
    {
      "id": "limbus",
      "name": "림버스 컴퍼니",
      "full": "림버스 컴퍼니",
      "accent": "#f2b23e"
    },
    {
      "id": "bluearchive",
      "name": "블루 아카이브",
      "full": "블루 아카이브",
      "accent": "#63c9ff"
    },
    {
      "id": "nikke",
      "name": "니케",
      "full": "승리의 여신: 니케",
      "accent": "#ff8ab8"
    }
  ],
  "characters": [
    {
      "id": "anya",
      "name": "아나스타샤",
      "latin": "Anastasia",
      "work": "cgss",
      "favorite": true,
      "accent": "#a8ccff",
      "focus": 0.34,
      "tagline": "은빛 머리칼 아래, 서리처럼 조용하고 별처럼 다정한 아이돌.",
      "bio": "차갑게 보이지만 속은 누구보다 따뜻한 신데렐라 걸즈의 아이돌. 이 아카이브의 최애. 밤과 별, 겨울의 정서가 묻어나는 카드 일러스트를 중심으로 모았습니다.",
      "sources": [
        {
          "label": "Starlight Kirara (데레스테 카드 DB)",
          "url": "https://starlight.kirara.ca/char/227"
        },
        {
          "label": "아나스타샤 카드 목록 · 카드 #200065",
          "url": "https://starlight.kirara.ca/card/200065"
        }
      ],
      "credit": "© BANDAI NAMCO Entertainment Inc. / THE IDOLM@STER CINDERELLA GIRLS",
      "items": [
        {
          "id": "anya-01",
          "file": "assets/anya/01-starlee-beach.png",
          "title": "스타리비치",
          "type": "일러스트",
          "emotion": "차분",
          "outfit": "수영복",
          "tags": [
            "밤바다",
            "별",
            "여름밤"
          ],
          "w": 1280,
          "h": 824,
          "source": "https://starlight.kirara.ca/card/200065",
          "sourceLabel": "Starlight Kirara · card 200065"
        },
        {
          "id": "anya-02",
          "file": "assets/anya/02-crystal-snow.png",
          "title": "크리스탈 스노우",
          "type": "일러스트",
          "emotion": "미소",
          "outfit": "겨울 코트",
          "tags": [
            "일루미네이션",
            "겨울",
            "별빛"
          ],
          "w": 1280,
          "h": 824,
          "source": "https://starlight.kirara.ca/card/200117",
          "sourceLabel": "Starlight Kirara · card 200117"
        },
        {
          "id": "anya-03",
          "file": "assets/anya/03-hoshimeguru-monogatari.png",
          "title": "별을 도는 이야기",
          "type": "일러스트",
          "emotion": "나른함",
          "outfit": "드레스",
          "tags": [
            "별",
            "밤",
            "물가"
          ],
          "w": 1280,
          "h": 824,
          "source": "https://starlight.kirara.ca/card/200291",
          "sourceLabel": "Starlight Kirara · card 200291"
        },
        {
          "id": "anya-04",
          "file": "assets/anya/04-nothing-but-you.png",
          "title": "Nothing but You",
          "type": "일러스트",
          "emotion": "시크",
          "outfit": "블랙 원피스",
          "tags": [
            "도시",
            "밤",
            "어른"
          ],
          "w": 1280,
          "h": 824,
          "source": "https://starlight.kirara.ca/card/200391",
          "sourceLabel": "Starlight Kirara · card 200391"
        },
        {
          "id": "anya-05",
          "file": "assets/anya/05-new-year-journey.png",
          "title": "새해 여정",
          "type": "일러스트",
          "emotion": "미소",
          "outfit": "기모노",
          "tags": [
            "새해",
            "눈",
            "동양풍"
          ],
          "w": 1280,
          "h": 824,
          "source": "https://starlight.kirara.ca/card/200949",
          "sourceLabel": "Starlight Kirara · card 200949"
        },
        {
          "id": "anya-06",
          "file": "assets/anya/06-sunny-vacation.png",
          "title": "써니 베케이션",
          "type": "일러스트",
          "emotion": "웃음",
          "outfit": "수영복",
          "tags": [
            "여름",
            "해변",
            "낮"
          ],
          "w": 1280,
          "h": 824,
          "source": "https://starlight.kirara.ca/card/201411",
          "sourceLabel": "Starlight Kirara · card 201411"
        }
      ]
    },
    {
      "id": "don",
      "name": "돈키호테",
      "latin": "Don Quixote",
      "work": "limbus",
      "favorite": false,
      "accent": "#f2b23e",
      "focus": 0.4,
      "tagline": "정의의 사도, 오늘도 모험을 향해 달려갑니다!",
      "bio": "림버스 컴퍼니의 죄수 #3. 투명 배경 스탠딩 스프라이트에서 표정만 바꾼 컷을 모았습니다. 표정마다 성격이 그대로 드러나는 캐릭터라 표정 수집이 재미있는 쪽입니다.",
      "sources": [
        {
          "label": "Limbus Company Wiki · Don Quixote Sprites",
          "url": "https://limbuscompany.wiki.gg/wiki/Category:Don_Quixote_Sprites"
        },
        {
          "label": "Don Quixote StandingSprite 파일",
          "url": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_StandingSprite.png"
        }
      ],
      "credit": "© Project Moon / Limbus Company. Wiki assets under CC BY-SA 4.0.",
      "items": [
        {
          "id": "don-01",
          "file": "assets/don/00-standing.png",
          "title": "기본 스탠딩",
          "type": "스탠딩",
          "emotion": "무표정",
          "outfit": "LCB 제복",
          "tags": [
            "전신",
            "투명 PNG"
          ],
          "w": 632,
          "h": 1876,
          "source": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_StandingSprite.png",
          "sourceLabel": "Limbus Wiki · Don Quixote StandingSprite"
        },
        {
          "id": "don-02",
          "file": "assets/don/01-bright-smile.png",
          "title": "환한 웃음",
          "type": "표정",
          "emotion": "기쁨",
          "outfit": "LCB 제복",
          "tags": [
            "전신",
            "웃음"
          ],
          "w": 632,
          "h": 1876,
          "source": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_Sprite_1.png",
          "sourceLabel": "Limbus Wiki · Sprite 1"
        },
        {
          "id": "don-03",
          "file": "assets/don/02-surprised.png",
          "title": "놀람",
          "type": "표정",
          "emotion": "놀람",
          "outfit": "LCB 제복",
          "tags": [
            "전신",
            "입 벌림"
          ],
          "w": 632,
          "h": 1876,
          "source": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_Sprite_2.png",
          "sourceLabel": "Limbus Wiki · Sprite 2"
        },
        {
          "id": "don-04",
          "file": "assets/don/03-calm.png",
          "title": "차분",
          "type": "표정",
          "emotion": "차분",
          "outfit": "LCB 제복",
          "tags": [
            "전신",
            "무심"
          ],
          "w": 632,
          "h": 1876,
          "source": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_Sprite_3.png",
          "sourceLabel": "Limbus Wiki · Sprite 3"
        },
        {
          "id": "don-05",
          "file": "assets/don/04-pout.png",
          "title": "삐침",
          "type": "표정",
          "emotion": "시무룩",
          "outfit": "LCB 제복",
          "tags": [
            "전신",
            "불만"
          ],
          "w": 632,
          "h": 1876,
          "source": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_Sprite_6.png",
          "sourceLabel": "Limbus Wiki · Sprite 6"
        },
        {
          "id": "don-06",
          "file": "assets/don/05-eyeclosed-smile.png",
          "title": "눈감은 미소",
          "type": "표정",
          "emotion": "미소",
          "outfit": "LCB 제복",
          "tags": [
            "전신",
            "행복"
          ],
          "w": 632,
          "h": 1876,
          "source": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_Sprite_7.png",
          "sourceLabel": "Limbus Wiki · Sprite 7"
        },
        {
          "id": "don-07",
          "file": "assets/don/06-shout.png",
          "title": "외침",
          "type": "표정",
          "emotion": "흥분",
          "outfit": "LCB 제복",
          "tags": [
            "전신",
            "외침"
          ],
          "w": 632,
          "h": 1876,
          "source": "https://limbuscompany.wiki.gg/wiki/File:Don_Quixote_Sprite_8.png",
          "sourceLabel": "Limbus Wiki · Sprite 8"
        }
      ]
    },
    {
      "id": "aru",
      "name": "리쿠하치마 아루",
      "latin": "Rikuhachima Aru",
      "work": "bluearchive",
      "favorite": false,
      "accent": "#63c9ff",
      "focus": 0.46,
      "tagline": "핸드북의 정의대로, 어딘가 서툰 두목님.",
      "bio": "게헨나 학원 문제아 해결위원회 위원장. 모에톡(MoeTalk) 커뮤니티 표정 스프라이트에서 아루의 얼굴 표정만 골랐습니다. 배경은 투명 PNG로 정리해 두어 스테이지 배경 전환이 그대로 살아납니다.",
      "sources": [
        {
          "label": "Kivotos Expression Archive (비공식 표정 아카이브)",
          "url": "https://kivotos-unofficial-expressions.pages.dev/"
        },
        {
          "label": "MoeTalk 원본 저장소 · CharFace/CFID_6/CharID_157",
          "url": "https://github.com/ggg555ttt/MoeTalk/tree/main/GameData/BLDA/CharFace/CFID_6/CharID_157"
        }
      ],
      "credit": "© NEXON Games / Blue Archive. 표정 스프라이트: MoeTalk 커뮤니티 작가진.",
      "items": [
        {
          "id": "aru-01",
          "file": "assets/aru/01-calm.png",
          "title": "차분한 미소",
          "type": "표정",
          "emotion": "차분",
          "outfit": "게헨나 제복",
          "tags": [
            "얼굴",
            "미소"
          ],
          "w": 400,
          "h": 400,
          "source": "https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace/CFID_6/CharID_157/0.webp",
          "sourceLabel": "MoeTalk CharFace · 0.webp"
        },
        {
          "id": "aru-02",
          "file": "assets/aru/02-soft-smile.png",
          "title": "부드러운 미소",
          "type": "표정",
          "emotion": "미소",
          "outfit": "게헨나 제복",
          "tags": [
            "얼굴",
            "눈감음"
          ],
          "w": 400,
          "h": 400,
          "source": "https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace/CFID_6/CharID_157/3.webp",
          "sourceLabel": "MoeTalk CharFace · 3.webp"
        },
        {
          "id": "aru-03",
          "file": "assets/aru/03-teary.png",
          "title": "울먹",
          "type": "표정",
          "emotion": "슬픔",
          "outfit": "게헨나 제복",
          "tags": [
            "얼굴",
            "눈물"
          ],
          "w": 400,
          "h": 400,
          "source": "https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace/CFID_6/CharID_157/8.webp",
          "sourceLabel": "MoeTalk CharFace · 8.webp"
        },
        {
          "id": "aru-04",
          "file": "assets/aru/04-grin.png",
          "title": "능글 웃음",
          "type": "표정",
          "emotion": "장난",
          "outfit": "게헨나 제복",
          "tags": [
            "얼굴",
            "여유"
          ],
          "w": 400,
          "h": 400,
          "source": "https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace/CFID_6/CharID_157/10.webp",
          "sourceLabel": "MoeTalk CharFace · 10.webp"
        },
        {
          "id": "aru-05",
          "file": "assets/aru/05-cool.png",
          "title": "시크",
          "type": "표정",
          "emotion": "무심",
          "outfit": "게헨나 제복",
          "tags": [
            "얼굴",
            "반눈"
          ],
          "w": 400,
          "h": 400,
          "source": "https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace/CFID_6/CharID_157/11.webp",
          "sourceLabel": "MoeTalk CharFace · 11.webp"
        },
        {
          "id": "aru-06",
          "file": "assets/aru/06-laugh.png",
          "title": "큰 웃음",
          "type": "표정",
          "emotion": "웃음",
          "outfit": "게헨나 제복",
          "tags": [
            "얼굴",
            "입 벌림"
          ],
          "w": 400,
          "h": 400,
          "source": "https://cdn.jsdelivr.net/gh/ggg555ttt/MoeTalk@main/GameData/BLDA/CharFace/CFID_6/CharID_157/15.webp",
          "sourceLabel": "MoeTalk CharFace · 15.webp"
        }
      ]
    },
    {
      "id": "anis",
      "name": "아니스",
      "latin": "Anis",
      "work": "nikke",
      "favorite": false,
      "accent": "#ff8ab8",
      "focus": 0.12,
      "tagline": "카운터즈의 분위기 메이커, 하고 싶은 말은 다 하는 솔직한 언니.",
      "bio": "승리의 여신: 니케 카운터즈 소속. 기본 / 스파클링 서머 / 스타 아니스 세 벌의 투명 스탠딩을 모았습니다. 같은 캐릭터의 의상 차이를 나란히 보는 재미가 있습니다.",
      "sources": [
        {
          "label": "nikke.gg · Anis",
          "url": "https://nikke.gg/characters/anis/"
        },
        {
          "label": "Nikke-db GitHub (스프라이트 · l2d 원본)",
          "url": "https://github.com/Nikke-db/Nikke-db.github.io"
        }
      ],
      "credit": "© SHIFT UP / PROXIMA BETA. 승리의 여신: 니케.",
      "items": [
        {
          "id": "anis-01",
          "file": "assets/anis/01-base.png",
          "title": "기본",
          "type": "스탠딩",
          "emotion": "자신감",
          "outfit": "카운터즈 제복",
          "tags": [
            "전신",
            "투명 PNG"
          ],
          "w": 447,
          "h": 909,
          "source": "https://static.dotgg.gg/nikke/characters-big/12.webp",
          "sourceLabel": "nikke.gg · Anis 기본"
        },
        {
          "id": "anis-02",
          "file": "assets/anis/02-sparkling-summer.png",
          "title": "스파클링 서머",
          "type": "스탠딩",
          "emotion": "여유",
          "outfit": "수영복",
          "tags": [
            "전신",
            "여름"
          ],
          "w": 666,
          "h": 1022,
          "source": "https://static.dotgg.gg/nikke/characters-big/15.webp",
          "sourceLabel": "nikke.gg · Anis: Sparkling Summer"
        },
        {
          "id": "anis-03",
          "file": "assets/anis/03-star.png",
          "title": "스타 아니스",
          "type": "스탠딩",
          "emotion": "미소",
          "outfit": "스타 의상",
          "tags": [
            "전신",
            "결정 날개"
          ],
          "w": 678,
          "h": 932,
          "source": "https://static.dotgg.gg/nikke/characters-big/17.webp",
          "sourceLabel": "nikke.gg · Anis: Star"
        }
      ]
    }
  ]
};
