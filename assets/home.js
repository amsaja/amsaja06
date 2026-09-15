const $ = id => document.getElementById(id);
const load = path => fetch(path,{cache:"no-store"}).then(response => {
  if(!response.ok) throw new Error(path);
  return response.json();
});
const escapeMail = value => encodeURIComponent(value);

async function renderHome(){
  const [profile,works,awards,selected,translations,talks,places,meta]=await Promise.all([
    load("data/profile.json"),load("data/works.json"),load("data/awards.json"),
    load("data/selected.json"),load("data/translations.json"),load("data/talks.json"),
    load("data/places.json"),load("data/meta.json")
  ]);

  $("hero-intro").textContent=profile.focus;
  $("about-copy").textContent=profile.focus;
  const activity=selected.find(x=>["필진","연재","활동","칼럼"].includes(x.type));
  $("current-activity").textContent=activity ? activity.title : "";
  const featured=works.books[0];
  $("featured-title").textContent=`『${featured.title}』`;
  $("featured-meta").textContent=[featured.year,featured.type,featured.publisher].filter(Boolean).join(" · ");
  $("featured-link").href=featured.url;
  $("book-achievements").innerHTML=awards.filter(x=>x.scope==="book").slice(0,3)
    .map(x=>`<span>${x.result} · ${x.title.split("—")[0].trim()}</span>`).join("");
  $("translation-teaser").innerHTML=`<strong>해외 번역</strong>${translations.map(x=>
    `<span>${x.language} · ${x.status}</span>`).join("")}`;
  $("updated").textContent=`마지막 업데이트 ${meta.updated}`;

  $("reader-mail").href=`mailto:${profile.email}?subject=${escapeMail("[독자 메모] 김슬기 작가에게")}&body=${escapeMail("작가에게 남기고 싶은 이야기를 적어주세요.\n\n홈페이지 공개에 동의합니다: 예 / 아니요\n공개 시 표시할 이름:")}`;
  $("work-mail").href=`mailto:${profile.email}?subject=${escapeMail("[강연·협업 문의] 기관명")}&body=${escapeMail("기관명:\n담당자명:\n연락처:\n희망 일정:\n장소:\n문의 내용:")}`;

  const guideLines=[
    "어서 오세요. 제가 이곳을 안내할게요.",
    "먼저 제가 가장 아끼는 장편소설을 만나보세요.",
    "지도에는 독자들과 이야기를 나눈 장소를 표시해두었어요.",
    "모든 작품과 기사는 기록 보관소에서 찾을 수 있어요."
  ];
  let guideIndex=0;
  $("guide-character").addEventListener("click",()=>{
    guideIndex=(guideIndex+1)%guideLines.length;
    $("guide-speech").textContent=guideLines[guideIndex];
  });

  const mapTalks=talks.flatMap(group=>(group.items||[]).map(item=>({...item,groupLabel:group.label})));
  const venues=places.map(place=>({...place,talks:mapTalks.filter(item=>item.place===place.name)})).filter(x=>x.talks.length);
  const boundary=[[128.349716,38.612243],[129.21292,37.432392],[129.46045,36.784189],[129.468304,35.632141],[129.091377,35.082484],[128.18585,34.890377],[127.386519,34.475674],[126.485748,34.390046],[126.37392,34.93456],[126.559231,35.684541],[126.117398,36.725485],[126.860143,36.893924],[126.174759,37.749686],[126.237339,37.840378],[126.68372,37.804773],[127.073309,38.256115],[127.780035,38.304536],[128.205746,38.370397]];
  const bounds={minLon:125.95,maxLon:129.65,minLat:33,maxLat:38.85};
  const project=(lon,lat)=>({x:110+((lon-bounds.minLon)/(bounds.maxLon-bounds.minLon))*300,y:35+((bounds.maxLat-lat)/(bounds.maxLat-bounds.minLat))*515});
  const outline=boundary.map(([lon,lat],i)=>{const p=project(lon,lat);return `${i?"L":"M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`}).join(" ")+" Z";
  $("talk-map").innerHTML=`<div class="map-stage"><svg viewBox="0 0 520 620" role="img" aria-label="전국 강연 장소 지도">
    <path class="korea-shape" d="${outline}"/><ellipse class="korea-shape jeju" cx="250" cy="582" rx="39" ry="13"/>
    ${venues.map((v,i)=>{const a=project(v.lon,v.lat),x=a.x+v.dx,y=a.y+v.dy,labelX=x+(v.dx<0?-17:17);return `<g class="venue-pin" data-venue-index="${i}" role="button" tabindex="0" aria-label="${i+1}. ${v.name}">
      <line class="pin-leader" x1="${a.x}" y1="${a.y}" x2="${x}" y2="${y}"/><circle class="pin-anchor" cx="${a.x}" cy="${a.y}" r="2.5"/>
      <circle class="pin-hit" cx="${x}" cy="${y}" r="20"/><circle class="pin-marker" cx="${x}" cy="${y}" r="11"/>
      <text class="pin-number" x="${x}" y="${y+4}" text-anchor="middle">${i+1}</text><text class="venue-label" x="${labelX}" y="${y+4}" text-anchor="${v.dx<0?"end":"start"}">${v.short}</text>
    </g>`}).join("")}</svg><div id="map-popup" class="map-popup" hidden></div></div>`;
  $("talk-map-legend").innerHTML=`<span class="venue-index-count"><strong>${venues.length}곳</strong>의 오프라인 강연 장소</span><div class="venue-index">${venues.map((v,i)=>`<button type="button" data-venue-index="${i}"><em>${i+1}</em><span>${v.short}</span></button>`).join("")}</div>`;
  const openVenue=index=>{const v=venues[index],popup=$("map-popup");popup.innerHTML=`<button type="button" class="map-popup-close" aria-label="닫기">×</button><span class="map-popup-city">${v.city}</span><strong>${v.name}</strong><ul>${v.talks.map(t=>`<li>${t.title}${t.detail?` <small>· ${t.detail}</small>`:""}</li>`).join("")}</ul>`;popup.hidden=false;document.querySelectorAll("[data-venue-index]").forEach(el=>el.classList.toggle("active",Number(el.dataset.venueIndex)===Number(index)));popup.querySelector("button").onclick=()=>{popup.hidden=true;document.querySelectorAll("[data-venue-index]").forEach(el=>el.classList.remove("active"))}};
  document.querySelector(".home-talk-map").addEventListener("click",event=>{const target=event.target.closest("[data-venue-index]");if(target)openVenue(target.dataset.venueIndex)});
  $("talk-map").addEventListener("keydown",event=>{const target=event.target.closest(".venue-pin");if(target&&(event.key==="Enter"||event.key===" ")){event.preventDefault();openVenue(target.dataset.venueIndex)}});
}
renderHome().catch(error=>{console.error(error);document.body.insertAdjacentHTML("beforeend",'<p class="data-error">홈페이지 콘텐츠를 불러오지 못했습니다.</p>')});
