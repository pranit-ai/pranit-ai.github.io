const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="assets/images/icons.svg#i-${name}"></use></svg>`;
const safe = (value="") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validHttpUrl = value => /^https?:\/\//i.test(value || "");
const setText = (selector, value) => { const node=$(selector); if(node && value) node.textContent=value; };

async function loadJson(file) {
  const response = await fetch(`content/${file}`);
  if (!response.ok) throw new Error(`Could not load content/${file}`);
  return response.json();
}
function renderProfile(p) {
  document.title = `${p.name} | ${p.headline}`;
  $('meta[name="description"]')?.setAttribute("content", p.summary);
  setText("[data-profile-name]", p.name);
  setText("[data-profile-headline]", p.headline);
  setText("[data-profile-title]", p.heroTitle);
  setText("[data-profile-summary]", p.summary);
  setText("[data-profile-location]", p.location);
  setText("[data-profile-availability]", p.availability);
  setText("[data-profile-note]", p.heroNote);
  setText("[data-profile-experience]", p.experienceLabel);
  const stats=$("#hero-stats");
  stats.innerHTML=(p.highlights||[]).map(x=>`<div class="stat"><strong>${safe(x.value)}</strong><span>${safe(x.label)}</span></div>`).join("");
  const email = p.email && !p.email.includes("example.com");
  const mailLink = $("#email-link");
  if(email){mailLink.href=`mailto:${p.email}`;mailLink.hidden=false;$("#email-text").textContent=p.email;}
  else {mailLink.hidden=true;}
  const linkedin=$("#linkedin-link");
  if(validHttpUrl(p.linkedin) && !p.linkedin.includes("your-linkedin-handle")){linkedin.href=p.linkedin;linkedin.hidden=false;} else linkedin.hidden=true;
}
function renderExperience(items) {
  $("#experience-list").innerHTML=items.map(item=>`
    <article class="timeline-card reveal">
      <div class="timeline-top"><div><h3>${safe(item.role)}</h3><div class="company">${safe(item.company)}</div></div><span class="period">${safe(item.period)}</span></div>
      <p>${safe(item.summary)}</p>
      <ul>${(item.bullets||[]).map(b=>`<li>${safe(b)}</li>`).join("")}</ul>
      <div class="tags">${(item.stack||[]).map(t=>`<span class="tag">${safe(t)}</span>`).join("")}</div>
      ${item.companyNote?`<div class="note">${safe(item.companyNote)}.</div>`:""}
    </article>`).join("");
}
function renderSkills(items) {
  $("#skills-grid").innerHTML=items.map(item=>`
    <article class="skill-card reveal"><div class="skill-head"><div><h3>${safe(item.category)}</h3><p>${safe(item.description)}</p></div><span class="level">${safe(item.level)}</span></div>
    <div class="tags">${item.items.map(t=>`<span class="tag">${safe(t)}</span>`).join("")}</div></article>`).join("");
}
function renderProjects(items) {
  const grid=$("#projects-grid");
  const categories=["All",...new Set(items.map(p=>p.category.split(" · ")[0]))];
  $("#project-filters").innerHTML=categories.map((c,i)=>`<button class="filter-btn ${i===0?"active":""}" data-filter="${safe(c)}" type="button">${safe(c)}</button>`).join("");
  const draw=(filter="All")=>{
    const filtered=items.filter(p=>filter==="All"||p.category.startsWith(filter));
    grid.innerHTML=filtered.map(p=>`
      <article class="project-card reveal">
        <div class="project-image"><img src="assets/images/project-${safe(p.art)}.svg" alt="${safe(p.title)} project illustration" loading="lazy"></div>
        <div class="project-body">
          <div class="project-meta"><span>${safe(p.category)}</span><span>${safe(p.type)}</span></div>
          <h3>${safe(p.title)}</h3><p>${safe(p.summary)}</p>
          <div class="outcome">${safe(p.outcome)}</div>
          <div class="tags">${p.stack.map(t=>`<span class="tag">${safe(t)}</span>`).join("")}</div>
          ${validHttpUrl(p.link)?`<a class="project-link" href="${safe(p.link)}" target="_blank" rel="noopener noreferrer">${safe(p.linkLabel||"View project")} ${icon("arrow-up-right")}</a>`:`<span class="project-link muted">${safe(p.linkLabel||"")}</span>`}
        </div>
      </article>`).join("");
    observeReveals();
  };
  $("#project-filters").addEventListener("click", e=>{
    const btn=e.target.closest("[data-filter]"); if(!btn)return;
    $$(".filter-btn",$("#project-filters")).forEach(b=>b.classList.toggle("active",b===btn));
    draw(btn.dataset.filter);
  });
  draw();
}
function renderEducation(items) {
  $("#education-grid").innerHTML=items.map(item=>`
    <article class="education-card reveal"><span class="edu-year">${safe(item.period)}</span><h3>${safe(item.qualification)}</h3><div class="institution">${safe(item.institution)}</div><span class="edu-result">${safe(item.result)}</span><p>${safe(item.details)}</p></article>`).join("");
}
let observer;
function observeReveals(){
  if(!("IntersectionObserver" in window)){ $$(".reveal").forEach(el=>el.classList.add("visible")); return; }
  if(!observer) observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.08});
  $$(".reveal:not(.visible)").forEach(el=>observer.observe(el));
}
function initTheme(){
  const saved=localStorage.getItem("portfolio-theme");
  const prefersLight=window.matchMedia?.("(prefers-color-scheme: light)").matches;
  document.documentElement.dataset.theme=saved||(prefersLight?"light":"dark");
  const button=$("#theme-toggle");
  const update=()=>{const light=document.documentElement.dataset.theme==="light";button.innerHTML=icon(light?"moon":"sun");button.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");};
  update();
  button.addEventListener("click",()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==="light"?"dark":"light";localStorage.setItem("portfolio-theme",document.documentElement.dataset.theme);update();});
}
function initNavigation(){
  const menu=$("#menu-toggle"), nav=$("#mobile-nav");
  menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.innerHTML=icon(open?"x":"menu");});
  $$("#mobile-nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.innerHTML=icon("menu");}));
  const sections=$$("main section[id]");
  const links=$$(".nav-links a");
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${e.target.id}`));}),{rootMargin:"-35% 0px -55% 0px"});
    sections.forEach(s=>io.observe(s));
  }
}
async function init(){
  initTheme(); initNavigation();
  try{
    const [profile,experience,education,skills,projects]=await Promise.all([
      loadJson("profile.json"),loadJson("experience.json"),loadJson("education.json"),loadJson("skills.json"),loadJson("projects.json")
    ]);
    renderProfile(profile);renderExperience(experience);renderEducation(education);renderSkills(skills);renderProjects(projects);
    observeReveals();
    $("#year").textContent=new Date().getFullYear();
  }catch(error){
    console.error(error);
    $("#content-error").hidden=false;
  }
}
document.addEventListener("DOMContentLoaded",init);
