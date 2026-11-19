/* ============================================================
   나만의 표정 아카이브 — app.js
   외부 라이브러리 없이 동작하는 1차 프로토타입.
   데이터는 data/characters.js 의 window.ARCHIVE_DATA 를 사용합니다.
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.ARCHIVE_DATA;
  if (!DATA || !Array.isArray(DATA.characters)) {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div class="modal"><div class="modal-card"><h3>데이터를 불러오지 못했습니다</h3>' +
        '<div class="modal-body"><p><code>data/characters.js</code> 파일이 <code>index.html</code> 과 같은 폴더 구조에 있는지 확인해 주세요.</p></div></div></div>'
    );
    return;
  }

  /* ---------------- 유틸 ---------------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function findCharByItem(item) {
    for (var i = 0; i < DATA.characters.length; i++) {
      if (DATA.characters[i].items.indexOf(item) !== -1) return DATA.characters[i];
    }
    return null;
  }
  function findItemById(id) {
    for (var i = 0; i < DATA.characters.length; i++) {
      var items = DATA.characters[i].items;
      for (var j = 0; j < items.length; j++) if (items[j].id === id) return items[j];
    }
    return null;
  }
  function workOf(char) {
    for (var i = 0; i < DATA.works.length; i++) if (DATA.works[i].id === char.work) return DATA.works[i];
    return { id: char.work, name: char.work, full: char.work, accent: "#7fb2ff" };
  }
  function safeFileName(text) {
    return String(text).replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "cut";
  }
  /* 이미지 비율로 프레임링 등급을 정합니다. wide/square 는 전체 맞춤, tall 은 얼굴·상반신 중심 */
  function fitKind(w, h) {
    var r = (w || 1) / (h || 1);
    if (r < 0.95) return "tall";
    if (r > 1.25) return "wide";
    return "square";
  }

  /* file:// 로 열었는지, 내장 이미지 사본이 있는지 */
  var EMBED = window.ARCHIVE_EMBED || null;
  var FILE_MODE = (typeof location !== "undefined" && location.protocol === "file:");
  function assetSrc(file) {
    if (FILE_MODE && EMBED && EMBED[file]) return EMBED[file];
    return file;
  }
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("이미지를 읽지 못했습니다: " + src.slice(0, 60))); };
      img.src = src;
    });
  }

  /* ---------------- 상태 ---------------- */
  var state = {
    work: "all",
    query: "",
    charId: null,
    itemId: null,
    filters: { type: "all", emotion: "all", outfit: "all" },
    bg: "checker",
    view: "fit",
    zoom: 1, panX: 0, panY: 0,
    playing: false,
    selected: {},
    spotlightIndex: 0
  };

  var favoriteChar = null;
  for (var ci = 0; ci < DATA.characters.length; ci++) {
    if (DATA.characters[ci].favorite) { favoriteChar = DATA.characters[ci]; break; }
  }
  if (!favoriteChar) favoriteChar = DATA.characters[0];
  state.charId = favoriteChar.id;
  if (favoriteChar.items.length) state.itemId = favoriteChar.items[0].id;

  /* ---------------- 엘리먼트 ---------------- */
  var els = {
    topStats: $("topStats"),
    spotlightMedia: $("spotlightMedia"),
    spotlightBd: $("spotlightBd"),
    spotlightImg: $("spotlightImg"),
    spotlightWork: $("spotlightWork"),
    spotlightName: $("spotlightName"),
    spotlightLatin: $("spotlightLatin"),
    spotlightTagline: $("spotlightTagline"),
    spotlightMeta: $("spotlightMeta"),
    spotlightDots: $("spotlightDots"),
    spotlightOpen: $("spotlightOpen"),
    workTabs: $("workTabs"),
    searchInput: $("searchInput"),
    charGrid: $("charGrid"),
    rosterCount: $("rosterCount"),
    rosterEmpty: $("rosterEmpty"),
    inspector: $("inspector"),
    inspectorSub: $("inspectorSub"),
    stage: $("stage"),
    stageViewport: $("stageViewport"),
    stageCanvas: $("stageCanvas"),
    stageImg: $("stageImg"),
    viewSwitch: $("viewSwitch"),
    stageCounter: $("stageCounter"),
    stageCaption: $("stageCaption"),
    bgSwitch: $("bgSwitch"),
    zoomLabel: $("zoomLabel"),
    zoomIn: $("zoomIn"),
    zoomOut: $("zoomOut"),
    zoomReset: $("zoomReset"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    playBtn: $("playBtn"),
    charName: $("charName"),
    charWork: $("charWork"),
    charFav: $("charFav"),
    itemMeta: $("itemMeta"),
    typeChips: $("typeChips"),
    emotionChips: $("emotionChips"),
    outfitChips: $("outfitChips"),
    thumbGrid: $("thumbGrid"),
    thumbCount: $("thumbCount"),
    selectAllBtn: $("selectAllBtn"),
    selectNoneBtn: $("selectNoneBtn"),
    saveBtn: $("saveBtn"),
    copyBtn: $("copyBtn"),
    zipBtn: $("zipBtn"),
    zipCount: $("zipCount"),
    sourceBlock: $("sourceBlock"),
    toast: $("toast"),
    modal: $("modal"),
    modalTitle: $("modalTitle"),
    modalBody: $("modalBody"),
    modalActions: $("modalActions"),
    modalClose: $("modalClose")
  };

  /* ---------------- 계산 ---------------- */
  function currentChar() {
    for (var i = 0; i < DATA.characters.length; i++) {
      if (DATA.characters[i].id === state.charId) return DATA.characters[i];
    }
    return DATA.characters[0];
  }
  function visibleItems() {
    var char = currentChar();
    var f = state.filters;
    return char.items.filter(function (it) {
      if (f.type !== "all" && it.type !== f.type) return false;
      if (f.emotion !== "all" && it.emotion !== f.emotion) return false;
      if (f.outfit !== "all" && it.outfit !== f.outfit) return false;
      return true;
    });
  }
  function currentItem() {
    var list = visibleItems();
    for (var i = 0; i < list.length; i++) if (list[i].id === state.itemId) return list[i];
    return list.length ? list[0] : null;
  }
  function totalCuts() {
    return DATA.characters.reduce(function (n, c) { return n + c.items.length; }, 0);
  }
  function selectionCount() {
    return Object.keys(state.selected).filter(function (k) { return state.selected[k]; }).length;
  }

  /* ---------------- 토스트 / 모달 ---------------- */
  var toastTimer = null;
  function toast(message, kind) {
    els.toast.textContent = message;
    els.toast.className = "toast is-show" + (kind === "warn" ? " is-warn" : "");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.className = "toast"; }, 3600);
  }
  function openModal(title, bodyNodes, actions) {
    els.modalTitle.textContent = title;
    els.modalBody.innerHTML = "";
    bodyNodes.forEach(function (n) { els.modalBody.appendChild(n); });
    els.modalActions.innerHTML = "";
    (actions || []).forEach(function (a) {
      var b = el("button", "btn" + (a.primary ? " btn-primary" : ""), a.label);
      b.type = "button";
      b.addEventListener("click", function () { if (a.onClick) a.onClick(); });
      els.modalActions.appendChild(b);
    });
    els.modal.hidden = false;
  }
  function closeModal() { els.modal.hidden = true; }
  els.modalClose.addEventListener("click", closeModal);
  els.modal.addEventListener("click", function (e) { if (e.target === els.modal) closeModal(); });

  /* ---------------- 상단 통계 ---------------- */
  function renderTopStats() {
    els.topStats.innerHTML = "";
    var pills = [
      ["작품", DATA.works.length],
      ["캐릭터", DATA.characters.length],
      ["컷", totalCuts()]
    ];
    pills.forEach(function (p) {
      var pill = el("span", "stat-pill");
      pill.innerHTML = p[0] + " <b>" + p[1] + "</b>";
      els.topStats.appendChild(pill);
    });
  }

  /* ---------------- 프레임 초점 ---------------- */
  /* tall 이미지는 프레임 비율에 따라 세로로 잘립니다. 캐릭터별 얼굴 위치(focus)를
     기준으로 object-position 을 계산해 머리·얼굴이 항상 프레임 안에 들어오게 합니다. */
  function focusPercent(img, frame, focusY, anchor) {
    if (!img.naturalWidth || !img.naturalHeight) return null;
    var bw = frame.clientWidth, bh = frame.clientHeight;
    if (!bw || !bh) return null;
    var boxA = bw / bh;
    var imgA = img.naturalWidth / img.naturalHeight;
    if (imgA >= boxA) return null;
    var visible = imgA / boxA;
    if (visible >= 1) return null;
    var top = Math.max(0, Math.min(1 - visible, focusY - anchor * visible));
    return (top / (1 - visible)) * 100;
  }

  function applyFrameFocus() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-fit='tall']"), function (frame) {
      var img = frame.querySelector(".media-fg");
      if (!img) return;
      if (frame.classList.contains("stage-canvas") && state.view !== "face") {
        img.style.removeProperty("object-position");
        return;
      }
      var focusY = parseFloat(frame.getAttribute("data-focus"));
      if (isNaN(focusY)) focusY = 0.35;
      var anchor = 0.42;
      if (frame.classList.contains("thumb")) anchor = 0.45;
      else if (frame.classList.contains("stage-canvas")) anchor = 0.5;
      var pct = focusPercent(img, frame, focusY, anchor);
      if (pct === null) img.style.removeProperty("object-position");
      else img.style.objectPosition = "center " + pct.toFixed(1) + "%";
    });
  }
  window.addEventListener("resize", applyFrameFocus);
  window.addEventListener("load", applyFrameFocus);

  function makeFrame(frame, item) {
    frame.setAttribute("data-fit", fitKind(item.w, item.h));
    if (item.focus != null) frame.setAttribute("data-focus", item.focus);
    return frame;
  }

  /* ---------------- 스포트라이트 ---------------- */
  function renderSpotlight() {
    els.spotlightName.textContent = favoriteChar.name;
    els.spotlightLatin.textContent = favoriteChar.latin;
    els.spotlightWork.textContent = "SPOTLIGHT · " + workOf(favoriteChar).full;
    els.spotlightTagline.textContent = favoriteChar.tagline;

    els.spotlightMeta.innerHTML = "";
    var meta = [
      workOf(favoriteChar).name,
      favoriteChar.items.length + "컷",
      favoriteChar.items[0] ? favoriteChar.items[0].type : ""
    ].filter(Boolean);
    meta.forEach(function (t) {
      els.spotlightMeta.appendChild(el("span", "badge", t));
    });

    var idx = state.spotlightIndex % Math.max(favoriteChar.items.length, 1);
    var item = favoriteChar.items[idx];
    if (item) {
      var src = assetSrc(item.file);
      if (els.spotlightImg.getAttribute("src") !== src) {
        els.spotlightImg.classList.remove("is-visible");
        els.spotlightImg.setAttribute("src", src);
        els.spotlightBd.setAttribute("src", src);
        els.spotlightImg.setAttribute("alt", favoriteChar.name + " — " + item.title);
      }
      els.spotlightMedia.setAttribute("data-fit", fitKind(item.w, item.h));
      els.spotlightMedia.setAttribute("data-focus", favoriteChar.focus != null ? favoriteChar.focus : 0.35);
      applyFrameFocus();
      requestAnimationFrame(function () { els.spotlightImg.classList.add("is-visible"); });
    }

    els.spotlightDots.innerHTML = "";
    favoriteChar.items.forEach(function (it, i) {
      var dot = el("button");
      dot.type = "button";
      dot.className = i === idx ? "is-active" : "";
      dot.title = it.title;
      dot.setAttribute("aria-label", it.title + " 보기");
      dot.addEventListener("click", function () {
        state.spotlightIndex = i;
        renderSpotlight();
      });
      els.spotlightDots.appendChild(dot);
    });
  }

  els.spotlightOpen.addEventListener("click", function () {
    selectCharacter(favoriteChar.id, true);
  });

  /* ---------------- 작품 탭 ---------------- */
  function renderTabs() {
    els.workTabs.innerHTML = "";
    var tabs = [{ id: "all", name: "전체" }].concat(DATA.works);
    tabs.forEach(function (w) {
      var b = el("button", "tab" + (state.work === w.id ? " is-active" : ""), w.name);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", state.work === w.id ? "true" : "false");
      b.addEventListener("click", function () {
        state.work = w.id;
        renderTabs();
        renderRoster();
      });
      els.workTabs.appendChild(b);
    });
  }

  /* ---------------- 캐릭터 그리드 ---------------- */
  function matchesQuery(char, q) {
    if (!q) return true;
    var hay = [
      char.name, char.latin, char.tagline,
      workOf(char).name, workOf(char).full
    ];
    char.items.forEach(function (it) {
      hay.push(it.title, it.type, it.emotion, it.outfit);
      it.tags.forEach(function (t) { hay.push(t); });
    });
    var lower = q.toLowerCase();
    return hay.join(" ").toLowerCase().indexOf(lower) !== -1;
  }

  function renderRoster() {
    var q = state.query.trim();
    var list = DATA.characters.filter(function (c) {
      if (state.work !== "all" && c.work !== state.work) return false;
      return matchesQuery(c, q);
    });

    els.charGrid.innerHTML = "";
    list.forEach(function (c) {
      var work = workOf(c);
      var card = el("button", "char-card" + (c.id === state.charId ? " is-active" : ""));
      card.type = "button";
      card.style.setProperty("--accent", c.accent || work.accent);
      card.setAttribute("aria-label", c.name + " 선택");

      var thumb = el("div", "char-thumb media-frame");
      var img = el("img", "media-fg");
      var cover = c.items[0];
      if (cover) {
        var coverSrc = assetSrc(cover.file);
        makeFrame(thumb, { w: cover.w, h: cover.h, focus: c.focus });
        var bd = el("img", "media-bd");
        bd.src = coverSrc;
        bd.alt = "";
        bd.setAttribute("aria-hidden", "true");
        bd.loading = "lazy";
        thumb.appendChild(bd);
        img.src = coverSrc;
        img.alt = c.name;
        img.loading = "lazy";
        img.addEventListener("load", applyFrameFocus);
      }
      thumb.appendChild(img);
      if (c.favorite) thumb.appendChild(el("span", "badge badge-fav", "★ 최애"));
      card.appendChild(thumb);

      var body = el("div", "char-body");
      body.appendChild(el("p", "char-name", c.name));
      body.appendChild(el("p", "char-latin", c.latin));
      var workRow = el("p", "char-work");
      var dotEl = el("span", "work-dot");
      dotEl.style.background = work.accent;
      workRow.appendChild(dotEl);
      workRow.appendChild(document.createTextNode(work.full));
      body.appendChild(workRow);

      var foot = el("div", "char-foot");
      foot.appendChild(el("span", null, c.items.length + "컷"));
      var types = {};
      c.items.forEach(function (it) { types[it.type] = true; });
      foot.appendChild(el("span", null, Object.keys(types).join(" · ")));
      body.appendChild(foot);

      card.appendChild(body);
      card.addEventListener("click", function () { selectCharacter(c.id, false); });
      els.charGrid.appendChild(card);
    });

    els.rosterCount.textContent = list.length + "명 표시 중 · 전체 " + DATA.characters.length + "명";
    els.rosterEmpty.hidden = list.length !== 0;
  }

  function selectCharacter(id, scroll) {
    state.charId = id;
    state.filters = { type: "all", emotion: "all", outfit: "all" };
    var char = currentChar();
    state.itemId = char.items.length ? char.items[0].id : null;
    resetZoom();
    renderRoster();
    renderInspector();
    if (scroll) {
      els.inspector.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---------------- 인스펙터 ---------------- */
  function renderInspector() {
    var char = currentChar();
    var work = workOf(char);
    els.charName.textContent = char.name;
    els.charWork.textContent = work.full + " · " + char.latin;
    els.charFav.hidden = !char.favorite;
    els.inspectorSub.textContent = char.tagline;
    document.documentElement.style.setProperty("--accent", char.accent || work.accent);

    renderChips();
    renderStage();
    renderThumbs();
    renderSources();
    renderSelectionUI();
  }

  function renderChips() {
    var char = currentChar();
    var groups = [
      { key: "type", host: els.typeChips },
      { key: "emotion", host: els.emotionChips },
      { key: "outfit", host: els.outfitChips }
    ];
    groups.forEach(function (g) {
      var values = [];
      char.items.forEach(function (it) {
        var v = it[g.key];
        if (v && values.indexOf(v) === -1) values.push(v);
      });
      g.host.innerHTML = "";
      var allBtn = el("button", "chip" + (state.filters[g.key] === "all" ? " is-active" : ""), "전체");
      allBtn.type = "button";
      allBtn.addEventListener("click", function () { setFilter(g.key, "all"); });
      g.host.appendChild(allBtn);
      values.forEach(function (v) {
        var b = el("button", "chip" + (state.filters[g.key] === v ? " is-active" : ""), v);
        b.type = "button";
        b.addEventListener("click", function () { setFilter(g.key, v); });
        g.host.appendChild(b);
      });
    });
  }

  function setFilter(key, value) {
    state.filters[key] = value;
    var list = visibleItems();
    if (list.length && !list.some(function (it) { return it.id === state.itemId; })) {
      state.itemId = list[0].id;
    }
    resetZoom();
    renderChips();
    renderStage();
    renderThumbs();
    renderSelectionUI();
  }

  function renderStage() {
    var item = currentItem();
    var char = currentChar();
    if (!item) {
      els.stageImg.removeAttribute("src");
      els.stageCounter.textContent = "0 / 0";
      els.stageCaption.textContent = "이 조건에 맞는 컷이 없습니다.";
      return;
    }
    if (els.stageImg.getAttribute("src") !== assetSrc(item.file)) {
      els.stageImg.src = assetSrc(item.file);
    }
    els.stageImg.alt = char.name + " — " + item.title + " (" + item.type + ")";
    els.stageCanvas.setAttribute("data-fit", fitKind(item.w, item.h));
    els.stageCanvas.setAttribute("data-focus", char.focus != null ? char.focus : 0.35);
    applyFrameFocus();

    var list = visibleItems();
    var pos = 0;
    for (var i = 0; i < list.length; i++) if (list[i].id === item.id) { pos = i; break; }
    els.stageCounter.textContent = (pos + 1) + " / " + list.length;

    els.stageCaption.innerHTML = "";
    els.stageCaption.appendChild(el("span", "cap-title", char.name));
    els.stageCaption.appendChild(el("span", null, "·"));
    els.stageCaption.appendChild(el("span", null, item.title));
    els.stageCaption.appendChild(el("span", null, "· " + item.type + " / " + item.emotion));
    if (item.source) {
      var a = el("a", null, "원본 보기 ↗");
      a.href = item.source;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      els.stageCaption.appendChild(a);
    }

    renderMeta(item);
    applyTransform();
  }

  function renderMeta(item) {
    els.itemMeta.innerHTML = "";
    if (!item) {
      var empty = el("p", "meta-empty", "캐릭터를 선택하고 컷을 골라 주세요.");
      els.itemMeta.appendChild(empty);
      return;
    }
    var titleRow = el("div", "meta-title");
    titleRow.appendChild(el("strong", null, item.title));
    titleRow.appendChild(el("span", "meta-type", item.type));
    els.itemMeta.appendChild(titleRow);

    var dl = el("dl", "meta-rows");
    function row(k, v) {
      dl.appendChild(el("dt", null, k));
      dl.appendChild(el("dd", null, v));
    }
    row("감정", item.emotion);
    row("의상", item.outfit);
    row("원본 크기", item.w + " × " + item.h + " px");
    row("파일", item.file.split("/").pop());
    els.itemMeta.appendChild(dl);

    if (item.tags && item.tags.length) {
      var tags = el("div", "tag-list");
      item.tags.forEach(function (t) { tags.appendChild(el("span", "tag", "#" + t)); });
      els.itemMeta.appendChild(tags);
    }
  }

  function renderSources() {
    var char = currentChar();
    els.sourceBlock.innerHTML = "";
    els.sourceBlock.appendChild(el("p", "filter-title", "원본 출처"));
    (char.sources || []).forEach(function (s) {
      var row = el("p", "source-item");
      row.appendChild(el("span", null, "↗"));
      var a = el("a", null, s.label);
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      row.appendChild(a);
      els.sourceBlock.appendChild(row);
    });
    if (char.credit) {
      var credit = el("p", "source-item");
      credit.appendChild(el("span", null, "©"));
      credit.appendChild(el("span", null, char.credit));
      els.sourceBlock.appendChild(credit);
    }
  }

  /* ---------------- 썸네일 ---------------- */
  function renderThumbs() {
    var char = currentChar();
    var list = visibleItems();
    els.thumbGrid.innerHTML = "";
    els.thumbCount.textContent = "(" + list.length + " / " + char.items.length + ")";

    list.forEach(function (it) {
      var thumb = el("div", "thumb media-frame" + (it.id === state.itemId ? " is-active" : ""));
      thumb.setAttribute("role", "button");
      thumb.setAttribute("tabindex", "0");
      thumb.setAttribute("aria-label", it.title + " 보기");
      thumb.setAttribute("data-fit", fitKind(it.w, it.h));
      thumb.setAttribute("data-focus", it.focus != null ? it.focus : (char.focus != null ? char.focus : 0.35));
      if (it.type === "일러스트") thumb.classList.add("is-illust");
      if (state.selected[it.id]) thumb.classList.add("is-selected");

      var thumbSrc = assetSrc(it.file);
      var bd = el("img", "media-bd");
      bd.src = thumbSrc;
      bd.alt = "";
      bd.setAttribute("aria-hidden", "true");
      bd.loading = "lazy";
      thumb.appendChild(bd);

      var img = el("img", "media-fg");
      img.src = thumbSrc;
      img.alt = it.title;
      img.loading = "lazy";
      img.addEventListener("load", applyFrameFocus);
      thumb.appendChild(img);
      thumb.appendChild(el("span", "thumb-label", it.title));

      var check = el("button", "thumb-check", "✓");
      check.type = "button";
      check.title = "ZIP 내보내기에 선택/해제";
      check.setAttribute("aria-pressed", state.selected[it.id] ? "true" : "false");
      check.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleSelect(it.id);
      });
      thumb.appendChild(check);

      thumb.addEventListener("click", function () { viewItem(it.id); });
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          viewItem(it.id);
        }
      });
      els.thumbGrid.appendChild(thumb);
    });
  }

  function viewItem(id) {
    state.itemId = id;
    resetZoom();
    renderStage();
    renderThumbs();
  }

  /* ---------------- 선택 ---------------- */
  function toggleSelect(id) {
    state.selected[id] = !state.selected[id];
    renderThumbs();
    renderSelectionUI();
  }
  function renderSelectionUI() {
    var n = selectionCount();
    els.zipCount.textContent = n;
    els.zipBtn.disabled = n === 0;
  }
  els.selectAllBtn.addEventListener("click", function () {
    visibleItems().forEach(function (it) { state.selected[it.id] = true; });
    renderThumbs();
    renderSelectionUI();
    toast("현재 목록의 컷을 모두 선택했습니다.");
  });
  els.selectNoneBtn.addEventListener("click", function () {
    state.selected = {};
    renderThumbs();
    renderSelectionUI();
  });

  /* ---------------- 검색 ---------------- */
  els.searchInput.addEventListener("input", function () {
    state.query = els.searchInput.value;
    renderRoster();
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-query]"), function (btn) {
    btn.addEventListener("click", function () {
      var q = btn.getAttribute("data-query") || "";
      els.searchInput.value = q;
      state.query = q;
      state.work = "all";
      renderTabs();
      renderRoster();
    });
  });

  /* ---------------- 줌 / 팬 ---------------- */
  function applyTransform() {
    var z = state.zoom;
    els.stageCanvas.style.transform =
      "translate(" + state.panX + "px, " + state.panY + "px) scale(" + z.toFixed(2) + ")";
    els.zoomLabel.textContent = Math.round(z * 100) + "%";
  }
  function setZoom(next) {
    state.zoom = Math.min(4, Math.max(1, Math.round(next * 100) / 100));
    if (state.zoom === 1) { state.panX = 0; state.panY = 0; }
    applyTransform();
  }
  function resetZoom() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
  }
  els.zoomIn.addEventListener("click", function () { setZoom(state.zoom + 0.25); });
  els.zoomOut.addEventListener("click", function () { setZoom(state.zoom - 0.25); });
  els.zoomReset.addEventListener("click", function () {
    resetZoom();
    toast("확대/위치를 초기화했습니다.");
  });

  (function enablePan() {
    var dragging = false;
    var startX = 0, startY = 0, originX = 0, originY = 0;
    var vp = els.stageViewport;
    vp.addEventListener("pointerdown", function (e) {
      if (state.zoom <= 1) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originX = state.panX;
      originY = state.panY;
      vp.classList.add("is-panning");
      if (vp.setPointerCapture) { try { vp.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    vp.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      state.panX = originX + (e.clientX - startX);
      state.panY = originY + (e.clientY - startY);
      applyTransform();
    });
    function stop() {
      dragging = false;
      vp.classList.remove("is-panning");
    }
    vp.addEventListener("pointerup", stop);
    vp.addEventListener("pointercancel", stop);
    vp.addEventListener("pointerleave", stop);
    vp.addEventListener("dblclick", function () {
      if (state.zoom > 1) resetZoom();
      else setZoom(2);
    });
  })();

  /* ---------------- 보기 방식 (전체 / 얼굴) ---------------- */
  function setView(view) {
    state.view = view === "face" ? "face" : "fit";
    els.stage.setAttribute("data-view", state.view);
    Array.prototype.forEach.call(els.viewSwitch.querySelectorAll(".view-btn"), function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-view") === state.view);
    });
    resetZoom();
    applyFrameFocus();
  }
  els.viewSwitch.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-view]") : null;
    if (!btn) return;
    setView(btn.getAttribute("data-view"));
  });

  /* ---------------- 배경 전환 ---------------- */
  els.bgSwitch.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-bg]") : null;
    if (!btn) return;
    state.bg = btn.getAttribute("data-bg");
    els.stage.setAttribute("data-bg", state.bg);
    Array.prototype.forEach.call(els.bgSwitch.querySelectorAll(".bg-btn"), function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-bg") === state.bg);
    });
  });

  /* ---------------- 이전 / 다음 / 자동재생 ---------------- */
  function step(delta) {
    var list = visibleItems();
    if (!list.length) return;
    var cur = currentItem();
    var idx = 0;
    for (var i = 0; i < list.length; i++) if (cur && list[i].id === cur.id) { idx = i; break; }
    var next = (idx + delta + list.length) % list.length;
    viewItem(list[next].id);
  }
  els.prevBtn.addEventListener("click", function () { step(-1); });
  els.nextBtn.addEventListener("click", function () { step(1); });

  var playTimer = null;
  function setPlaying(on) {
    state.playing = on;
    els.playBtn.textContent = on ? "⏸ 정지" : "▶ 자동재생";
    els.playBtn.classList.toggle("is-playing", on);
    els.playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    if (on) {
      playTimer = setInterval(function () { step(1); }, 2600);
      toast("자동재생을 시작했습니다. 2.6초마다 다음 컷으로 넘어갑니다.");
    }
  }
  els.playBtn.addEventListener("click", function () { setPlaying(!state.playing); });

  /* ---------------- 키보드 ---------------- */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "");
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(state.zoom + 0.25); }
    else if (e.key === "-" || e.key === "_") { e.preventDefault(); setZoom(state.zoom - 0.25); }
    else if (e.key === "0") { e.preventDefault(); resetZoom(); }
    else if (e.key === "f" || e.key === "F") { e.preventDefault(); setView("fit"); }
    else if (e.key === "g" || e.key === "G") { e.preventDefault(); setView("face"); }
    else if (e.key === "Escape") { closeModal(); }
  });

  /* ---------------- PNG 저장 / 복사 ---------------- */
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1200);
  }
  function saveCurrent() {
    var item = currentItem();
    if (!item) { toast("저장할 컷이 없습니다."); return; }
    var char = currentChar();
    var name = char.id + "_" + safeFileName(item.title) + ".png";

    // file:// 로 열린 경우: 내장 사본을 캔버스로 PNG 변환해서 바로 저장
    if (FILE_MODE && EMBED && EMBED[item.file]) {
      pngBlobForItem(item).then(function (blob) {
        downloadBlob(blob, name);
        toast("PNG 저장: " + name);
      }).catch(function () {
        legacyLinkDownload(item, name);
      });
      return;
    }
    legacyLinkDownload(item, name);
    toast("PNG 저장: " + name);
  }

  function legacyLinkDownload(item, name) {
    var a = document.createElement("a");
    a.href = item.file;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  els.saveBtn.addEventListener("click", saveCurrent);

  function canvasPngBlob(img) {
    return new Promise(function (resolve, reject) {
      try {
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        if (!w || !h) { reject(new Error("이미지가 아직 준비되지 않았습니다.")); return; }
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("PNG 변환 실패"));
        }, "image/png");
      } catch (err) {
        reject(err); // file:// 로 열었을 때 캔버스가 오염된 경우
      }
    });
  }

  /* item 한 장을 PNG Blob 으로 (file:// 모드에서도 동작) */
  function pngBlobForItem(item) {
    var src = assetSrc(item.file);
    if (els.stageImg.getAttribute("src") === src && els.stageImg.complete && els.stageImg.naturalWidth) {
      return canvasPngBlob(els.stageImg);
    }
    return loadImage(src).then(function (img) { return canvasPngBlob(img); });
  }
  function imageBlobToPng(blob) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        canvasPngBlob(img).then(function (png) {
          URL.revokeObjectURL(url);
          resolve(png);
        }).catch(function (err) {
          URL.revokeObjectURL(url);
          reject(err);
        });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("이미지를 읽지 못했습니다."));
      };
      img.src = url;
    });
  }
  async function writeClipboard(blob) {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      throw new Error("이 브라우저는 클립보드 이미지 쓰기를 지원하지 않습니다.");
    }
    var png = blob.type === "image/png" ? blob : await imageBlobToPng(blob);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
  }
  function showCopyFallback() {
    var p1 = el("p", null, "브라우저가 이 이미지를 클립보드로 넘기지 못했습니다. 대개 파일을 더블클릭해 열었을 때(file://) 로컬 이미지가 '다른 출처'로 취급되어 생기는 제한입니다.");
    var p2 = el("p", null, "아래처럼 이 폴더에서 간단한 로컬 서버를 켜고 http://localhost:8000 으로 열면 복사와 ZIP이 모두 동작합니다.");
    var code = el("code", null, "cd my-expression-archive\npython3 -m http.server 8000");
    var p3 = el("p", null, "지금 바로 한 장만 필요하다면 PNG 저장을 사용하세요.");
    openModal("PNG 복사가 제한되었습니다", [p1, p2, code, p3], [
      { label: "PNG 저장", primary: true, onClick: function () { closeModal(); saveCurrent(); } },
      { label: "닫기", onClick: closeModal }
    ]);
  }
  async function copyCurrent() {
    var item = currentItem();
    if (!item) { toast("복사할 컷이 없습니다."); return; }
    els.copyBtn.disabled = true;
    try {
      var blob = null;
      if (!FILE_MODE) {
        try {
          var res = await fetch(item.file, { cache: "no-store" });
          if (!res.ok) throw new Error("HTTP " + res.status);
          blob = await res.blob();
        } catch (fetchErr) {
          blob = null;
        }
      }
      if (!blob) blob = await pngBlobForItem(item);
      await writeClipboard(blob);
      toast("현재 컷을 PNG로 클립보드에 복사했습니다.");
    } catch (err) {
      showCopyFallback();
    } finally {
      els.copyBtn.disabled = false;
    }
  }
  els.copyBtn.addEventListener("click", copyCurrent);

  /* ---------------- ZIP (무압축 STORE, 순수 JS) ---------------- */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function dosDateTime(d) {
    var time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((Math.floor(d.getSeconds() / 2)) & 31);
    var date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
    return { time: time, date: date };
  }

  /* files: [{ name: string, data: Uint8Array }] → Blob(application/zip) */
  function buildZipBlob(files) {
    var encoder = new TextEncoder();
    var localParts = [];
    var centralParts = [];
    var offset = 0;
    var stamp = dosDateTime(new Date());

    files.forEach(function (f) {
      var nameBytes = encoder.encode(f.name);
      var crc = crc32(f.data);
      var size = f.data.length;

      var local = new Uint8Array(30 + nameBytes.length);
      var dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034B50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, stamp.time, true);
      dv.setUint16(12, stamp.date, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, size, true);
      dv.setUint32(22, size, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      local.set(nameBytes, 30);

      var cd = new Uint8Array(46 + nameBytes.length);
      var dv2 = new DataView(cd.buffer);
      dv2.setUint32(0, 0x02014B50, true);
      dv2.setUint16(4, 20, true);
      dv2.setUint16(6, 20, true);
      dv2.setUint16(8, 0x0800, true);
      dv2.setUint16(10, 0, true);
      dv2.setUint16(12, stamp.time, true);
      dv2.setUint16(14, stamp.date, true);
      dv2.setUint32(16, crc, true);
      dv2.setUint32(20, size, true);
      dv2.setUint32(24, size, true);
      dv2.setUint16(28, nameBytes.length, true);
      dv2.setUint32(42, offset, true);
      cd.set(nameBytes, 46);

      localParts.push(local, f.data);
      centralParts.push(cd);
      offset += local.length + size;
    });

    var centralSize = centralParts.reduce(function (n, c) { return n + c.length; }, 0);
    var end = new Uint8Array(22);
    var dv3 = new DataView(end.buffer);
    dv3.setUint32(0, 0x06054B50, true);
    dv3.setUint16(8, files.length, true);
    dv3.setUint16(10, files.length, true);
    dv3.setUint32(12, centralSize, true);
    dv3.setUint32(16, offset, true);
    dv3.setUint16(20, 0, true);

    return new Blob(localParts.concat(centralParts, [end]), { type: "application/zip" });
  }

  function creditsText(items) {
    var lines = [];
    lines.push("나만의 표정 아카이브 — 선택 컷 " + items.length + "장");
    lines.push("내보낸 시각: " + new Date().toLocaleString("ko-KR"));
    lines.push("");
    lines.push("개인 감상용 팬 아카이브입니다. 각 이미지의 권리는 원 저작권자에게 있습니다.");
    lines.push("");
    items.forEach(function (it) {
      var ch = findCharByItem(it);
      lines.push("- " + it.file.split("/").pop() + "  |  " + ch.name + " · " + it.title + " (" + it.type + ")");
      lines.push("  출처: " + (it.source || "-"));
    });
    lines.push("");
    DATA.characters.forEach(function (c) {
      lines.push("[" + c.name + "] " + (c.credit || ""));
      (c.sources || []).forEach(function (s) { lines.push("  - " + s.label + ": " + s.url); });
    });
    return lines.join("\n");
  }

  async function fetchBytes(url) {
    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + url);
    return new Uint8Array(await res.arrayBuffer());
  }

  /* 파일 바이트: http 에서는 원본 그대로, file:// 에서는 내장 사본을 PNG 로 변환 */
  async function bytesForItem(item) {
    if (!FILE_MODE) {
      try { return await fetchBytes(item.file); } catch (e) { /* 내장 사본으로 폴백 */ }
    }
    var blob = await pngBlobForItem(item);
    return new Uint8Array(await blob.arrayBuffer());
  }

  function showZipFallback(items) {
    var p1 = el("p", null, "선택한 이미지 파일을 읽지 못해 ZIP을 만들 수 없었습니다. 파일을 더블클릭해 열었을 때(file://)는 브라우저가 폴더의 다른 파일을 읽는 것을 막습니다.");
    var p2 = el("p", null, "이 폴더에서 아래 명령으로 로컬 서버를 켜고, 브라우저에서 http://localhost:8000 을 열면 ZIP과 복사가 모두 동작합니다.");
    var code = el("code", null, "cd my-expression-archive\npython3 -m http.server 8000");
    var p3 = el("p", null, "지금 당장 필요하면 선택한 " + items.length + "장을 하나씩 저장할 수 있습니다. (브라우저가 여러 파일 저장 허용을 물을 수 있습니다)");
    openModal("선택 ZIP을 만들 수 없습니다", [p1, p2, code, p3], [
      {
        label: "하나씩 저장 (" + items.length + "장)",
        primary: true,
        onClick: async function () {
          closeModal();
          for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var ch = findCharByItem(it);
            var name = ch.id + "_" + safeFileName(it.title) + ".png";
            try {
              var bytes = await bytesForItem(it);
              downloadBlob(new Blob([bytes], { type: "image/png" }), name);
            } catch (e) {
              legacyLinkDownload(it, name);
            }
            await new Promise(function (r) { setTimeout(r, 350); });
          }
          toast(items.length + "장을 개별 저장합니다. 여러 파일 저장 허용을 눌러 주세요.");
        }
      },
      { label: "닫기", onClick: closeModal }
    ]);
  }

  async function exportZip() {
    var ids = Object.keys(state.selected).filter(function (k) { return state.selected[k]; });
    var items = ids.map(findItemById).filter(Boolean);
    if (!items.length) { toast("먼저 ZIP으로 묶을 컷을 선택하세요."); return; }

    els.zipBtn.disabled = true;
    var originalLabel = els.zipBtn.innerHTML;
    els.zipBtn.textContent = "묶는 중…";
    try {
      var files = [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var ch = findCharByItem(it);
        var data = await bytesForItem(it);
        files.push({ name: ch.id + "_" + it.file.split("/").pop(), data: data });
        els.zipBtn.textContent = "묶는 중… " + (i + 1) + "/" + items.length;
      }
      var credit = new TextEncoder().encode(creditsText(items));
      files.push({ name: "CREDITS.txt", data: credit });
      downloadBlob(buildZipBlob(files), "expression-archive-selection.zip");
      toast(items.length + "컷을 ZIP으로 저장했습니다.");
    } catch (err) {
      showZipFallback(items);
    } finally {
      els.zipBtn.innerHTML = originalLabel;
      renderSelectionUI();
    }
  }
  els.zipBtn.addEventListener("click", exportZip);

  /* ---------------- 스포트라이트 자동 회전 ---------------- */
  setInterval(function () {
    if (document.hidden) return;
    if (!favoriteChar.items.length) return;
    state.spotlightIndex = (state.spotlightIndex + 1) % favoriteChar.items.length;
    renderSpotlight();
  }, 6000);

  /* ---------------- 초기 렌더 ---------------- */
  renderTopStats();
  renderSpotlight();
  renderTabs();
  renderRoster();
  renderInspector();
  renderSelectionUI();
  applyFrameFocus();

  // 테스트/확장용 (콘솔에서 확인 가능)
  window.__archive = {
    state: state,
    data: DATA,
    buildZipBlob: buildZipBlob,
    crc32: crc32,
    selectCharacter: selectCharacter,
    viewItem: viewItem
  };
})();
