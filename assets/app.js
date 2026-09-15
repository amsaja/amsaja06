
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

    // 주요 활동
    $("selected-list").innerHTML = selected.map(x => row({
      year:x.year,
      title:x.title,
      sub:x.detail || "",
      right:x.type || ""
    })).join("");

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
      right:x.status
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
    $("awards-list").innerHTML = awards.map(x => row({
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
