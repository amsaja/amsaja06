const $ = (id) => document.getElementById(id);

async function loadData(name) {
  const response = await fetch("data/" + name + ".json", { cache: "no-store" });
  if (!response.ok) throw new Error(name + " 데이터 불러오기 실패");
  return response.json();
}

function makeArchiveItems(works, columns, talks, press, awards, translations, blurbs) {
  const items = [
    ...(works.books || []).map(x => ({
      category: "작품", date: x.year, title: "『" + x.title + "』",
      detail: [x.type, x.publisher].filter(Boolean).join(" · "), url: x.url || ""
    })),
    ...(works.short_fiction || []).map(x => ({
      category: "작품", date: x.year, title: "「" + x.title + "」",
      detail: x.publication || x.status || "", url: x.url || ""
    })),
    ...columns.map(x => ({
      category: "칼럼", date: x.date, title: x.title,
      detail: x.publication || "", url: x.url || ""
    })),
    ...talks.flatMap(group => (group.items || []).map(x => ({
      category: "강연", date: x.year || "",
      title: x.place + " · " + x.title,
      detail: x.detail || group.label, url: ""
    }))),
    ...press.map(x => ({
      category: "기사·인터뷰", date: x.date, title: x.title,
      detail: [x.source, x.type].filter(Boolean).join(" · "), url: x.url || ""
    })),
    ...awards.map(x => ({
      category: "수상·선정", date: x.year, title: x.title,
      detail: x.result || "", url: ""
    })),
    ...translations.map(x => ({
      category: "번역", date: x.year, title: x.title,
      detail: [x.language, x.publisher, x.status].filter(Boolean).join(" · "),
      url: x.url || ""
    })),
    ...blurbs.map(x => ({
      category: "추천사", date: x.year, title: "『" + x.title + "』 추천사",
      detail: [x.author, x.publisher].filter(Boolean).join(" · "), url: x.url || ""
    }))
  ];
  return items.sort((a, b) => (b.date || "0000").localeCompare(a.date || "0000"));
}

function archiveRow(item) {
  const article = document.createElement("article");
  article.className = "archive-item";

  const time = document.createElement("time");
  time.textContent = item.date || "—";
  article.appendChild(time);

  const category = document.createElement("span");
  category.className = "archive-category";
  category.textContent = item.category;
  article.appendChild(category);

  const main = document.createElement("span");
  main.className = "archive-main";
  const strong = document.createElement("strong");
  if (item.url) {
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = item.title;
    strong.appendChild(link);
  } else {
    strong.textContent = item.title;
  }
  main.appendChild(strong);

  if (item.detail) {
    const detail = document.createElement("small");
    detail.textContent = item.detail;
    main.appendChild(detail);
  }
  article.appendChild(main);

  const action = document.createElement("span");
  action.className = "archive-action";
  action.textContent = item.url ? "원문 ↗" : "";
  article.appendChild(action);
  return article;
}

async function renderArchivePage() {
  try {
    const [works, columns, talks, press, awards, translations, blurbs, meta] =
      await Promise.all([
        loadData("works"), loadData("columns"), loadData("talks"),
        loadData("press"), loadData("awards"), loadData("translations"),
        loadData("blurbs"), loadData("meta")
      ]);

    const items = makeArchiveItems(works, columns, talks, press, awards, translations, blurbs);
    const categories = ["전체", ...new Set(items.map(x => x.category))];
    const aliases = {
      press: "기사·인터뷰", talks: "강연", writing: "칼럼",
      works: "작품", awards: "수상·선정", translations: "번역", blurbs: "추천사"
    };
    const queryCategory = new URLSearchParams(window.location.search).get("category");
    const candidate = aliases[queryCategory] || queryCategory;
    let active = categories.includes(candidate) ? candidate : "전체";

    const filterBox = $("archive-filters");
    const list = $("archive-list");
    const search = $("archive-query");
    const status = $("archive-status");

    function drawFilters() {
      filterBox.replaceChildren();
      categories.forEach(category => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.category = category;
        button.className = category === active ? "active" : "";
        button.setAttribute("aria-pressed", String(category === active));
        button.textContent = category;
        filterBox.appendChild(button);
      });
    }

    function drawItems() {
      const query = search.value.trim().toLocaleLowerCase("ko");
      const filtered = items.filter(x =>
        (active === "전체" || x.category === active) &&
        (!query || [x.date, x.category, x.title, x.detail].join(" ").toLocaleLowerCase("ko").includes(query))
      );
      status.textContent = filtered.length + "개의 기록";
      list.replaceChildren();
      if (filtered.length) {
        const fragment = document.createDocumentFragment();
        filtered.forEach(item => fragment.appendChild(archiveRow(item)));
        list.appendChild(fragment);
      } else {
        const empty = document.createElement("p");
        empty.className = "archive-empty";
        empty.textContent = "조건에 맞는 기록이 없습니다.";
        list.appendChild(empty);
      }
    }

    filterBox.addEventListener("click", event => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      active = button.dataset.category;
      drawFilters();
      drawItems();
    });
    search.addEventListener("input", drawItems);
    drawFilters();
    drawItems();
    $("updated").textContent = "마지막 업데이트 " + meta.updated;
  } catch (error) {
    console.error(error);
    $("archive-status").textContent = "아카이브를 불러오지 못했습니다. 새로고침해 주세요.";
  }
}

renderArchivePage();
