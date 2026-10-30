
const $ = (id) => document.getElementById(id);

const DATA_FILES = {
  profile: "data/profile.json",
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

    // 필진 및 활동
    $("selected-list").innerHTML = selected
      .filter(x => x.type === "필진" || x.type === "연재" || x.type === "활동" || x.type === "칼럼")
      .map(x => row({
      year:x.year,
      title:x.title,
      sub:x.detail || "",
      right:x.type || ""
    })).join("");

    // 대표작: 책별 소개, 성과와 번역을 한곳에 연결
    const featuredBooks = (works.books || []).filter(x => x.featured);
    $("featured-list").innerHTML = featuredBooks.map((book, index) => {
      const records = awards.filter(x => x.work_title === book.title);
      const editions = translations.filter(x => x.original_title === book.title);
      return `<article class="featured-entry">
        <figure class="featured-cover">
          <img src="${book.cover}" alt="${book.type} ${book.title} 표지">
        </figure>
        <div class="featured-copy">
          <span class="eyebrow">Featured Work ${String(index + 1).padStart(2, "0")} · ${book.type}</span>
          <h3>『${book.title}』</h3>
          <p class="featured-meta">${[book.year, book.publisher].filter(Boolean).join(" · ")}</p>
          <p class="featured-note">${book.description || ""}</p>
          ${records.length ? `<div class="featured-records">
            <h4>이 책의 기록</h4>
            <ul>${records.map(record => `<li><time>${record.year}</time><span>${record.title.replace(/\\s*—\\s*『[^』]+』/, "")}</span><strong>${record.result}</strong></li>`).join("")}</ul>
          </div>` : ""}
          ${editions.length ? `<div class="featured-editions">
            <h4>해외 번역판</h4>
            <div class="featured-edition-grid">
              ${editions.map(edition => {
                const tag = edition.url ? "a" : "div";
                const linkAttrs = edition.url ? ` href="${edition.url}" target="_blank" rel="noopener"` : "";
                return `<${tag} class="featured-edition-card"${linkAttrs}>
                  <span class="featured-edition-cover"><img src="${edition.cover}" alt="${edition.language}판 『${edition.title}』 표지"></span>
                  <span class="featured-edition-info">
                    <strong>${edition.language}판</strong>
                    <span>${edition.title}</span>
                    <small>${[edition.publisher, edition.status].filter(Boolean).join(" · ")}</small>
                  </span>
                </${tag}>`;
              }).join("")}
            </div>
          </div>` : ""}
          <a class="featured-link" href="${book.url}" target="_blank" rel="noopener">책 정보 보기 ↗</a>
        </div>
      </article>`;
    }).join("");

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

    // 작가 개인의 수상 및 선정 (책의 성과는 각 Featured Work에 표시)
    $("awards-list").innerHTML = awards
      .filter(x => (x.scope || "author") === "author")
      .map(x => row({
        year:x.year,
        title:x.title,
        right:x.result
      })).join("");

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

    // 강연 활동 지도: 전국 지도 + 수도권 확대 지도
    const mapTalks = talks.flatMap(group =>
      (group.items || []).map(item => ({ ...item, groupLabel:group.label }))
    );
    const venues = places.map(place => ({
      ...place,
      talks:mapTalks.filter(item => item.place === place.name)
    })).filter(place => place.talks.length);
    const venueIndex = venue => venues.indexOf(venue);
    const venueNumber = venue => venueIndex(venue) + 1;
    const isMetro = venue =>
      venue.lat >= 37.18 && venue.lat <= 38.2 &&
      venue.lon >= 126.4 && venue.lon <= 127.35;
    const metroVenues = venues.filter(isMetro);
    const regionalVenues = venues.filter(venue => !isMetro(venue));

    const boundary = [
      [128.349716,38.612243],[129.21292,37.432392],[129.46045,36.784189],
      [129.468304,35.632141],[129.091377,35.082484],[128.18585,34.890377],
      [127.386519,34.475674],[126.485748,34.390046],[126.37392,34.93456],
      [126.559231,35.684541],[126.117398,36.725485],[126.860143,36.893924],
      [126.174759,37.749686],[126.237339,37.840378],[126.68372,37.804773],
      [127.073309,38.256115],[127.780035,38.304536],[128.205746,38.370397]
    ];
    const nationalBounds = { minLon:125.95, maxLon:129.65, minLat:33.0, maxLat:38.85 };
    const metroBounds = { minLon:126.48, maxLon:127.28, minLat:37.18, maxLat:38.02 };
    const projectNational = (lon,lat) => ({
      x:52 + ((lon-nationalBounds.minLon)/(nationalBounds.maxLon-nationalBounds.minLon))*210,
      y:24 + ((nationalBounds.maxLat-lat)/(nationalBounds.maxLat-nationalBounds.minLat))*350
    });
    const projectMetro = (lon,lat) => ({
      x:42 + ((lon-metroBounds.minLon)/(metroBounds.maxLon-metroBounds.minLon))*376,
      y:42 + ((metroBounds.maxLat-lat)/(metroBounds.maxLat-metroBounds.minLat))*276
    });
    const nationalOutline = boundary.map(([lon,lat],index) => {
      const p=projectNational(lon,lat);
      return `${index ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ")+" Z";
    const metroRiverPoints = [
      [126.62,37.59],[126.76,37.57],[126.90,37.55],[127.02,37.53],[127.18,37.55]
    ].map(([lon,lat],index) => {
      const p=projectMetro(lon,lat);
      return `${index ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

    const renderPin = (venue, projection, useOffset=false) => {
      const anchor=projection(venue.lon,venue.lat);
      const markerX=useOffset ? anchor.x + venue.dx * .31 : anchor.x;
      const markerY=useOffset ? anchor.y + venue.dy * .31 : anchor.y;
      const index=venueIndex(venue);
      return `<g class="venue-pin" data-venue-index="${index}" role="button" tabindex="0" aria-label="${venueNumber(venue)}. ${venue.name} 강연 정보 보기">
        ${useOffset ? `<line class="pin-leader" x1="${anchor.x}" y1="${anchor.y}" x2="${markerX}" y2="${markerY}"/><circle class="pin-anchor" cx="${anchor.x}" cy="${anchor.y}" r="2.4"/>` : ""}
        <circle class="pin-hit" cx="${markerX}" cy="${markerY}" r="20"/>
        <circle class="pin-marker" cx="${markerX}" cy="${markerY}" r="12"/>
        <text class="pin-number" x="${markerX}" y="${markerY+4}" text-anchor="middle">${venueNumber(venue)}</text>
      </g>`;
    };

    const metroCenter=projectNational(126.98,37.55);
    $("talk-map").innerHTML = `
      <div class="map-stage map-stage-dual">
        <div class="map-panels">
          <section class="map-panel national-panel" aria-labelledby="national-map-label">
            <div class="map-panel-heading">
              <strong id="national-map-label">전국</strong>
              <span>${venues.length}곳</span>
            </div>
            <svg viewBox="0 0 310 410" role="img" aria-label="전국 강연 장소 지도">
              <path class="korea-shape" d="${nationalOutline}"/>
              <ellipse class="korea-shape jeju" cx="156" cy="394" rx="25" ry="8"/>
              ${regionalVenues.map(venue => renderPin(venue,projectNational)).join("")}
              <g class="metro-cluster" data-show-metro role="button" tabindex="0" aria-label="수도권 ${metroVenues.length}곳 확대 지도 보기">
                <circle cx="${metroCenter.x}" cy="${metroCenter.y}" r="22"/>
                <text x="${metroCenter.x}" y="${metroCenter.y+4}" text-anchor="middle">${metroVenues.length}</text>
                <text class="metro-cluster-label" x="${metroCenter.x}" y="${metroCenter.y+39}" text-anchor="middle">수도권</text>
              </g>
            </svg>
          </section>
          <section id="metro-map-panel" class="map-panel metro-panel" aria-labelledby="metro-map-label">
            <div class="map-panel-heading">
              <strong id="metro-map-label">수도권 확대</strong>
              <span>서울 · 인천 · 경기</span>
            </div>
            <svg viewBox="0 0 460 350" role="img" aria-label="수도권 강연 장소 확대 지도">
              <path class="metro-land" d="M20,36 L398,24 L438,86 L431,319 L34,326 L14,246 Z"/>
              <path class="metro-river" d="${metroRiverPoints}"/>
              <text class="metro-area-label" x="58" y="166">인천</text>
              <text class="metro-area-label" x="260" y="175">서울</text>
              <text class="metro-area-label" x="342" y="74">경기 북부</text>
              <text class="metro-area-label" x="318" y="310">경기 남부</text>
              ${metroVenues.map(venue => renderPin(venue,projectMetro,true)).join("")}
            </svg>
          </section>
        </div>
        <div id="map-popup" class="map-popup" hidden></div>
      </div>`;

    const renderVenueButtons = list => list.map(venue => {
      const index=venueIndex(venue);
      return `<button type="button" data-venue-index="${index}">
        <em>${index+1}</em><span>${venue.short}</span>
      </button>`;
    }).join("");
    $("talk-map-legend").innerHTML = `
      <span class="venue-index-count"><strong>${venues.length}곳</strong>의 오프라인 강연 장소</span>
      <div class="venue-index-groups">
        <div class="venue-index-group">
          <h4>수도권 <span>${metroVenues.length}</span></h4>
          <div class="venue-index">${renderVenueButtons(metroVenues)}</div>
        </div>
        <div class="venue-index-group">
          <h4>그 밖의 지역 <span>${regionalVenues.length}</span></h4>
          <div class="venue-index">${renderVenueButtons(regionalVenues)}</div>
        </div>
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
      document.querySelectorAll(".venue-pin").forEach(pin =>
        pin.classList.toggle("active",Number(pin.dataset.venueIndex)===Number(index))
      );
      document.querySelectorAll(".venue-index button").forEach(button =>
        button.classList.toggle("active",Number(button.dataset.venueIndex)===Number(index))
      );
      popup.querySelector(".map-popup-close").addEventListener("click",() => {
        popup.hidden=true;
        document.querySelectorAll(".venue-pin,.venue-index button").forEach(item=>item.classList.remove("active"));
      });
      if (window.matchMedia("(max-width: 760px)").matches) {
        popup.scrollIntoView({ behavior:"smooth", block:"nearest" });
      }
    }
    function showMetroPanel(){
      const panel=$("metro-map-panel");
      panel.classList.remove("map-panel-pulse");
      void panel.offsetWidth;
      panel.classList.add("map-panel-pulse");
      if(window.matchMedia("(max-width: 760px)").matches){
        panel.scrollIntoView({behavior:"smooth",block:"nearest"});
      }
    }
    document.querySelector(".talk-map-block").addEventListener("click",event => {
      const target=event.target.closest("[data-venue-index]");
      if(target) openVenue(target.dataset.venueIndex);
      if(event.target.closest("[data-show-metro]")) showMetroPanel();
    });
    $("talk-map").addEventListener("keydown",event => {
      const pin=event.target.closest(".venue-pin");
      if(pin && (event.key==="Enter" || event.key===" ")){
        event.preventDefault();
        openVenue(pin.dataset.venueIndex);
      }
      const cluster=event.target.closest("[data-show-metro]");
      if(cluster && (event.key==="Enter" || event.key===" ")){
        event.preventDefault();
        showMetroPanel();
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


(function initFloatingGuide(){
  const toggle=document.getElementById("guide-toggle");
  const menu=document.getElementById("guide-menu");
  const close=document.getElementById("guide-close");
  const tip=document.getElementById("guide-tip");
  if(!toggle||!menu) return;

  function setOpen(open){
    menu.hidden=!open;
    toggle.setAttribute("aria-expanded",String(open));
    toggle.setAttribute("aria-label",open?"빠른 이동 메뉴 닫기":"빠른 이동 메뉴 열기");
    if(open){
      tip.classList.add("is-hidden");
      const first=menu.querySelector("a");
      if(first) window.setTimeout(function(){first.focus();},0);
    }
  }

  toggle.addEventListener("click",function(){setOpen(menu.hidden);});
  close.addEventListener("click",function(){setOpen(false);toggle.focus();});
  menu.addEventListener("click",function(event){
    if(event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click",function(event){
    if(!menu.hidden&&!event.target.closest(".floating-guide")) setOpen(false);
  });
  document.addEventListener("keydown",function(event){
    if(event.key==="Escape"&&!menu.hidden){setOpen(false);toggle.focus();}
  });

  try{
    if(localStorage.getItem("kim-seulgi-guide-seen")){
      tip.hidden=true;
    }else{
      localStorage.setItem("kim-seulgi-guide-seen","1");
      window.setTimeout(function(){tip.classList.add("is-hidden");},4200);
      window.setTimeout(function(){tip.hidden=true;},4600);
    }
  }catch(error){
    window.setTimeout(function(){tip.hidden=true;},4200);
  }

  const links=Array.from(menu.querySelectorAll("a[href^='#']"));
  const sections=links.map(function(link){return document.querySelector(link.getAttribute("href"));}).filter(Boolean);
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(function(entries){
      const visible=entries.filter(function(entry){return entry.isIntersecting;})
        .sort(function(a,b){return b.intersectionRatio-a.intersectionRatio;})[0];
      if(!visible) return;
      links.forEach(function(link){
        link.classList.toggle("active",link.getAttribute("href")==="#"+visible.target.id);
      });
    },{rootMargin:"-25% 0px -60% 0px",threshold:[0,.1,.3]});
    sections.forEach(function(section){observer.observe(section);});
  }
})();
