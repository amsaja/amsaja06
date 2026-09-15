
const $ = (id) => document.getElementById(id);

const DATA_FILES = {
  profile: "data/profile.json",
  news: "data/news.json",
  selected: "data/selected.json",
  works: "data/works.json",
  awards: "data/awards.json",
  translations: "data/translations.json",
  blurbs: "data/blurbs.json",
  columns: "data/columns.json",
  talks: "data/talks.json",
  places: "data/places.json",
  press: "data/press.json",
  meta: "data/meta.json"
};

async function loadJSON(path) {
  // GitHub Pages/CDN/browser caching can otherwise delay data-only updates.
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} 불러오기 실패: ${response.status}`);
  return response.json();
}

function external(url, text) {
  return url
    ? `<a href="${url}" target="_blank" rel="noopener">${text}</a>`
    : text;
}

function row({year="", title="", sub="", right="", url=""}) {
  return `<div class="row ${url ? "linked" : ""}">
    <span class="year">${year}</span>
    <span class="main">
      <span class="title">${external(url, title)}</span>
      ${sub ? `<span class="sub">${sub}</span>` : ""}
    </span>
    <span class="right">${right || (url ? "보기 ↗" : "")}</span>
  </div>`;
}

async function renderSite() {
  try {
    const [
      profile,
      news,
      selected,
      works,
      awards,
      translations,
      blurbs,
      columns,
      talks,
      places,
      press,
      meta
    ] = await Promise.all([
      loadJSON(DATA_FILES.profile),
      loadJSON(DATA_FILES.news),
      loadJSON(DATA_FILES.selected),
      loadJSON(DATA_FILES.works),
      loadJSON(DATA_FILES.awards),
      loadJSON(DATA_FILES.translations),
      loadJSON(DATA_FILES.blurbs),
      loadJSON(DATA_FILES.columns),
      loadJSON(DATA_FILES.talks),
      loadJSON(DATA_FILES.places),
      loadJSON(DATA_FILES.press),
      loadJSON(DATA_FILES.meta)
    ]);

    // 소개
    $("name").textContent = profile.name_ko;
    $("roles").textContent = profile.roles;
    $("summary").textContent = profile.summary || "";
    $("summary").hidden = !profile.summary;
    $("focus").textContent = profile.focus;
    $("location").textContent = profile.location;
    $("email").textContent = profile.email;
    $("instagram").href = profile.instagram;
    $("blog").href = profile.blog;
    $("social-instagram").href = profile.instagram;
    $("social-blog").href = profile.blog;

    // 최근 소식
    $("news-list").innerHTML = news.map(x => `
      <article class="news-item">
        <time datetime="${x.date.replaceAll(".", "-")}">${x.date}</time>
        <span class="news-category">${x.category || ""}</span>
        <span class="news-copy">
          <strong>${external(x.url, x.title)}</strong>
          ${x.detail ? `<small>${x.detail}</small>` : ""}
        </span>
      </article>`).join("");

    // 필진 및 활동
    $("selected-list").innerHTML = selected
      .filter(x => x.type === "필진" || x.type === "연재" || x.type === "활동" || x.type === "칼럼")
      .map(x => row({
      year:x.year,
      title:x.title,
      sub:x.detail || "",
      right:x.type || ""
    })).join("");

    // 대표작
    const featured = (works.books || [])[0];
    if (featured) {
      $("featured-title").textContent = `『${featured.title}』`;
      $("featured-meta").textContent = [featured.year, featured.publisher].filter(Boolean).join(" · ");
      $("featured-link").href = featured.url;
    }

    // 단행본
    $("books").innerHTML = (works.books || []).map(x => row({
      year:x.year,
      title:x.title,
      sub:x.publisher,
      right:x.type,
      url:x.url
    })).join("");

    // 해외 번역판
    $("translations-list").innerHTML = translations.map(x => row({
      year:x.year,
      title:x.title,
      sub:[`원작 『${x.original_title}』`, x.language, x.publisher].filter(Boolean).join(" · "),
      right:x.status,
      url:x.url || ""
    })).join("");

    // 단편소설
    $("short-fiction").innerHTML = (works.short_fiction || []).map(x => row({
      year:x.year,
      title:`「${x.title}」`,
      sub:x.publication,
      right:x.status || (x.url ? "보기 ↗" : ""),
      url:x.url
    })).join("");

    // 수상 및 선정
    const achievementGroups = [
      { key:"author", label:"작가의 수상·선정" },
      { key:"book", label:"책의 기록" }
    ];
    $("awards-list").innerHTML = achievementGroups.map(group => {
      const items = awards.filter(x => (x.scope || "author") === group.key);
      return `<div class="achievement-group">
        <h3>${group.label}</h3>
        <div class="rows">${items.map(x => row({
          year:x.year,
          title:x.title,
          right:x.result
        })).join("")}</div>
      </div>`;
    }).join("");

    // 추천사
    $("blurbs-list").innerHTML = blurbs.map(x => row({
      year:x.year,
      title:`『${x.title}』`,
      sub:[x.author, x.publisher].filter(Boolean).join(" · "),
      right:x.role || "추천사",
      url:x.url
    })).join("");

    // 칼럼
    $("columns-list").innerHTML = columns.map(x => row({
      year:x.date.slice(0,4),
      title:x.title,
      sub:x.publication,
      right:"읽기 ↗",
      url:x.url
    })).join("");

    // 강연 활동 지도
    const mapTalks = talks.flatMap(group =>
      (group.items || []).map(item => ({ ...item, groupLabel:group.label }))
    );
    const venues = places.map(place => ({
      ...place,
      talks:mapTalks.filter(item => item.place === place.name)
    })).filter(place => place.talks.length);

    const boundary = [
      [128.349716,38.612243],[129.21292,37.432392],[129.46045,36.784189],
      [129.468304,35.632141],[129.091377,35.082484],[128.18585,34.890377],
      [127.386519,34.475674],[126.485748,34.390046],[126.37392,34.93456],
      [126.559231,35.684541],[126.117398,36.725485],[126.860143,36.893924],
      [126.174759,37.749686],[126.237339,37.840378],[126.68372,37.804773],
      [127.073309,38.256115],[127.780035,38.304536],[128.205746,38.370397]
    ];
    const bounds = { minLon:125.95, maxLon:129.65, minLat:33.0, maxLat:38.85 };
    const project = (lon,lat) => ({
      x:110 + ((lon-bounds.minLon)/(bounds.maxLon-bounds.minLon))*300,
      y:35 + ((bounds.maxLat-lat)/(bounds.maxLat-bounds.minLat))*515
    });
    const outline = boundary.map(([lon,lat],index) => {
      const p=project(lon,lat);
      return `${index ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ")+" Z";

    $("talk-map").innerHTML = `
      <div class="map-stage">
        <svg viewBox="0 0 520 620" role="img" aria-labelledby="talk-map-title">
          <title id="talk-map-title">김슬기 작가의 전국 강연 장소 지도</title>
          <path class="korea-shape" d="${outline}"/>
          <ellipse class="korea-shape jeju" cx="250" cy="582" rx="39" ry="13"/>
          ${venues.map((venue,index) => {
            const anchor=project(venue.lon,venue.lat);
            const markerX=anchor.x+venue.dx;
            const markerY=anchor.y+venue.dy;
            const labelAnchor=venue.dx < 0 ? "end" : "start";
            const labelX=markerX+(venue.dx < 0 ? -17 : 17);
            return `<g class="venue-pin" data-venue-index="${index}" role="button" tabindex="0" aria-label="${index+1}. ${venue.name} 강연 정보 보기">
              <line class="pin-leader" x1="${anchor.x}" y1="${anchor.y}" x2="${markerX}" y2="${markerY}"/>
              <circle class="pin-anchor" cx="${anchor.x}" cy="${anchor.y}" r="2.5"/>
              <circle class="pin-hit" cx="${markerX}" cy="${markerY}" r="20"/>
              <circle class="pin-marker" cx="${markerX}" cy="${markerY}" r="11"/>
              <text class="pin-number" x="${markerX}" y="${markerY+4}" text-anchor="middle">${index+1}</text>
              <text class="venue-label" x="${labelX}" y="${markerY+4}" text-anchor="${labelAnchor}">${venue.short}</text>
            </g>`;
          }).join("")}
        </svg>
        <div id="map-popup" class="map-popup" hidden></div>
      </div>`;

    $("talk-map-legend").innerHTML = `
      <span class="venue-index-count"><strong>${venues.length}곳</strong>의 오프라인 강연 장소</span>
      <div class="venue-index">
        ${venues.map((venue,index) => `<button type="button" data-venue-index="${index}">
          <em>${index+1}</em><span>${venue.short}</span>
        </button>`).join("")}
      </div>`;

    function openVenue(index){
      const venue=venues[index];
      const popup=$("map-popup");
      popup.innerHTML=`
        <button type="button" class="map-popup-close" aria-label="닫기">×</button>
        <span class="map-popup-city">${venue.city}</span>
        <strong>${venue.name}</strong>
        <ul>${venue.talks.map(talk => `<li>${talk.title}${talk.detail ? ` <small>· ${talk.detail}</small>` : ""}</li>`).join("")}</ul>`;
      popup.hidden=false;
      document.querySelectorAll(".venue-pin").forEach((pin,i) =>
        pin.classList.toggle("active",i===Number(index))
      );
      document.querySelectorAll(".venue-index button").forEach((button,i) =>
        button.classList.toggle("active",i===Number(index))
      );
      popup.querySelector(".map-popup-close").addEventListener("click",() => {
        popup.hidden=true;
        document.querySelectorAll(".venue-pin,.venue-index button").forEach(item=>item.classList.remove("active"));
      });
      if (window.matchMedia("(max-width: 760px)").matches) {
        popup.scrollIntoView({ behavior:"smooth", block:"nearest" });
      }
    }
    document.querySelector(".talk-map-block").addEventListener("click",event => {
      const target=event.target.closest("[data-venue-index]");
      if(target) openVenue(target.dataset.venueIndex);
    });
    $("talk-map").addEventListener("keydown",event => {
      const pin=event.target.closest(".venue-pin");
      if(pin && (event.key==="Enter" || event.key===" ")){
        event.preventDefault();
        openVenue(pin.dataset.venueIndex);
      }
    });

    // 강연과 수업
    $("talks-list").innerHTML = talks.map(group => `
      <div class="talk-group">
        <h3>${group.label}</h3>
        <div class="talk-list">
          ${(group.items || []).map(x => `<div class="talk-item">
            <span class="talk-place">${x.year ? `<em class="talk-year">${x.year}</em>` : ""}${x.place}</span>
            <span class="talk-title">${x.title}</span>
            <span class="talk-detail">${x.detail || ""}</span>
          </div>`).join("")}
        </div>
      </div>`).join("");

    // 기사와 인터뷰
    $("press-list").innerHTML = press.map(x => row({
      year:x.date.slice(0,4),
      title:x.title,
      sub:`${x.source} · ${x.type}`,
      right:"읽기 ↗",
      url:x.url
    })).join("");

    // 통합 아카이브
    const archiveItems = [
      ...(works.books || []).map(x => ({
        category:"작품", date:x.year, title:`『${x.title}』`,
        detail:[x.type, x.publisher].filter(Boolean).join(" · "), url:x.url || ""
      })),
      ...(works.short_fiction || []).map(x => ({
        category:"작품", date:x.year, title:`「${x.title}」`,
        detail:x.publication || x.status || "", url:x.url || ""
      })),
      ...columns.map(x => ({
        category:"칼럼", date:x.date, title:x.title,
        detail:x.publication || "", url:x.url || ""
      })),
      ...talks.flatMap(group => (group.items || []).map(x => ({
        category:"강연", date:x.year || "",
        title:`${x.place} · ${x.title}`,
        detail:x.detail || group.label, url:""
      }))),
      ...press.map(x => ({
        category:"기사·인터뷰", date:x.date, title:x.title,
        detail:[x.source, x.type].filter(Boolean).join(" · "), url:x.url || ""
      })),
      ...awards.map(x => ({
        category:"수상·선정", date:x.year, title:x.title,
        detail:x.result || "", url:""
      })),
      ...translations.map(x => ({
        category:"번역", date:x.year, title:x.title,
        detail:[x.language, x.publisher, x.status].filter(Boolean).join(" · "), url:x.url || ""
      })),
      ...blurbs.map(x => ({
        category:"추천사", date:x.year, title:`『${x.title}』 추천사`,
        detail:[x.author, x.publisher].filter(Boolean).join(" · "), url:x.url || ""
      }))
    ].sort((a,b) => (b.date || "0000").localeCompare(a.date || "0000"));

    const categories = ["전체", ...new Set(archiveItems.map(x => x.category))];
    let activeCategory = "전체";

    function renderArchiveFilters() {
      $("archive-filters").innerHTML = categories.map(category =>
        `<button type="button" class="${category === activeCategory ? "active" : ""}" data-category="${category}" aria-pressed="${category === activeCategory}">${category}</button>`
      ).join("");
    }

    function renderArchive() {
      const query = $("archive-query").value.trim().toLocaleLowerCase("ko");
      const filtered = archiveItems.filter(x => {
        const categoryMatch = activeCategory === "전체" || x.category === activeCategory;
        const haystack = [x.date, x.category, x.title, x.detail].join(" ").toLocaleLowerCase("ko");
        return categoryMatch && (!query || haystack.includes(query));
      });
      $("archive-status").textContent = `${filtered.length}개의 기록`;
      $("archive-list").innerHTML = filtered.length ? filtered.map(x => `
        <article class="archive-item">
          <time>${x.date || "—"}</time>
          <span class="archive-category">${x.category}</span>
          <span class="archive-main">
            <strong>${external(x.url, x.title)}</strong>
            ${x.detail ? `<small>${x.detail}</small>` : ""}
          </span>
          <span class="archive-action">${x.url ? "원문 ↗" : ""}</span>
        </article>`).join("") : '<p class="archive-empty">조건에 맞는 기록이 없습니다.</p>';
    }

    renderArchiveFilters();
    renderArchive();
    $("archive-query").addEventListener("input", renderArchive);
    $("archive-filters").addEventListener("click", event => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      renderArchiveFilters();
      renderArchive();
    });

    $("updated").textContent = `마지막 업데이트 ${meta.updated}`;

  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "beforeend",
      '<p class="data-error">홈페이지 콘텐츠를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</p>'
    );
  }
}

renderSite();
