/* ============================================================
   나만의 표정 아카이브 — app.js (v3)
   외부 라이브러리 없이 동작. 데이터: data/characters.js
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.ARCHIVE_DATA;
  if (!DATA || !Array.isArray(DATA.characters)) {
    document.body.insertAdjacentHTML("beforeend",
      '<div class="modal"><div class="modal-card"><h3 style="padding:18px">데이터를 불러오지 못했습니다</h3>' +
      '<div class="modal-body"><p>data/characters.js 파일이 index.html 과 같은 구조에 있는지 확인해 주세요.</p></div></div></div>');
    return;
  }

  /* ---------------- 유틸 ---------------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function workOf(char) {
    for (var i = 0; i < DATA.works.length; i++) if (DATA.works[i].id === char.work) return DATA.works[i];
    return { id: char.work, name: char.work, full: char.work, accent: "#a8ccff" };
  }
  function charById(id) {
    for (var i = 0; i < DATA.characters.length; i++) if (DATA.characters[i].id === id) return DATA.characters[i];
    return null;
  }
  function itemById(char, id) {
    for (var i = 0; i < char.items.length; i++) if (char.items[i].id === id) return char.items[i];
    return null;
  }
  function safeFileName(t) {
    return String(t).replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "cut";
  }
  function hexToRgb(h) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h || "");
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 168, g: 204, b: 255 };
  }
  function rgba(hex, a) {
    var c = hexToRgb(hex);
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
  }
  function fitKind(w, h) {
    var r = (w || 1) / (h || 1);
    return r < 0.95 ? "tall" : (r > 1.25 ? "wide" : "square");
  }
  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { rej(new Error("이미지를 읽지 못했습니다")); };
      img.src = src;
    });
  }

  var favoriteChar = DATA.characters.filter(function (c) { return c.favorite; })[0] || DATA.characters[0];

  /* ---------------- 상태 ---------------- */
  var state = {
    screen: "home",
    work: "all",
    query: "",
    charId: favoriteChar.id,
    itemId: favoriteChar.items[0] ? favoriteChar.items[0].id : null,
    form: "all",
    emotion: "all",
    bg: "checker",
    view: "fit",
    zoom: 1, panX: 0, panY: 0,
    playing: false,
    selected: {},
    heroIndex: 0
  };

  /* ---------------- 엘리먼트 ---------------- */
  var els = {
    home: $("home"), studio: $("studio"),
    heroCard: $("heroCard"), heroBg: $("heroBg"), heroFg: $("heroFg"),
    heroBadge: $("heroBadge"), heroName: $("heroName"), heroLine: $("heroLine"),
    heroCount: $("heroCount"), heroDots: $("heroDots"),
    workTabs: $("workTabs"), charGrid: $("charGrid"), rosterCount: $("rosterCount"), rosterEmpty: $("rosterEmpty"),
    searchBar: $("searchBar"), searchInput: $("searchInput"), searchToggle: $("searchToggle"), searchClear: $("searchClear"),
    studioName: $("studioName"), studioWork: $("studioWork"),
    stage: $("stage"), stageCanvas: $("stageCanvas"), stageImg: $("stageImg"),
    stageCounter: $("stageCounter"), stageType: $("stageType"),
    capTitle: $("capTitle"), capMeta: $("capMeta"),
    prevBtn: $("prevBtn"), nextBtn: $("nextBtn"),
    viewSwitch: $("viewSwitch"), bgSwitch: $("bgSwitch"),
    zoomLabel: $("zoomLabel"), zoomIn: $("zoomIn"), zoomOut: $("zoomOut"), zoomReset: $("zoomReset"),
    playBtn: $("playBtn"), saveBtn: $("saveBtn"), copyBtn: $("copyBtn"), srcLink: $("srcLink"),
    chipGroups: $("chipGroups"), thumbGrid: $("thumbGrid"), thumbCount: $("thumbCount"), thumbEmpty: $("thumbEmpty"),
    selectAllBtn: $("selectAllBtn"), selectNoneBtn: $("selectNoneBtn"),
    selBar: $("selBar"), zipCount: $("zipCount"), zipBtn: $("zipBtn"), selClear: $("selClear"),
    panelCredit: $("panelCredit"),
    modal: $("modal"), modalTitle: $("modalTitle"), modalBody: $("modalBody"), modalActions: $("modalActions"), modalX: $("modalX"),
    toast: $("toast")
  };

  /* ---------------- 토스트 / 모달 ---------------- */
  var toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("is-on"); }, 2600);
  }
  function openModal(title, nodes, actions) {
    els.modalTitle.textContent = title;
    els.modalBody.innerHTML = "";
    (nodes || []).forEach(function (n) { els.modalBody.appendChild(n); });
    els.modalActions.innerHTML = "";
    (actions || [{ label: "닫기", primary: true }]).forEach(function (a) {
      var b = el("button", a.primary ? "primary" : "", a.label);
      b.addEventListener("click", function () { if (a.onClick) a.onClick(); else closeModal(); });
      els.modalActions.appendChild(b);
    });
    els.modal.hidden = false;
  }
  function closeModal() { els.modal.hidden = true; }
  els.modalX.addEventListener("click", closeModal);
  els.modal.addEventListener("click", function (e) { if (e.target === els.modal) closeModal(); });

  /* ---------------- 라우팅 ---------------- */
  function parseHash() {
    var h = (location.hash || "").replace(/^#\/?/, "");
    if (!h) return { screen: "home" };
    var parts = h.split("/");
    return { screen: "studio", charId: parts[0], itemId: parts[1] };
  }
  function goHome(push) {
    if (push !== false) history.pushState(null, "", "#/");
    showHome();
  }
  function openChar(charId, itemId, push) {
    var c = charById(charId);
    if (!c) return goHome(push);
    if (push !== false) history.pushState(null, "", "#/" + charId + (itemId ? "/" + itemId : ""));
    state.charId = c.id;
    state.form = "all"; state.emotion = "all";
    var list = visibleItems();
    state.itemId = (itemId && itemById(c, itemId)) ? itemId : (list[0] ? list[0].id : null);
    showStudio();
  }
  function showHome() {
    state.screen = "home";
    document.body.setAttribute("data-screen", "home");
    els.studio.hidden = true;
    els.home.hidden = false;
    stopPlay();
    window.scrollTo({ top: 0 });
    renderRoster();
  }
  function showStudio() {
    state.screen = "studio";
    document.body.setAttribute("data-screen", "studio");
    els.home.hidden = true;
    els.studio.hidden = false;
    window.scrollTo({ top: 0 });
    renderStudio();
  }
  window.addEventListener("popstate", function () {
    var r = parseHash();
    if (r.screen === "studio" && charById(r.charId)) {
      state.charId = r.charId;
      if (r.itemId && itemById(charById(r.charId), r.itemId)) state.itemId = r.itemId;
      showStudio();
    } else showHome();
  });

  /* ---------------- 홈 : 히어로 ---------------- */
  var HERO_IDS = (function () {
    var want = ["anya-12", "anya-16", "anya-02", "anya-07"];
    var out = [];
    want.forEach(function (id) { var it = itemById(favoriteChar, id); if (it) out.push(it); });
    if (!out.length) out = favoriteChar.items.slice(0, 4);
    return out;
  })();

  function renderHero() {
    var it = HERO_IDS[state.heroIndex % HERO_IDS.length];
    if (!it) return;
    els.heroFg.src = it.file;
    els.heroBg.src = it.thumb;
    els.heroBg.alt = "";
    els.heroFg.alt = favoriteChar.name + " — " + it.title;
    els.heroBadge.textContent = "최애 · " + workOf(favoriteChar).full;
    els.heroName.textContent = favoriteChar.name;
    els.heroLine.textContent = favoriteChar.tagline;
    els.heroCount.textContent = favoriteChar.items.length + "컷 · " + HERO_IDS.length + "점 스포트라이트";
    els.heroDots.innerHTML = "";
    HERO_IDS.forEach(function (h, i) {
      var d = el("button", i === state.heroIndex % HERO_IDS.length ? "is-active" : "");
      d.type = "button";
      d.setAttribute("aria-label", h.title + " 보기");
      d.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        state.heroIndex = i; renderHero(); restartHero();
      });
      els.heroDots.appendChild(d);
    });
  }
  var heroTimer = null;
  function restartHero() {
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      if (state.screen !== "home" || document.hidden) return;
      state.heroIndex = (state.heroIndex + 1) % HERO_IDS.length;
      renderHero();
    }, 6000);
  }
  els.heroCard.addEventListener("click", function (e) {
    e.preventDefault();
    openChar(favoriteChar.id, null);
  });

  /* ---------------- 홈 : 탭 / 로스터 ---------------- */
  function renderTabs() {
    els.workTabs.innerHTML = "";
    var all = el("button", "tab" + (state.work === "all" ? " is-active" : ""));
    all.type = "button";
    all.innerHTML = "전체 <small>" + DATA.characters.length + "</small>";
    all.addEventListener("click", function () { state.work = "all"; renderTabs(); renderRoster(); });
    els.workTabs.appendChild(all);
    DATA.works.forEach(function (w) {
      var chars = DATA.characters.filter(function (c) { return c.work === w.id; });
      if (!chars.length) return;
      var b = el("button", "tab" + (state.work === w.id ? " is-active" : ""));
      b.type = "button";
      b.innerHTML = w.name + " <small>" + chars.reduce(function (n, c) { return n + c.items.length; }, 0) + "</small>";
      b.addEventListener("click", function () { state.work = w.id; renderTabs(); renderRoster(); });
      els.workTabs.appendChild(b);
    });
  }

  function matches(char, q) {
    if (!q) return true;
    q = q.toLowerCase();
    var hay = [char.name, char.latin, workOf(char).name, workOf(char).full, char.tagline, char.bio];
    char.items.forEach(function (it) {
      hay.push(it.title, it.form, it.emotion, it.outfit, it.type);
      hay = hay.concat(it.tags || []);
    });
    return hay.join(" ").toLowerCase().indexOf(q) !== -1;
  }

  function renderRoster() {
    var list = DATA.characters.filter(function (c) {
      if (state.work !== "all" && c.work !== state.work) return false;
      return matches(c, state.query);
    });
    els.charGrid.innerHTML = "";
    list.forEach(function (c) {
      var w = workOf(c);
      var card = el("button", "char-card");
      card.type = "button";
      card.style.setProperty("--accent", c.accent || w.accent);
      card.setAttribute("aria-label", c.name + " 스튜디오 열기");

      var bg = el("img", "cc-bg"); bg.src = c.items[0] ? c.items[0].thumb : ""; bg.alt = ""; bg.loading = "lazy";
      var img = el("img", "cc-img"); img.src = c.items[0] ? (c.items[0].thumb || c.items[0].file) : "";
      img.alt = c.name; img.loading = "lazy";
      card.appendChild(bg); card.appendChild(img);
      card.appendChild(el("div", "cc-scrim"));

      var top = el("div", "cc-top");
      if (c.favorite) top.appendChild(el("span", "cc-fav", "최애"));
      top.appendChild(el("span", "cc-count", c.items.length + "컷"));
      card.appendChild(top);

      var body = el("div", "cc-body");
      body.appendChild(el("div", "cc-name", c.name));
      body.appendChild(el("div", "cc-work", w.name));
      var bar = el("div", "cc-bar");
      var fill = el("i");
      fill.style.width = Math.max(8, Math.min(100, Math.round(c.items.length / 45 * 100))) + "%";
      bar.appendChild(fill); body.appendChild(bar);
      card.appendChild(body);

      card.addEventListener("click", function () { openChar(c.id, null); });
      els.charGrid.appendChild(card);
    });
    els.rosterCount.textContent = list.length + "명 / " + DATA.meta.total + "컷";
    els.rosterEmpty.hidden = list.length > 0;
  }

  /* ---------------- 검색 ---------------- */
  function setSearchOpen(open) {
    els.searchBar.hidden = !open;
    els.searchToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { els.searchInput.focus(); }
    else {
      els.searchInput.value = ""; state.query = "";
      els.searchClear.hidden = true;
      renderRoster();
    }
  }
  els.searchToggle.addEventListener("click", function () { setSearchOpen(els.searchBar.hidden); });
  els.searchInput.addEventListener("input", function () {
    state.query = els.searchInput.value.trim();
    els.searchClear.hidden = !state.query;
    renderRoster();
  });
  els.searchClear.addEventListener("click", function () {
    els.searchInput.value = ""; state.query = ""; els.searchClear.hidden = true;
    renderRoster(); els.searchInput.focus();
  });

  /* ---------------- 스튜디오 ---------------- */
  function currentChar() { return charById(state.charId) || favoriteChar; }
  function currentItem() { return itemById(currentChar(), state.itemId); }

  function visibleItems() {
    var c = currentChar();
    return c.items.filter(function (it) {
      if (state.form !== "all" && it.form !== state.form) return false;
      if (state.emotion !== "all" && it.emotion !== state.emotion) return false;
      return true;
    });
  }

  function renderStudio() {
    var c = currentChar();
    var w = workOf(c);
    var accent = c.accent || w.accent;
    els.studio.style.setProperty("--accent", accent);
    els.studioName.textContent = c.name;
    els.studioWork.textContent = w.name + " · " + c.items.length + "컷";
    document.title = c.name + " · 나만의 표정 아카이브";
    els.panelCredit.textContent = c.credit || "";
    renderChips();
    var list = visibleItems();
    if (!list.length) { state.itemId = null; }
    else if (!state.itemId || !list.some(function (i) { return i.id === state.itemId; })) {
      state.itemId = list[0].id;
    }
    renderStage();
    renderThumbs();
    renderSelectionUI();
    applyAccentTheme(accent);
  }

  function applyAccentTheme(accent) {
    document.documentElement.style.setProperty("--accent", accent);
  }

  function renderChips() {
    var c = currentChar();
    var forms = [], emos = [];
    var fcount = {}, ecount = {};
    c.items.forEach(function (it) {
      if (fcount[it.form] == null) { fcount[it.form] = 0; forms.push(it.form); }
      fcount[it.form]++;
      if (ecount[it.emotion] == null) { ecount[it.emotion] = 0; emos.push(it.emotion); }
      ecount[it.emotion]++;
    });
    els.chipGroups.innerHTML = "";
    els.chipGroups.appendChild(chipRow("폼", "form", forms, fcount, state.form));
    els.chipGroups.appendChild(chipRow("감정", "emotion", emos, ecount, state.emotion));
  }

  function chipRow(label, key, values, counts, active) {
    var row = el("div", "chip-row");
    row.appendChild(el("span", "chip-label", label));
    var scroller = el("div", "chip-scroll");
    var all = el("button", "chip" + (active === "all" ? " is-active" : ""));
    all.type = "button";
    all.innerHTML = "전체 <small>" + currentChar().items.length + "</small>";
    all.addEventListener("click", function () { state[key] = "all"; afterFilter(); });
    scroller.appendChild(all);
    values.forEach(function (v) {
      var b = el("button", "chip" + (active === v ? " is-active" : ""));
      b.type = "button";
      b.innerHTML = v + " <small>" + counts[v] + "</small>";
      b.addEventListener("click", function () {
        state[key] = (state[key] === v) ? "all" : v;
        afterFilter();
      });
      scroller.appendChild(b);
    });
    row.appendChild(scroller);
    return row;
  }

  function afterFilter() {
    var list = visibleItems();
    if (!list.length) state.itemId = null;
    else if (!list.some(function (i) { return i.id === state.itemId; })) state.itemId = list[0].id;
    renderChips(); renderStage(); renderThumbs(); resetZoom();
  }

  /* --- 스테이지 --- */
  function renderStage() {
    var c = currentChar();
    var it = currentItem();
    var list = visibleItems();
    var idx = 0;
    list.forEach(function (x, i) { if (it && x.id === it.id) idx = i; });
    els.stageCounter.textContent = it ? (idx + 1) + " / " + list.length : "0 / 0";
    els.stageType.textContent = it ? it.type : "";
    if (!it) {
      els.stageImg.removeAttribute("src");
      els.capTitle.textContent = "표시할 컷이 없습니다";
      els.capMeta.textContent = "";
      if (els.srcLink) els.srcLink.style.display = "none";
      return;
    }
    els.srcLink.style.display = "";
    els.srcLink.href = it.source || "#";
    els.stage.style.setProperty("--ar", (it.w || 4) + " / " + (it.h || 3));
    els.capTitle.textContent = it.title;
    els.capMeta.textContent = [it.emotion, it.outfit].filter(Boolean).join(" · ");
    var same = els.stageImg.getAttribute("src") === it.file;
    if (!same) {
      els.stageImg.style.opacity = "0";
      var next = new Image();
      next.onload = function () {
        els.stageImg.src = it.file;
        els.stageImg.alt = c.name + " — " + it.title;
        els.stageImg.setAttribute("data-fit", fitKind(it.w, it.h));
        els.stageImg.style.setProperty("--face", Math.round((it.focus != null ? it.focus : 0.3) * 100) + "%");
        els.stageImg.style.opacity = "1";
      };
      next.onerror = function () { toast("이미지를 불러오지 못했습니다"); };
      next.src = it.file;
    } else {
      els.stageImg.setAttribute("data-fit", fitKind(it.w, it.h));
      els.stageImg.style.setProperty("--face", Math.round((it.focus != null ? it.focus : 0.3) * 100) + "%");
      els.stageImg.style.opacity = "1";
    }
    // 이웃 미리 받기
    if (list.length > 1) {
      [1, -1].forEach(function (d) {
        var n = list[(idx + d + list.length) % list.length];
        if (n) { var p = new Image(); p.src = n.file; }
      });
    }
  }

  function renderThumbs() {
    var list = visibleItems();
    els.thumbGrid.innerHTML = "";
    els.thumbCount.textContent = list.length;
    els.thumbEmpty.hidden = list.length > 0;
    list.forEach(function (it) {
      var b = el("button", "thumb" + (it.id === state.itemId ? " is-active" : "") + (state.selected[it.id] ? " is-selected" : ""));
      b.type = "button";
      b.setAttribute("data-fit", fitKind(it.w, it.h));
      b.setAttribute("aria-label", it.title);
      var img = el("img");
      img.src = it.thumb || it.file;
      img.alt = it.title;
      img.loading = "lazy";
      img.decoding = "async";
      b.appendChild(img);
      b.appendChild(el("span", "thumb-label", it.title));
      var chk = el("span", "thumb-check", "✓");
      chk.setAttribute("role", "button");
      chk.setAttribute("aria-label", it.title + " 선택");
      chk.addEventListener("click", function (e) {
        e.stopPropagation();
        state.selected[it.id] = !state.selected[it.id];
        b.classList.toggle("is-selected", !!state.selected[it.id]);
        renderSelectionUI();
      });
      b.appendChild(chk);
      b.addEventListener("click", function () { viewItem(it.id); });
      els.thumbGrid.appendChild(b);
    });
  }

  function viewItem(id) {
    if (state.itemId === id) return;
    state.itemId = id;
    resetZoom();
    renderStage();
    if (history.replaceState) history.replaceState(null, "", "#/" + state.charId + "/" + id);
    // 활성 썸네일 갱신
    Array.prototype.forEach.call(els.thumbGrid.children, function (node) {
      node.classList.remove("is-active");
    });
    var list = visibleItems();
    var i = 0;
    list.forEach(function (x, k) { if (x.id === id) i = k; });
    var node = els.thumbGrid.children[i];
    if (node) {
      node.classList.add("is-active");
      if (node.scrollIntoView) {
        var r = node.getBoundingClientRect();
        if (r.bottom > window.innerHeight - 90 || r.top < 70) {
          node.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    }
  }

  function step(d) {
    var list = visibleItems();
    if (!list.length) return;
    var idx = 0;
    var cur = currentItem();
    list.forEach(function (x, i) { if (cur && x.id === cur.id) idx = i; });
    viewItem(list[(idx + d + list.length) % list.length].id);
  }

  /* --- 컨트롤 --- */
  els.prevBtn.addEventListener("click", function () { step(-1); });
  els.nextBtn.addEventListener("click", function () { step(1); });

  els.viewSwitch.addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]");
    if (!b) return;
    setView(b.getAttribute("data-view"));
  });
  function setView(v) {
    state.view = v === "face" ? "face" : "fit";
    els.stage.setAttribute("data-view", state.view);
    Array.prototype.forEach.call(els.viewSwitch.children, function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-view") === state.view);
    });
    resetZoom();
  }

  els.bgSwitch.addEventListener("click", function (e) {
    var b = e.target.closest("[data-bg]");
    if (!b) return;
    state.bg = b.getAttribute("data-bg");
    els.stage.setAttribute("data-bg", state.bg);
    Array.prototype.forEach.call(els.bgSwitch.children, function (x) {
      x.classList.toggle("is-active", x.getAttribute("data-bg") === state.bg);
    });
  });

  function applyTransform() {
    els.stageCanvas.style.transform = "translate(" + state.panX + "px," + state.panY + "px) scale(" + state.zoom + ")";
    els.zoomLabel.textContent = Math.round(state.zoom * 100) + "%";
  }
  function setZoom(z) {
    state.zoom = Math.min(4, Math.max(1, Math.round(z * 100) / 100));
    if (state.zoom === 1) { state.panX = 0; state.panY = 0; }
    applyTransform();
  }
  function resetZoom() { state.zoom = 1; state.panX = 0; state.panY = 0; applyTransform(); }
  els.zoomIn.addEventListener("click", function () { setZoom(state.zoom + 0.25); });
  els.zoomOut.addEventListener("click", function () { setZoom(state.zoom - 0.25); });
  els.zoomReset.addEventListener("click", function () { resetZoom(); });
  els.stageImg.addEventListener("dblclick", function () {
    if (state.zoom > 1) resetZoom(); else setZoom(2);
  });

  (function enablePan() {
    var drag = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = 0;
    var vp = els.stageCanvas;
    vp.addEventListener("pointerdown", function (e) {
      if (state.zoom <= 1) return;
      drag = true; moved = 0; sx = e.clientX; sy = e.clientY; ox = state.panX; oy = state.panY;
      vp.classList.add("is-panning");
      try { vp.setPointerCapture(e.pointerId); } catch (err) {}
    });
    vp.addEventListener("pointermove", function (e) {
      if (!drag) return;
      state.panX = ox + (e.clientX - sx);
      state.panY = oy + (e.clientY - sy);
      moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
      applyTransform();
    });
    function stop() { drag = false; vp.classList.remove("is-panning"); }
    vp.addEventListener("pointerup", stop);
    vp.addEventListener("pointercancel", stop);
  })();

  /* 스와이프로 이전/다음 */
  (function enableSwipe() {
    var x0 = null, y0 = null, t0 = 0;
    var stage = els.stage;
    stage.addEventListener("touchstart", function (e) {
      if (state.zoom > 1 || e.touches.length !== 1) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      var dt = Date.now() - t0;
      x0 = null;
      if (dt < 600 && Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        step(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  })();

  var playTimer = null;
  function stopPlay() {
    state.playing = false;
    clearInterval(playTimer); playTimer = null;
    if (els.playBtn) {
      els.playBtn.classList.remove("is-playing");
      els.playBtn.setAttribute("aria-pressed", "false");
      els.playBtn.textContent = "▶ 자동";
    }
  }
  els.playBtn.addEventListener("click", function () {
    if (state.playing) { stopPlay(); return; }
    state.playing = true;
    els.playBtn.classList.add("is-playing");
    els.playBtn.setAttribute("aria-pressed", "true");
    els.playBtn.textContent = "❚❚ 정지";
    playTimer = setInterval(function () { step(1); }, 2400);
  });

  /* ---------------- 선택 / ZIP ---------------- */
  function selectionIds() {
    return Object.keys(state.selected).filter(function (k) { return state.selected[k]; });
  }
  function renderSelectionUI() {
    var n = selectionIds().length;
    els.zipCount.textContent = n;
    els.selBar.hidden = n === 0;
    els.zipBtn.disabled = n === 0;
  }
  els.selectAllBtn.addEventListener("click", function () {
    visibleItems().forEach(function (it) { state.selected[it.id] = true; });
    renderThumbs(); renderSelectionUI();
    toast("현재 목록 " + visibleItems().length + "컷을 선택했습니다");
  });
  els.selectNoneBtn.addEventListener("click", function () {
    state.selected = {}; renderThumbs(); renderSelectionUI();
  });
  els.selClear.addEventListener("click", function () {
    state.selected = {}; renderThumbs(); renderSelectionUI();
  });

  /* ---------------- 저장 / 복사 ---------------- */
  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 1500);
  }
  function canvasPng(img) {
    return new Promise(function (res, rej) {
      var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
      var cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      cv.getContext("2d").drawImage(img, 0, 0, w, h);
      cv.toBlob(function (b) { b ? res(b) : rej(new Error("변환 실패")); }, "image/png");
    });
  }
  async function fileAsPngBlob(item) {
    try {
      var r = await fetch(item.file, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      var blob = await r.blob();
      if (blob.type === "image/png") return blob;
      var img = await loadImage(URL.createObjectURL(blob));
      return await canvasPng(img);
    } catch (e) {
      var im = await loadImage(item.file);
      return await canvasPng(im);
    }
  }

  els.saveBtn.addEventListener("click", async function () {
    var it = currentItem();
    if (!it) return toast("저장할 컷이 없습니다");
    els.saveBtn.disabled = true;
    try {
      var blob = await fileAsPngBlob(it);
      var name = currentChar().id + "_" + safeFileName(it.title) + ".png";
      downloadBlob(blob, name);
      toast("PNG 저장 · " + name);
    } catch (e) { toast("저장하지 못했습니다"); }
    els.saveBtn.disabled = false;
  });

  els.copyBtn.addEventListener("click", async function () {
    var it = currentItem();
    if (!it) return toast("복사할 컷이 없습니다");
    els.copyBtn.disabled = true;
    try {
      if (!navigator.clipboard || typeof ClipboardItem === "undefined") throw new Error("unsupported");
      var blob = await fileAsPngBlob(it);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("PNG를 클립보드에 복사했습니다");
    } catch (e) {
      openModal("복사가 제한되었습니다", [
        el("p", null, "이 브라우저가 이미지 클립보드 쓰기를 허용하지 않았습니다. PNG 저장으로 같은 이미지를 받을 수 있습니다.")
      ], [{ label: "PNG 저장", primary: true, onClick: function () { closeModal(); els.saveBtn.click(); } }]);
    }
    els.copyBtn.disabled = false;
  });

  /* ZIP (무압축 STORE) */
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
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function dosStamp(d) {
    return {
      time: ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((Math.floor(d.getSeconds() / 2)) & 31),
      date: (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31)
    };
  }
  function buildZip(files) {
    var enc = new TextEncoder();
    var parts = [], central = [], offset = 0;
    var st = dosStamp(new Date());
    files.forEach(function (f) {
      var name = enc.encode(f.name);
      var crc = crc32(f.data), size = f.data.length;
      var lh = new Uint8Array(30 + name.length), dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034B50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true); dv.setUint16(10, st.time, true); dv.setUint16(12, st.date, true);
      dv.setUint32(14, crc, true); dv.setUint32(18, size, true); dv.setUint32(22, size, true);
      dv.setUint16(26, name.length, true); dv.setUint16(28, 0, true);
      lh.set(name, 30);
      parts.push(lh, f.data);
      var cd = new Uint8Array(46 + name.length), dv2 = new DataView(cd.buffer);
      dv2.setUint32(0, 0x02014B50, true); dv2.setUint16(4, 20, true); dv2.setUint16(6, 20, true);
      dv2.setUint16(8, 0x0800, true); dv2.setUint16(10, 0, true); dv2.setUint16(12, st.time, true);
      dv2.setUint16(14, st.date, true); dv2.setUint32(16, crc, true); dv2.setUint32(20, size, true);
      dv2.setUint32(24, size, true); dv2.setUint16(28, name.length, true);
      dv2.setUint32(42, offset, true);
      cd.set(name, 46);
      central.push(cd);
      offset += lh.length + size;
    });
    var cdSize = central.reduce(function (n, c) { return n + c.length; }, 0);
    var end = new Uint8Array(22), dv3 = new DataView(end.buffer);
    dv3.setUint32(0, 0x06054B50, true);
    dv3.setUint16(8, files.length, true); dv3.setUint16(10, files.length, true);
    dv3.setUint32(12, cdSize, true); dv3.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [end]), { type: "application/zip" });
  }

  els.zipBtn.addEventListener("click", async function () {
    var ids = selectionIds();
    if (!ids.length) return;
    var c = currentChar();
    els.zipBtn.disabled = true;
    els.zipBtn.textContent = "묶는 중…";
    try {
      var files = [];
      for (var i = 0; i < ids.length; i++) {
        var it = itemById(c, ids[i]);
        if (!it) continue;
        var r = await fetch(it.file);
        var buf = new Uint8Array(await r.arrayBuffer());
        files.push({ name: String(i + 1).padStart(2, "0") + "_" + safeFileName(it.title) + ".png", data: buf });
      }
      var blob = buildZip(files);
      downloadBlob(blob, c.id + "_" + files.length + "cut.zip");
      toast(files.length + "컷을 ZIP으로 저장했습니다");
    } catch (e) {
      toast("ZIP을 만들지 못했습니다");
    }
    els.zipBtn.disabled = false;
    els.zipBtn.textContent = "ZIP 저장";
  });

  /* ---------------- 키보드 ---------------- */
  document.addEventListener("keydown", function (e) {
    if (state.screen !== "studio") return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(state.zoom + 0.25); }
    else if (e.key === "-" || e.key === "_") { e.preventDefault(); setZoom(state.zoom - 0.25); }
    else if (e.key === "0") { e.preventDefault(); resetZoom(); }
    else if (e.key === "f" || e.key === "F") { setView("fit"); }
    else if (e.key === "g" || e.key === "G") { setView("face"); }
    else if (e.key === "Escape") { closeModal(); goHome(); }
  });

  /* ---------------- 정보 모달 ---------------- */
  function aboutNode() {
    var wrap = document.createElement("div");
    var c = state.screen === "studio" ? currentChar() : null;
    var intro = el("p", null, c
      ? c.name + " — " + c.bio
      : "최애 1명 + 서브 3명, 4개 작품 " + DATA.meta.total + "컷을 모은 개인 표정 아카이브입니다. 각 작품의 공개 팬/위키 아카이브에서 실제 파일을 받아 정리했고, 원본 권리는 모두 원저작자에게 있습니다.");
    wrap.appendChild(intro);
    var list = c ? [c] : DATA.characters;
    list.forEach(function (ch) {
      wrap.appendChild(el("h4", null, ch.name + " · " + workOf(ch).name + " · " + ch.items.length + "컷"));
      (ch.sources || []).forEach(function (s) {
        var p = el("p");
        var a = el("a", null, s.label);
        a.href = s.url; a.target = "_blank"; a.rel = "noopener noreferrer";
        p.appendChild(a);
        wrap.appendChild(p);
      });
      if (ch.credit) wrap.appendChild(el("p", null, "© " + ch.credit.replace(/^©\s*/, "")));
    });
    var p = el("p", null, "내려받은 이미지는 개인 감상·정리용입니다. 재배포·상업적 이용은 각 작품의 이용 약관을 확인하세요.");
    p.style.marginTop = "10px";
    wrap.appendChild(p);
    return wrap;
  }
  $("aboutBtn").addEventListener("click", function () { openModal("출처와 이용 안내", [aboutNode()]); });
  $("studioAbout").addEventListener("click", function () { openModal(currentChar().name + " 출처", [aboutNode()]); });

  $("brandHome").addEventListener("click", function (e) { e.preventDefault(); goHome(); });
  $("backBtn").addEventListener("click", function () { goHome(); });

  /* ---------------- 시작 ---------------- */
  renderHero();
  restartHero();
  renderTabs();
  renderRoster();
  els.stage.setAttribute("data-bg", state.bg);
  els.stage.setAttribute("data-view", state.view);
  applyTransform();

  (function boot() {
    var r = parseHash();
    if (r.screen === "studio" && charById(r.charId)) {
      state.charId = r.charId;
      if (r.itemId && itemById(charById(r.charId), r.itemId)) state.itemId = r.itemId;
      showStudio();
    } else {
      showHome();
    }
  })();
})();
