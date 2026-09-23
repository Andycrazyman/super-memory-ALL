const weeks = [
  ["Week 1", "Start here", "Set up your workspace and goals."], ["Week 2", "Foundations", "Build the core skills and vocabulary."], ["Week 3", "Practice", "Keep your existing work and strengthen the basics."], ["Week 4", "Connect, change, explain", "JavaScript, connections, and your 3D page."], ["Week 5", "Explore", "Apply the ideas to your own subject."], ["Week 6", "Build", "Create and test a useful feature."], ["Week 7", "Refine", "Review what works and improve it."], ["Week 8", "Checkpoint", "Organize your work and record progress."], ["Week 9", "Research", "Gather and organize supporting material."], ["Week 10", "Create", "Turn your research into a working project."], ["Week 11", "Test", "Try controlled changes and document results."], ["Week 12", "Explain", "Make your work understandable to visitors."], ["Week 13", "Design", "Improve structure, layout, and navigation."], ["Week 14", "Connect", "Link related pages and resources."], ["Week 15", "Review", "Check details and correct problems."], ["Week 16", "Polish", "Improve accessibility and responsive layout."], ["Week 17", "Share", "Prepare the complete published folder."], ["Week 18", "Feedback", "Use observations to make corrections."], ["Week 19", "Final checks", "Test links, pages, layout, and interactions."], ["Week 20", "Finish", "Complete your final review and publish."]
];

const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));

const grid = $("weekGrid");
const currentWeekNumber = $("currentWeekNumber");
const currentWeekTitle = $("currentWeekTitle");
const currentWeekButton = $("currentWeekButton");
const currentWeekSelect = $("currentWeekSelect");
let currentWeek = Math.min(20, Math.max(1, Number(localStorage.getItem("currentWeek") || 4)));

function updateCurrentWeek() {
  const w = weeks[currentWeek - 1];
  if (currentWeekNumber) currentWeekNumber.textContent = currentWeek;
  if (currentWeekTitle) currentWeekTitle.textContent = `${w[0]} — ${w[1]}`;
  if (currentWeekButton) {
    currentWeekButton.href = `weeks/week-${currentWeek}.html`;
    currentWeekButton.textContent = `Open ${w[0]}`;
  }
  if (currentWeekSelect) currentWeekSelect.value = String(currentWeek);
}

function renderCurrentWeekOptions() {
  if (!currentWeekSelect) return;
  currentWeekSelect.innerHTML = weeks.map((w, i) => `<option value="${i + 1}">${w[0]} — ${esc(w[1])}</option>`).join("");
  currentWeekSelect.value = String(currentWeek);
}

function renderWeeks(query = "") {
  if (!grid) return;
  const q = query.trim().toLowerCase();
  grid.innerHTML = weeks.map((w, i) => {
    if (q && !w.join(" ").toLowerCase().includes(q)) return "";
    return `<a class="week-card ${i + 1 === currentWeek ? "current" : ""}" href="weeks/week-${i + 1}.html"><span class="week-no">${w[0]}</span><h3>${w[1]}</h3><p>${w[2]}</p></a>`;
  }).join("") || `<p class="empty-state">No weeks match your search.</p>`;
}
renderCurrentWeekOptions();
updateCurrentWeek();
renderWeeks();
if (currentWeekSelect) currentWeekSelect.addEventListener("change", e => {
  const value = Number(e.target.value);
  if (value >= 1 && value <= 20) {
    currentWeek = value;
    localStorage.setItem("currentWeek", String(currentWeek));
    updateCurrentWeek();
    renderWeeks($("weekSearch")?.value || "");
  }
});
if ($("weekSearch")) $("weekSearch").addEventListener("input", e => renderWeeks(e.target.value));

let tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");
const list = $("taskList");
function drawTasks() {
  if (!list) return;
  list.innerHTML = tasks.map((task, i) => `<li>${esc(task)}<button type="button" class="remove-task" data-index="${i}" aria-label="Remove ${esc(task)}">×</button></li>`).join("");
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}
if ($("addTask")) $("addTask").addEventListener("click", () => {
  const input = $("taskInput");
  if (input && input.value.trim()) { tasks.push(input.value.trim()); input.value = ""; drawTasks(); }
});
if (list) list.addEventListener("click", e => {
  const button = e.target.closest(".remove-task");
  if (!button) return;
  tasks.splice(Number(button.dataset.index), 1);
  drawTasks();
});
drawTasks();

let sec = 1500, timerId = null;
const timer = $("timer");
function showTimer() { if (timer) timer.textContent = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`; }
if ($("startTimer")) $("startTimer").addEventListener("click", () => {
  if (timerId) return;
  timerId = setInterval(() => {
    sec--; showTimer();
    if (sec <= 0) { clearInterval(timerId); timerId = null; alert("Focus session complete!"); }
  }, 1000);
});
if ($("resetTimer")) $("resetTimer").addEventListener("click", () => { clearInterval(timerId); timerId = null; sec = 1500; showTimer(); });
showTimer();

const notes = $("notes");
if (notes) {
  notes.value = localStorage.getItem("studyNotes") || "";
  notes.addEventListener("input", () => {
    localStorage.setItem("studyNotes", notes.value);
    if ($("saveStatus")) $("saveStatus").textContent = "Saved just now";
  });
}

let links = JSON.parse(localStorage.getItem("quickLinks") || "null") || [
  ["Canvas", "https://sbccd.instructure.com/"], ["MDN", "https://developer.mozilla.org/"], ["YouTube", "https://www.youtube.com/"], ["Google", "https://www.google.com/"], ["GitHub", "https://github.com/"]
];
if (!links.some(link => String(link[1]).replace(/\/$/, "") === "https://sbccd.instructure.com")) {
  links.unshift(["Canvas", "https://sbccd.instructure.com/"]);
}
const linkGrid = $("linkGrid");
function saveLinks() { localStorage.setItem("quickLinks", JSON.stringify(links)); }
function drawLinks() {
  if (!linkGrid) return;
  linkGrid.innerHTML = links.map((link, i) => `<div class="link-card"><a href="${esc(link[1])}" target="_blank" rel="noopener noreferrer"><div>↗</div><h3>${esc(link[0])}</h3><p>${esc(link[1])}</p></a><button type="button" class="delete-link" data-index="${i}" aria-label="Remove ${esc(link[0])}">×</button></div>`).join("");
  saveLinks();
}
if (linkGrid) linkGrid.addEventListener("click", e => {
  const button = e.target.closest(".delete-link");
  if (!button) return;
  e.preventDefault();
  e.stopPropagation();
  const index = Number(button.dataset.index);
  if (!Number.isNaN(index)) { links.splice(index, 1); drawLinks(); }
});

if ($("addLink")) $("addLink").addEventListener("click", () => {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `<div class="modal-box"><h3>Add a website</h3><div class="link-form"><input id="ln" placeholder="Website name"><input id="lu" placeholder="https://example.com"></div><div class="modal-actions"><button type="button" id="cancel">Cancel</button><button type="button" class="save" id="save">Add website</button></div></div>`;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector("#cancel").addEventListener("click", close);
  modal.querySelector("#save").addEventListener("click", () => {
    const name = modal.querySelector("#ln").value.trim();
    let url = modal.querySelector("#lu").value.trim();
    if (!/^https?:\/\//i.test(url)) { if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) url = "https://" + url; }
    if (name && /^https?:\/\//i.test(url)) { links.push([name, url]); drawLinks(); close(); }
    else alert("Enter a website name and a valid URL, such as https://example.com");
  });
  modal.querySelector("#ln").focus();
});
drawLinks();
