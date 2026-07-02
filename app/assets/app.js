/* RCH guideline navigation - vanilla JS, no framework.
   Single fetch of app_data.json on load. Hash routing.

   Routes:
     #/                        home (category tiles)
     #/cat/:id                 list of guidelines for category :id
     #/search                  search results (query in input)

   Search matches both guideline titles and synonyms (the (see >> X) entries
   from the RCH index). Tapping a guideline opens the live RCH URL in a new tab. */

(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // ----- state -----
  /** @type {{categories: Array<{id:string,label:string,colour:string,icon:string,count:number}>,
   *          guidelines: Array<{title:string,url:string,categories:string[],synonyms:string[],is_pic:boolean}>}} */
  let DATA = null;
  let CAT_BY_ID = {};
  let NETS_WT = null; // populated by fetch of nets_weight_table.json
  let RESOURCES = null; // populated by fetch of resources.json
  let searchInput = null;

  // ----- calculators registry ------
  // Lives outside the guideline index. Each entry knows how to render itself.
  const CALCULATORS = [
    {
      id: "paed-drugs",
      title: "Paediatric Drugs & Equipment",
      sub: "Opens NETS Clinical Calculator (live source) with the weight + age you enter",
      render: renderPaedDrugsCalc,
    },
  ];
  const CALC_BY_ID = Object.fromEntries(CALCULATORS.map(c => [c.id, c]));

  // ----- icons -----
  function iconSVG(name) {
    return (window.ICONS && window.ICONS[name]) ||
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/></svg>`;
  }

  // ----- escape helpers -----
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function highlight(text, tokens) {
    if (!tokens.length) return esc(text);
    let safe = esc(text);
    tokens.forEach(tok => {
      if (!tok) return;
      const re = new RegExp("(" + tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      safe = safe.replace(re, "<em>$1</em>");
    });
    return safe;
  }

  // ----- search -----
  function tokenise(q) {
    return (q || "").toLowerCase().split(/\s+/).filter(t => t.length >= 2);
  }
  function scoreGuideline(g, tokens) {
    if (!tokens.length) return 0;
    const titleL = g.title.toLowerCase();
    const synL = g.synonyms.map(s => s.toLowerCase());
    let score = 0;
    let matchedSyn = null;
    for (const tok of tokens) {
      let hit = false;
      if (titleL.includes(tok)) {
        score += titleL.startsWith(tok) ? 5 : 3;
        hit = true;
      }
      for (let i = 0; i < synL.length; i++) {
        if (synL[i].includes(tok)) {
          score += 2;
          hit = true;
          if (!matchedSyn) matchedSyn = g.synonyms[i];
        }
      }
      if (!hit) return -1; // every token must hit somewhere
    }
    return score + (matchedSyn ? 0 : 0.5); // ties: prefer title-only matches slightly
  }
  function runSearch(q) {
    const tokens = tokenise(q);
    if (!tokens.length) return [];
    const out = [];
    for (const g of DATA.guidelines) {
      const sc = scoreGuideline(g, tokens);
      if (sc > 0) out.push({ g, sc });
    }
    out.sort((a, b) => b.sc - a.sc || a.g.title.localeCompare(b.g.title));
    return out.slice(0, 150).map(o => o.g);
  }

  // ----- renderers -----
  function renderHome() {
    const populations = (DATA.populations && DATA.populations.length)
      ? DATA.populations
      : [{ id: "child", label: "Child", subtitle: "", default_expanded: true }];

    // Group categories by their population field. Categories with no
    // population (legacy data) fall back to "child".
    const byPop = new Map();
    for (const c of DATA.categories) {
      const pop = c.population || "child";
      if (!byPop.has(pop)) byPop.set(pop, []);
      byPop.get(pop).push(c);
    }

    // Group resources (adult-focused quick links, formerly the sidebar) by
    // their population. Only resources with an explicit `population` field
    // and a `tile` block get rendered as a home-screen tile.
    const resByPop = new Map();
    const allResources = (RESOURCES && RESOURCES.resources) || [];
    for (const r of allResources) {
      if (!r.population || !r.tile) continue;
      if (!resByPop.has(r.population)) resByPop.set(r.population, []);
      resByPop.get(r.population).push(r);
    }

    return populations.map(pop => {
      const cats = byPop.get(pop.id) || [];
      const resources = (resByPop.get(pop.id) || [])
        .slice()
        .sort((a, b) => (a.tile.order || 999) - (b.tile.order || 999));
      if (!cats.length && !resources.length) return "";
      const tileCount = cats.length + resources.length;
      const guidelineCount = cats.reduce((sum, c) => sum + (c.count || 0), 0);

      // Expanded state persists per-population in localStorage; defaults to
      // pop.default_expanded (both open on first visit).
      let expanded = pop.default_expanded !== false;
      try {
        const stored = localStorage.getItem(`rch-app:pop-expanded:${pop.id}`);
        if (stored === "0") expanded = false;
        else if (stored === "1") expanded = true;
      } catch (e) {}

      const catTiles = cats.map(c => `
        <a class="tile" href="#/cat/${esc(c.id)}" style="--tile-accent: ${esc(c.colour)};">
          <span class="tile__icon" aria-hidden="true">${iconSVG(c.icon)}</span>
          <span class="tile__label">${esc(c.label)}</span>
          <span class="tile__count">${c.count} guideline${c.count === 1 ? "" : "s"}</span>
        </a>
      `).join("");

      const resourceTiles = resources.map(r => {
        const t = r.tile;
        const isInternal = r.type === "in-app";
        const href = isInternal ? (r.internal_route || "#/") : (r.url || "#");
        const attrs = isInternal ? "" : ` target="_blank" rel="noopener noreferrer"`;
        const label = t.label || r.title;
        const sub = t.subtitle || r.subtitle || (r.source || "");
        return `
          <a class="tile tile--resource" href="${esc(href)}"${attrs}
             style="--tile-accent: ${esc(t.colour || "#5b6b7c")};">
            <span class="tile__icon" aria-hidden="true">${iconSVG(t.icon || r.icon || "document")}</span>
            <span class="tile__label">${esc(label)}</span>
            <span class="tile__count tile__count--sub">${esc(sub)}</span>
          </a>
        `;
      }).join("");
      const tiles = catTiles + resourceTiles;

      return `
        <section class="pop-section${expanded ? " is-open" : ""}" data-pop="${esc(pop.id)}">
          <button type="button" class="pop-header" aria-expanded="${expanded}" data-pop-toggle="${esc(pop.id)}">
            <span class="pop-header__body">
              <span class="pop-header__label">${esc(pop.label)}</span>
              ${pop.subtitle ? `<span class="pop-header__sub">${esc(pop.subtitle)}</span>` : ""}
            </span>
            <span class="pop-header__meta">
              <span class="pop-header__count">${tileCount} ${tileCount === 1 ? "tile" : "tiles"}${guidelineCount ? " · " + guidelineCount + " guidelines" : ""}</span>
              <svg class="pop-header__chev" viewBox="0 0 24 24" width="18" height="18" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </span>
          </button>
          <div class="pop-section__body">
            <div class="tile-grid">${tiles}</div>
          </div>
        </section>`;
    }).join("");
  }

  function bindHome() {
    document.querySelectorAll("[data-pop-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pop = btn.getAttribute("data-pop-toggle");
        const section = btn.closest(".pop-section");
        const open = !section.classList.contains("is-open");
        section.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        try { localStorage.setItem(`rch-app:pop-expanded:${pop}`, open ? "1" : "0"); } catch (e) {}
      });
    });
  }

  function renderCategory(catId) {
    const cat = CAT_BY_ID[catId];
    if (!cat) return `<p class="empty-state">Unknown category.</p>`;
    const items = DATA.guidelines
      .filter(g => g.categories.includes(catId))
      .sort((a, b) => a.title.localeCompare(b.title));

    document.documentElement.style.setProperty("--cat-accent", cat.colour);

    // Surface any resources pinned to this category at the top of the list.
    const pinned = (RESOURCES && RESOURCES.resources) ? RESOURCES.resources.filter(r =>
      Array.isArray(r.pin_to_categories) && r.pin_to_categories.includes(catId)
    ) : [];

    return `
      <div class="cat-header" style="--cat-accent: ${esc(cat.colour)};">
        <span class="cat-header__icon" aria-hidden="true">${iconSVG(cat.icon)}</span>
        <div>
          <h2>${esc(cat.label)}</h2>
          <p class="cat-header__meta">${items.length} guideline${items.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      ${pinned.length ? renderPinnedStrip(pinned, cat.colour) : ""}
      <ul class="guideline-list">
        ${items.map(g => guidelineLi(g, cat.colour, [])).join("")}
      </ul>
    `;
  }

  function renderPinnedStrip(pinned, accent) {
    return `
      <p class="section-title pinned-title">Pinned references</p>
      <ul class="pinned-list">
        ${pinned.map(r => {
          const isInternal = r.type === "in-app";
          const href = isInternal ? esc(r.internal_route || "#/") : esc(r.url);
          const attrs = isInternal ? "" : ` target="_blank" rel="noopener noreferrer"`;
          const badge = r.type
            ? `<span class="type-badge" data-type="${esc(r.type.toLowerCase())}">${esc(r.type.toUpperCase())}</span>`
            : "";
          return `
            <li>
              <a class="pinned" href="${href}"${attrs} style="--cat-accent: ${esc(accent)};">
                <span class="pinned__icon" aria-hidden="true">${iconSVG(r.icon || "document")}</span>
                <span class="pinned__body">
                  <span class="pinned__title">${esc(r.title)} ${badge}</span>
                  ${r.subtitle ? `<span class="pinned__sub">${esc(r.subtitle)}</span>` : ""}
                </span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                     class="pinned__chev"><path d="M9 6l6 6-6 6"/></svg>
              </a>
            </li>`;
        }).join("")}
      </ul>
    `;
  }

  function renderSearch(q) {
    const tokens = tokenise(q);
    if (!tokens.length) {
      return `<p class="empty-state">Start typing a symptom, drug, or condition above.</p>`;
    }
    const results = runSearch(q);
    if (!results.length) {
      return `<p class="empty-state">No guidelines matched "<strong>${esc(q)}</strong>".</p>`;
    }
    return `
      <p class="search-results__count">${results.length} match${results.length === 1 ? "" : "es"} for "${esc(q)}"</p>
      <ul class="guideline-list">
        ${results.map(g => guidelineLi(g, accentFor(g), tokens)).join("")}
      </ul>
    `;
  }

  function accentFor(g) {
    const first = g.categories[0];
    return (CAT_BY_ID[first] && CAT_BY_ID[first].colour) || "var(--accent)";
  }

  function guidelineLi(g, accent, tokens) {
    const cats = g.categories
      .map(cid => CAT_BY_ID[cid] && CAT_BY_ID[cid].label)
      .filter(Boolean)
      .join(" · ");
    // If a synonym matched the search tokens, surface it under the title.
    let synLine = "";
    if (tokens.length) {
      const hit = g.synonyms.find(s =>
        tokens.every(t => s.toLowerCase().includes(t)) &&
        !tokens.every(t => g.title.toLowerCase().includes(t)));
      if (hit) {
        synLine = `<div class="guideline__synonym">also: ${highlight(hit, tokens)}</div>`;
      }
    }
    return `
      <li>
        <a class="guideline" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer"
           style="--cat-accent: ${esc(accent)};">
          <div class="guideline__body">
            <div class="guideline__title">${highlight(g.title, tokens)}</div>
            ${synLine}
            <div class="guideline__meta">
              <span class="guideline__cats">${esc(cats)}</span>
              ${g.is_pic ? `<span class="pic-badge" title="Paediatric Improvement Collaborative — state-wide endorsed">PIC</span>` : ""}
              ${g.is_pdf || g.source === "austin" ? `<span class="pic-badge pic-badge--pdf" title="Opens a PDF from ${esc(g.source === "austin" ? "Austin Health" : "publisher")}">PDF</span>` : ""}
            </div>
          </div>
          <svg class="guideline__chev" viewBox="0 0 24 24" width="18" height="18"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </a>
      </li>
    `;
  }

  // ----- routing -----
  function currentRoute() {
    const h = location.hash || "#/";
    if (h.startsWith("#/cat/")) return { name: "category", id: h.slice("#/cat/".length) };
    if (h.startsWith("#/search")) return { name: "search" };
    if (h.startsWith("#/calc/")) return { name: "calc", id: h.slice("#/calc/".length) };
    if (h.startsWith("#/calc")) return { name: "calc-index" };
    if (h.startsWith("#/resources/")) return { name: "resource", id: h.slice("#/resources/".length) };
    return { name: "home" };
  }

  function render() {
    const route = currentRoute();
    const main = $("#app");
    const back = $("#back-btn");
    const title = $("#header-title");

    if (route.name === "home") {
      back.style.visibility = "hidden";
      title.textContent = `Guidelines`;
      main.innerHTML = renderHome();
      bindHome();
    } else if (route.name === "category") {
      back.style.visibility = "visible";
      const cat = CAT_BY_ID[route.id];
      title.textContent = cat ? cat.label : "Category";
      main.innerHTML = renderCategory(route.id);
    } else if (route.name === "search") {
      back.style.visibility = "visible";
      title.textContent = "Search";
      main.innerHTML = renderSearch(searchInput.value);
    } else if (route.name === "calc-index") {
      back.style.visibility = "visible";
      title.textContent = "Calculators";
      main.innerHTML = renderCalcIndex();
    } else if (route.name === "calc") {
      back.style.visibility = "visible";
      const c = CALC_BY_ID[route.id];
      title.textContent = c ? c.title : "Calculator";
      main.innerHTML = renderCalcPage(route.id);
      if (c && c.bind) c.bind();
    } else if (route.name === "resource") {
      back.style.visibility = "visible";
      const page = RESOURCES && RESOURCES.in_app_pages && RESOURCES.in_app_pages[route.id];
      title.textContent = page ? page.title : "Resource";
      main.innerHTML = renderResourcePage(route.id);
      bindResourcePage(route.id);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // ============================================================
  // ===                    CALCULATORS                       ===
  // ============================================================
  // Calculator screens are visually distinct from guideline tiles (per the
  // build prompt Part 2.4). The Paed Drugs calc explicitly does NOT
  // calculate any dose locally - it deep-links to the live NETS calculator,
  // passing weight + age in the URL. We only show NETS's own age->weight
  // estimate (verbatim from the NETS lookup table) so the clinician can
  // sanity-check the entered weight before opening NETS.

  function renderCalcIndex() {
    const items = CALCULATORS.map(c => `
      <a class="calc-tile" href="#/calc/${esc(c.id)}">
        <span class="calc-tile__icon" aria-hidden="true">${iconSVG("tools")}</span>
        <span class="calc-tile__body">
          <span class="calc-tile__title">${esc(c.title)}</span>
          <span class="calc-tile__sub">${esc(c.sub)}</span>
        </span>
      </a>
    `).join("");
    return `
      <section class="calc-section">
        <p class="calc-section__heading">Calculators</p>
        <div style="display:flex; flex-direction:column; gap:10px;">${items}</div>
      </section>
      <p class="safety-note" style="margin-top:16px;">
        Calculators in this app are launchers for trusted external tools. We don't store, cache,
        or recalculate dose values ourselves. Always verify the result at the point of administration.
      </p>
    `;
  }

  function renderCalcPage(id) {
    const c = CALC_BY_ID[id];
    if (!c) return `<p class="empty-state">Unknown calculator.</p>`;
    return c.render();
  }

  // ----- Paed Drugs & Equipment (deep-link to NETS) -----

  function netsEstWtKg(unit, value) {
    if (!NETS_WT) return null;
    const v = Number(value);
    if (!Number.isFinite(v) || v < 0) return null;
    if (unit === "m") {
      if (v < 0 || v > 11) return null;
      return {
        c50: NETS_WT.by_month_under_1y.C50[String(v)],
        c10: NETS_WT.by_month_under_1y.C10[String(v)],
        c90: NETS_WT.by_month_under_1y.C90[String(v)],
      };
    }
    if (unit === "y") {
      if (v < 1) return null;
      const yKey = String(Math.min(16, Math.max(1, Math.floor(v))));
      return {
        c50: NETS_WT.by_year.C50[yKey],
        c10: NETS_WT.by_year.C10[yKey],
        c90: NETS_WT.by_year.C90[yKey],
      };
    }
    return null;
  }

  function netsUrlFor(wtKg, unit, value) {
    // NETS encodes Age as YYMM (4-digit zero-padded). Months are only used for <1y.
    let years = 0, months = 0;
    if (unit === "y") { years = Math.min(16, Math.max(1, Math.floor(Number(value)))); }
    else              { months = Math.min(11, Math.max(0, Math.floor(Number(value)))); }
    const age = String(years).padStart(2, "0") + String(months).padStart(2, "0");
    return `https://calculator.nets.org.au/PaedCalc.php?Wt=${encodeURIComponent(wtKg)}&Age=${age}`;
  }

  function renderPaedDrugsCalc() {
    const src = NETS_WT && NETS_WT.source;
    const sourceLine = src
      ? `Source: <a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.name)}</a> v${esc(src.version)} &middot; weight-for-age data: ${esc(src.dataset)}. Verified ${esc(src.fetched_on)}.`
      : "Source: NETS Clinical Calculator";

    return `
      <section class="calc-page">
        <p class="safety-note" style="margin: 0 0 14px;">
          This is a launcher for the live NETS calculator. Doses and equipment sizes
          are returned by NETS, never stored or recalculated in this app. Verify every
          result at the point of administration.
        </p>

        <form class="calc-form" id="paed-form" novalidate>
          <label>Age
            <div class="age-row">
              <select id="age-unit" aria-label="Age unit">
                <option value="y" selected>Years</option>
                <option value="m">Months (under 1 year)</option>
              </select>
              <input id="age-value" type="number" inputmode="numeric"
                     step="1" min="1" max="16" placeholder="e.g. 4" />
            </div>
          </label>

          <div class="est-wt" id="est-wt" hidden>
            <div class="est-wt__row">
              <span><strong id="est-wt-text">&nbsp;</strong></span>
              <button type="button" class="est-wt__use" id="est-wt-use">Use this weight</button>
            </div>
            <div class="est-wt__centiles" id="est-wt-centiles"></div>
          </div>

          <label>Weight (kg)
            <input id="wt-value" type="number" inputmode="decimal"
                   step="0.1" min="3" max="150" placeholder="e.g. 17" />
          </label>
          <p class="field-error" id="wt-error" hidden></p>

          <button type="submit" class="btn btn--primary" id="open-nets" disabled>
            Open NETS calculator
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M14 4h6v6"/><path d="M10 14L20 4"/>
              <path d="M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/>
            </svg>
          </button>
        </form>

        <p class="calc-page__attrib">
          ${sourceLine}<br>
          NETS opens in a new tab. RCH's own "Emergency medication and resuscitation resources"
          guideline links to the NETS Clinical Calculator as the recommended dose-and-equipment reference.
        </p>
      </section>
    `;
  }

  // ============================================================
  // ===           IN-APP RESOURCE PAGES (pathway grid)        ===
  // ============================================================
  // Data-driven: page content lives in app/data/resources.json under
  // `in_app_pages`. To add a new pathway page, add the resource (type "in-app")
  // and the matching id under in_app_pages. The renderer below is generic.

  function renderResourcePage(id) {
    const page = RESOURCES && RESOURCES.in_app_pages && RESOURCES.in_app_pages[id];
    if (!page) return `<p class="empty-state">Resource not found.</p>`;
    if (page.type === "checklist")    return renderChecklistPage(page);
    if (page.type === "pathway-grid") return renderPathwayGridPage(page);
    // Legacy pages without an explicit type default to pathway-grid.
    return renderPathwayGridPage(page);
  }

  function renderPathwayGridPage(page) {
    const classes = page.classes || [];
    const defaultClass = page.default_class || (classes[0] && classes[0].id);

    const tabs = classes.map(c =>
      `<button type="button" class="rx-tab" data-class="${esc(c.id)}"
         aria-pressed="${c.id === defaultClass ? "true" : "false"}">${esc(c.label)}</button>`
    ).join("");

    const panes = classes.map(c => {
      const examples = (c.examples || []).length
        ? `<p class="rx-pane__examples">${c.examples.map(esc).join(" &middot; ")}</p>` : "";
      const subtitle = c.subtitle ? `<p class="rx-pane__subtitle">${esc(c.subtitle)}</p>` : "";
      const stepHtml = (c.steps || []).map(s => {
        const tone = ["primary", "danger", "warn", "neutral"].includes(s.tone) ? s.tone : "neutral";
        const tag = s.tag ? `<span class="rx-step__tag rx-step__tag--${tone}">${esc(s.tag)}</span>` : "";
        const dose = s.dose ? `<div class="rx-step__dose">${esc(s.dose)}</div>` : "";
        const note = s.note ? `<div class="rx-step__note">${esc(s.note)}</div>` : "";
        return `
          <li class="rx-step rx-step--${tone}">
            ${tag}
            <div class="rx-step__body">
              <div class="rx-step__title">${esc(s.title)}</div>
              ${dose}
              ${note}
            </div>
          </li>`;
      }).join("");
      const after = c.after ? `<p class="rx-pane__after">${esc(c.after)}</p>` : "";
      const sourceLink = c.source_url
        ? `<a class="rx-pane__source" href="${esc(c.source_url)}" target="_blank" rel="noopener noreferrer">
             Source: ${esc(c.source_label || "REACH")} <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M10 14L20 4"/><path d="M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>
           </a>` : "";

      return `
        <section class="rx-pane" data-class="${esc(c.id)}" ${c.id === defaultClass ? "" : "hidden"}>
          ${subtitle}
          ${examples}
          <ol class="rx-steps">${stepHtml}</ol>
          ${after}
          ${sourceLink}
        </section>`;
    }).join("");

    const preList = (page.global_steps_before || []).map(group => `
      <details class="rx-prelude" open>
        <summary>${esc(group.title)}</summary>
        <ul>${(group.items || []).map(it => `<li>${esc(it)}</li>`).join("")}</ul>
      </details>
    `).join("");

    const sources = (page.sources || []).map(s =>
      `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`
    ).join("");

    return `
      <article class="rx-page">
        <header class="rx-page__head">
          <h2>${esc(page.title)}</h2>
          ${page.subtitle ? `<p class="rx-page__subtitle">${esc(page.subtitle)}</p>` : ""}
        </header>

        ${page.warning ? `
          <p class="rx-warning">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4M12 17h0.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <span>${esc(page.warning)}</span>
          </p>
        ` : ""}

        ${page.trigger ? `
          <div class="rx-trigger">
            <div class="rx-trigger__primary">${esc(page.trigger.primary)}</div>
            ${page.trigger.secondary ? `<div class="rx-trigger__secondary">${esc(page.trigger.secondary)}</div>` : ""}
          </div>
        ` : ""}

        ${preList}

        <div class="rx-tabs" role="tablist">${tabs}</div>
        <div class="rx-panes">${panes}</div>

        <footer class="rx-page__foot">
          ${sources ? `
            <div class="rx-page__sources">
              <span class="rx-page__sources-label">Sources (live)</span>
              <ul>${sources}</ul>
            </div>` : ""}
          ${page.verified_on ? `<p class="rx-page__verified">Pathway verified against the live source on ${esc(page.verified_on)}.</p>` : ""}
          ${page.footer_note ? `<p class="rx-page__footer-note">${esc(page.footer_note)}</p>` : ""}
        </footer>
      </article>
    `;
  }

  function bindResourcePage(id) {
    const page = RESOURCES && RESOURCES.in_app_pages && RESOURCES.in_app_pages[id];
    if (!page) return;
    if (page.type === "checklist") return bindChecklistPage(page);
    // pathway-grid (and legacy default)
    const tabs = $$(".rx-tab");
    const panes = $$(".rx-pane");
    tabs.forEach(t => {
      t.addEventListener("click", () => {
        const which = t.getAttribute("data-class");
        tabs.forEach(x => x.setAttribute("aria-pressed", x === t ? "true" : "false"));
        panes.forEach(p => { p.hidden = p.getAttribute("data-class") !== which; });
      });
    });
  }

  // ---------- checklist page (Alfred ICU intubation-style) ----------

  function flattenItems(items) {
    // Returns [{parentId, id}, ...] for progress counting.
    const flat = [];
    (items || []).forEach(it => {
      flat.push({ parentId: null, id: it.id });
      (it.sub || []).forEach(s => flat.push({ parentId: it.id, id: s.id }));
    });
    return flat;
  }

  function renderChecklistPage(page) {
    const quickRefs = (page.quick_ref || []).map(q =>
      `<span class="cl-quickref"><span class="cl-quickref__k">${esc(q.label)}</span><span class="cl-quickref__v">${esc(q.value)}</span></span>`
    ).join("");

    const sections = (page.sections || []).map(sec => {
      const items = (sec.items || []).map(it => {
        const subs = (it.sub || []).map(s => `
          <li class="cl-item cl-item--sub">
            <label>
              <input type="checkbox" data-section="${esc(sec.id)}" data-parent="${esc(it.id)}" data-id="${esc(s.id)}" />
              <span class="cl-checkbox" aria-hidden="true"></span>
              <span class="cl-item__text">${esc(s.text)}</span>
            </label>
          </li>`).join("");
        return `
          <li class="cl-item">
            <label>
              <input type="checkbox" data-section="${esc(sec.id)}" data-id="${esc(it.id)}" />
              <span class="cl-checkbox" aria-hidden="true"></span>
              <span class="cl-item__text">${esc(it.text)}</span>
            </label>
            ${subs ? `<ul class="cl-sublist">${subs}</ul>` : ""}
          </li>`;
      }).join("");
      const total = flattenItems(sec.items).length;
      const noteHtml = sec.note ? `<p class="cl-section__note">${esc(sec.note)}</p>` : "";
      return `
        <section class="cl-section" data-section="${esc(sec.id)}" style="--cl-accent: ${esc(sec.colour || "#5b6b7c")};">
          <header class="cl-section__head">
            <h3 class="cl-section__title">${esc(sec.label)}</h3>
            <span class="cl-section__count" data-count-for="${esc(sec.id)}">0 / ${total}</span>
          </header>
          <div class="cl-section__bar"><div class="cl-section__bar-fill" data-bar-for="${esc(sec.id)}" style="width:0%"></div></div>
          ${noteHtml}
          <ul class="cl-list">${items}</ul>
        </section>`;
    }).join("");

    const imageStrip = (page.images || []).length ? `
      <details class="cl-images">
        <summary>View original checklist card (Alfred) — tap image to expand</summary>
        <div class="cl-images__grid">
          ${page.images.map(img => `
            <button type="button" class="cl-image-thumb" data-full="${esc(img.url)}" data-label="${esc(img.label)}">
              <img loading="lazy" src="${esc(img.url)}" alt="${esc(img.label)}" />
              <span class="cl-image-thumb__label">${esc(img.label)}</span>
            </button>`).join("")}
        </div>
      </details>` : "";

    const attrib = page.attribution || {};
    const attributionHtml = `
      <div class="cl-attrib">
        <span class="cl-attrib__row"><strong>${esc(attrib.authors || "Source")}</strong></span>
        ${attrib.upstream ? `<span class="cl-attrib__row">${esc(attrib.upstream)}</span>` : ""}
        ${attrib.version  ? `<span class="cl-attrib__row">${esc(attrib.version)}</span>` : ""}
        ${attrib.licence  ? `<span class="cl-attrib__row cl-attrib__licence">${esc(attrib.licence)}</span>` : ""}
      </div>`;

    return `
      <article class="cl-page">
        <header class="cl-page__head">
          <h2>${esc(page.title)}</h2>
          ${page.subtitle ? `<p class="cl-page__subtitle">${esc(page.subtitle)}</p>` : ""}
        </header>

        ${page.warning ? `
          <p class="rx-warning cl-warning">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4M12 17h0.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <span>${esc(page.warning)}</span>
          </p>
        ` : ""}

        ${quickRefs ? `<div class="cl-quickrefs">${quickRefs}</div>` : ""}

        <div class="cl-toolbar">
          <div class="cl-progress" aria-live="polite">
            <span class="cl-progress__label">Overall</span>
            <div class="cl-progress__bar"><div id="cl-progress-fill" style="width:0%"></div></div>
            <span id="cl-progress-count" class="cl-progress__count">0 / 0</span>
          </div>
          <button type="button" class="cl-reset" id="cl-reset">Reset</button>
        </div>

        <div class="cl-sections">${sections}</div>

        ${imageStrip}

        ${page.source_url ? `
          <a class="rx-pane__source cl-source-link" href="${esc(page.source_url)}" target="_blank" rel="noopener noreferrer">
            Open source: ${esc(page.source_label || "original")}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M10 14L20 4"/><path d="M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>
          </a>
        ` : ""}

        <footer class="cl-page__foot">
          ${attributionHtml}
          ${page.verified_on ? `<p class="cl-page__verified">In-app version verified against source on ${esc(page.verified_on)}.</p>` : ""}
          ${page.footer_note ? `<p class="cl-page__footer-note">${esc(page.footer_note)}</p>` : ""}
        </footer>
      </article>

      <div id="cl-image-modal" class="cl-modal" hidden>
        <button type="button" class="cl-modal__close" id="cl-modal-close" aria-label="Close image">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <img id="cl-modal-img" src="" alt="" />
        <p id="cl-modal-caption" class="cl-modal__caption"></p>
      </div>
    `;
  }

  function bindChecklistPage(page) {
    // Per-section counts + overall progress + reset + image modal.
    // State persists in localStorage so a checklist survives page reloads and
    // navigation. Reset clears both the DOM and the stored state.
    const storageKey = `rch-checklist:${page.id || location.hash.replace("#/resources/", "")}`;

    function loadState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return {};
        const obj = JSON.parse(raw);
        return (obj && typeof obj === "object" && obj.checked) ? obj.checked : {};
      } catch (e) { return {}; }
    }
    function saveState(state) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          checked: state,
          updated_at: new Date().toISOString(),
        }));
      } catch (e) { /* private mode or quota — non-fatal */ }
    }

    // Apply stored checks to the DOM before wiring events.
    const initial = loadState();
    $$(".cl-list input[type=checkbox]").forEach(b => {
      if (initial[b.getAttribute("data-id")]) b.checked = true;
    });

    const totals = {};
    (page.sections || []).forEach(sec => { totals[sec.id] = flattenItems(sec.items).length; });
    const overallTotal = Object.values(totals).reduce((a, b) => a + b, 0);

    function currentState() {
      const state = {};
      $$(".cl-list input[type=checkbox]").forEach(b => {
        if (b.checked) state[b.getAttribute("data-id")] = true;
      });
      return state;
    }

    function refresh() {
      const boxes = $$(".cl-list input[type=checkbox]");
      const doneBySec = {};
      let overallDone = 0;
      boxes.forEach(b => {
        const s = b.getAttribute("data-section");
        if (b.checked) { doneBySec[s] = (doneBySec[s] || 0) + 1; overallDone++; }
      });
      Object.keys(totals).forEach(sid => {
        const done = doneBySec[sid] || 0;
        const total = totals[sid];
        const cnt = document.querySelector(`[data-count-for="${sid}"]`);
        if (cnt) cnt.textContent = `${done} / ${total}`;
        const bar = document.querySelector(`[data-bar-for="${sid}"]`);
        if (bar) bar.style.width = total ? `${Math.round(100 * done / total)}%` : "0%";
      });
      const pf = document.querySelector("#cl-progress-fill");
      const pc = document.querySelector("#cl-progress-count");
      if (pf) pf.style.width = overallTotal ? `${Math.round(100 * overallDone / overallTotal)}%` : "0%";
      if (pc) pc.textContent = `${overallDone} / ${overallTotal}`;
    }

    document.querySelector("#app").addEventListener("change", e => {
      if (e.target.matches(".cl-list input[type=checkbox]")) {
        refresh();
        saveState(currentState());
      }
    });

    document.querySelector("#cl-reset").addEventListener("click", () => {
      $$(".cl-list input[type=checkbox]").forEach(b => { b.checked = false; });
      refresh();
      try { localStorage.removeItem(storageKey); } catch (e) {}
    });

    // Image modal
    const modal = document.querySelector("#cl-image-modal");
    const mImg  = document.querySelector("#cl-modal-img");
    const mCap  = document.querySelector("#cl-modal-caption");
    document.querySelectorAll(".cl-image-thumb").forEach(btn => {
      btn.addEventListener("click", () => {
        mImg.src = btn.getAttribute("data-full");
        mImg.alt = btn.getAttribute("data-label") || "";
        mCap.textContent = btn.getAttribute("data-label") || "";
        modal.hidden = false;
        document.body.style.overflow = "hidden";
      });
    });
    function closeModal() {
      modal.hidden = true;
      mImg.src = "";
      document.body.style.overflow = "";
    }
    document.querySelector("#cl-modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    refresh();
  }

  CALC_BY_ID["paed-drugs"].bind = function bindPaedDrugs() {
    const ageUnit = $("#age-unit");
    const ageVal  = $("#age-value");
    const wtVal   = $("#wt-value");
    const estBox  = $("#est-wt");
    const estText = $("#est-wt-text");
    const estCent = $("#est-wt-centiles");
    const estUse  = $("#est-wt-use");
    const wtErr   = $("#wt-error");
    const openBtn = $("#open-nets");
    const form    = $("#paed-form");

    function refreshAgeBounds() {
      if (ageUnit.value === "m") {
        ageVal.min = 0; ageVal.max = 11; ageVal.placeholder = "0-11";
      } else {
        ageVal.min = 1; ageVal.max = 16; ageVal.placeholder = "1-16";
      }
    }

    function refreshEstimate() {
      const est = netsEstWtKg(ageUnit.value, ageVal.value);
      if (est && est.c50) {
        estText.textContent =
          `NETS 50th-centile weight for this age: ${est.c50} kg`;
        if (est.c10 && est.c90) {
          estCent.textContent =
            `Population range (10th-90th centile): ${est.c10}-${est.c90} kg`;
        } else {
          estCent.textContent = "";
        }
        estBox.hidden = false;
      } else {
        estBox.hidden = true;
      }
    }

    function refreshSubmitState() {
      const w = parseFloat(wtVal.value);
      const a = parseFloat(ageVal.value);
      let ok = true;
      let err = "";
      if (!Number.isFinite(w) || w < 3 || w > 150) {
        ok = false;
        if (wtVal.value) err = "Weight must be 3-150 kg (NETS paediatric range).";
      }
      if (!Number.isFinite(a)) ok = false;
      if (ageUnit.value === "m" && (a < 0 || a > 11)) ok = false;
      if (ageUnit.value === "y" && (a < 1 || a > 16)) ok = false;
      openBtn.disabled = !ok;
      wtErr.hidden = !err;
      wtErr.textContent = err;
    }

    ageUnit.addEventListener("change", () => {
      refreshAgeBounds();
      refreshEstimate();
      refreshSubmitState();
    });
    ageVal.addEventListener("input",  () => { refreshEstimate(); refreshSubmitState(); });
    wtVal.addEventListener("input",   refreshSubmitState);
    estUse.addEventListener("click",  () => {
      const est = netsEstWtKg(ageUnit.value, ageVal.value);
      if (est && est.c50) {
        wtVal.value = est.c50;
        refreshSubmitState();
        wtVal.focus();
      }
    });
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (openBtn.disabled) return;
      const url = netsUrlFor(wtVal.value, ageUnit.value, ageVal.value);
      window.open(url, "_blank", "noopener,noreferrer");
    });

    refreshAgeBounds();
  };

  // ----- search input wiring -----
  function bindSearch() {
    searchInput = $("#search-input");
    const wrap = $("#search-wrap");
    const clear = $("#search-clear");
    let timer = null;

    function update() {
      wrap.classList.toggle("search--has-value", !!searchInput.value);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (searchInput.value.trim()) {
          if (currentRoute().name !== "search") {
            history.pushState(null, "", "#/search");
          }
          render();
        } else if (currentRoute().name === "search") {
          history.back();
        }
      }, 100);
    }

    searchInput.addEventListener("input", update);
    clear.addEventListener("click", () => {
      searchInput.value = "";
      update();
      searchInput.focus();
    });
  }

  function bindNav() {
    $("#back-btn").addEventListener("click", () => {
      if (history.length > 1) history.back();
      else location.hash = "#/";
    });
    window.addEventListener("hashchange", render);
    window.addEventListener("popstate", render);
  }

  // ----- boot -----
  async function boot() {
    try {
      const [dataRes, wtRes, resRes] = await Promise.all([
        fetch("data/app_data.json", { cache: "no-cache" }),
        fetch("data/nets_weight_table.json", { cache: "no-cache" }),
        fetch("data/resources.json", { cache: "no-cache" }),
      ]);
      DATA = await dataRes.json();
      NETS_WT = await wtRes.json();
      RESOURCES = await resRes.json();
      CAT_BY_ID = Object.fromEntries(DATA.categories.map(c => [c.id, c]));
      bindSearch();
      bindNav();
      render();
    } catch (err) {
      $("#app").innerHTML = `<p class="empty-state">Could not load app data: ${esc(err.message)}</p>`;
      console.error(err);
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
