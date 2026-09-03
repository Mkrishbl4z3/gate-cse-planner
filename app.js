const SYLLABUS = [
  {
    id: "mathematics",
    short: "Mathematics",
    name: "Engineering Mathematics",
    description: "Discrete mathematics, linear algebra, calculus, probability and statistics.",
    groups: [
      { name: "Discrete Mathematics", topics: ["Propositional and first-order logic", "Sets, relations and functions", "Partial orders and lattices", "Monoids and groups", "Graphs: connectivity, matching and colouring", "Combinatorics: counting, recurrence relations and generating functions"] },
      { name: "Linear Algebra", topics: ["Matrices and determinants", "Systems of linear equations", "Eigenvalues and eigenvectors", "LU decomposition"] },
      { name: "Calculus", topics: ["Limits, continuity and differentiability", "Maxima, minima and mean value theorem", "Integration"] },
      { name: "Probability & Statistics", topics: ["Random variables and probability distributions", "Mean, median, mode and standard deviation", "Conditional probability and Bayes' theorem"] }
    ]
  },
  {
    id: "digital-logic",
    short: "Digital Logic",
    name: "Digital Logic",
    description: "Boolean logic, circuits and number systems.",
    groups: [
      { name: "Digital Logic", topics: ["Boolean algebra and minimisation: algebraic technique", "Karnaugh map and tabular method", "Design of combinational circuits", "Design of sequential circuits", "Number representation and arithmetic: fixed and floating point"] }
    ]
  },
  {
    id: "coa",
    short: "COA",
    name: "Computer Organization and Architecture",
    description: "Instruction execution, memory, I/O and pipelining.",
    groups: [
      { name: "Computer Organization", topics: ["Instruction set and addressing modes", "Design of arithmetic and logic unit (ALU)", "Hardwired and microprogrammed control unit", "Memory interfacing and hierarchy: performance", "Cache memory mapping", "I/O interface: interrupt and DMA", "Instruction pipelining and pipeline hazards"] }
    ]
  },
  {
    id: "programming-ds",
    short: "Programming & DS",
    name: "Programming and Data Structures",
    description: "C programming, core data structures and their applications.",
    groups: [
      { name: "Programming & Data Structures", topics: ["Programming in C", "Recursion", "Arrays", "Stacks", "Queues", "Linked lists", "Trees", "Binary search trees", "Binary heaps", "Graphs"] }
    ]
  },
  {
    id: "algorithms",
    short: "Algorithms",
    name: "Algorithms",
    description: "Complexity, design techniques and graph algorithms.",
    groups: [
      { name: "Algorithms", topics: ["Searching", "Sorting", "Hashing", "Asymptotic worst-case time and space complexity", "Greedy design technique", "Dynamic programming", "Divide-and-conquer", "Graph traversals", "Minimum spanning trees", "Shortest paths"] }
    ]
  },
  {
    id: "toc",
    short: "TOC",
    name: "Theory of Computation",
    description: "Automata, formal languages and computability.",
    groups: [
      { name: "Theory of Computation", topics: ["Regular expressions and finite automata", "Context-free grammars and push-down automata", "Regular and context-free languages", "Pumping lemma", "Turing machines and undecidability"] }
    ]
  },
  {
    id: "compiler",
    short: "Compiler",
    name: "Compiler Design",
    description: "The compilation pipeline, code generation and optimisation.",
    groups: [
      { name: "Compiler Design", topics: ["Lexical analysis", "Parsing", "Syntax-directed translation", "Runtime environments", "Intermediate code generation", "Local optimisation", "Data flow analysis: constant propagation", "Data flow analysis: liveness analysis", "Data flow analysis: common subexpression elimination"] }
    ]
  },
  {
    id: "operating-systems",
    short: "Operating Systems",
    name: "Operating Systems",
    description: "Processes, scheduling, memory and storage.",
    groups: [
      { name: "Operating Systems", topics: ["System calls", "Processes and threads", "Inter-process communication", "Concurrency and synchronization", "Deadlock", "CPU and I/O scheduling", "Memory management and virtual memory", "File systems"] }
    ]
  },
  {
    id: "databases",
    short: "Databases",
    name: "Databases",
    description: "Data modelling, queries, indexing and transactions.",
    groups: [
      { name: "Databases", topics: ["ER model", "Relational model and relational algebra", "Tuple calculus", "SQL", "Integrity constraints and normal forms", "File organization", "Indexing: B and B+ trees", "Transactions", "Concurrency control"] }
    ]
  },
  {
    id: "networks",
    short: "Networks",
    name: "Computer Networks",
    description: "Layers, routing, IP, TCP and application protocols.",
    groups: [
      { name: "Computer Networks", topics: ["Principles of layering", "Switching: circuit, packet and virtual circuit; performance metrics", "Data link layer: error detection", "Medium Access Control and Ethernet", "Distance vector routing", "Link state routing", "IPv4: fragmentation, CIDR notation and NAT", "TCP: flow control and congestion control", "Socket API", "DNS and HTTP"] }
    ]
  }
];

const STORAGE_KEY = "gate-track-cse-2027-v1";
const VIEW_META = {
  dashboard: ["GATE CSE PREPARATION", "Your preparation, at a glance."],
  syllabus: ["COMPLETE GATE 2027 CSE", "Make every portion count."]
};

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const TOPICS = SYLLABUS.flatMap((subject) => subject.groups.flatMap((group) => group.topics.map((name, index) => ({
  id: `${subject.id}-${slug(group.name)}-${index + 1}`,
  name,
  group: group.name,
  subjectId: subject.id,
  subject: subject.name,
  subjectShort: subject.short
}))));
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((topic) => [topic.id, topic]));

function defaultTopicState() {
  return { completed: false };
}

function makeDefaultState() {
  return {
    examDate: "",
    selectedSubject: "all",
    topics: Object.fromEntries(TOPICS.map((topic) => [topic.id, defaultTopicState()]))
  };
}

function loadState() {
  const base = makeDefaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return base;
    base.examDate = typeof saved.examDate === "string" ? saved.examDate : "";
    base.selectedSubject = SYLLABUS.some((subject) => subject.id === saved.selectedSubject) ? saved.selectedSubject : "all";
    TOPICS.forEach((topic) => {
      const savedTopic = saved.topics?.[topic.id];
      if (!savedTopic) return;
      base.topics[topic.id] = {
        ...defaultTopicState(),
        completed: Boolean(savedTopic.completed)
      };
    });
    return base;
  } catch {
    return base;
  }
}

let state = loadState();
let activeView = "dashboard";
let completionFilter = "all";
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function dateFromKey(key) {
  return key ? new Date(`${key}T00:00:00`) : null;
}

function daysBetween(from, to) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((dateFromKey(to) - dateFromKey(from)) / oneDay);
}

function formatDate(key) {
  return dateFromKey(key)?.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) || "—";
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);
}

function topicData(topic) {
  return state.topics[topic.id];
}

function subjectTopics(subjectId) {
  return TOPICS.filter((topic) => topic.subjectId === subjectId);
}

function subjectStats(subjectId) {
  const topics = subjectTopics(subjectId);
  const complete = topics.filter((topic) => topicData(topic).completed).length;
  return { total: topics.length, complete, progress: topics.length ? Math.round((complete / topics.length) * 100) : 0 };
}

function totals() {
  const complete = TOPICS.filter((topic) => topicData(topic).completed).length;
  return { total: TOPICS.length, complete, progress: Math.round((complete / TOPICS.length) * 100) };
}

function updateCountdown() {
  const element = $("#countdown");
  const bigNumber = $("#countdown-days");
  const bigDate = $("#countdown-date");
  const clockButton = $("#clock-date-button");
  const clock = $(".clock-value");
  if (!state.examDate) {
    element.textContent = "Set your exam date";
    bigNumber.textContent = "—";
    bigDate.textContent = "SET YOUR EXAM DATE";
    clockButton.textContent = "Set target";
    clock.style.strokeDashoffset = "358.14";
    return;
  }
  const days = daysBetween(todayKey(), state.examDate);
  element.textContent = days > 0 ? `${days} days to go` : days === 0 ? "Exam day" : "Target date has passed";
  bigNumber.textContent = days > 0 ? days : 0;
  bigDate.textContent = `TARGET · ${dateFromKey(state.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}`;
  clockButton.textContent = "Change date";
  const cycleDays = 365;
  const elapsed = Math.max(0, Math.min(cycleDays, cycleDays - Math.max(days, 0)));
  clock.style.strokeDashoffset = 477.52 - (477.52 * Math.max(.06, elapsed / cycleDays));
}

function renderDashboard() {
  const total = totals();
  $("#complete-metric").textContent = `${total.complete} / ${total.total}`;
  $("#complete-note").textContent = total.complete ? `${total.total - total.complete} topics to go` : "Start marking topics as complete";

  const nextIncomplete = TOPICS.find((topic) => !topicData(topic).completed);
  if (nextIncomplete) {
    $("#next-action-card").innerHTML = `
      <span class="eyebrow">NEXT TOPIC</span>
      <h3>${escapeHTML(nextIncomplete.name)}</h3>
      <p>${escapeHTML(nextIncomplete.subjectShort)} · ${escapeHTML(nextIncomplete.group)}</p>
      <button class="text-button strong" data-action="toggle" data-id="${nextIncomplete.id}">Mark as done →</button>`;
  }

  $("#subject-summary").innerHTML = SYLLABUS.map((subject) => {
    const stat = subjectStats(subject.id);
    return `<div class="subject-row"><span title="${escapeHTML(subject.name)}">${escapeHTML(subject.name)}</span><div class="track"><i style="width:${stat.progress}%"></i></div><b>${stat.complete}/${stat.total}</b></div>`;
  }).join("");
}

function selectedSubjects() {
  const query = $("#topic-search")?.value.trim().toLowerCase() || "";
  let subjects = state.selectedSubject === "all" ? SYLLABUS : SYLLABUS.filter((subject) => subject.id === state.selectedSubject);
  if (!query && completionFilter === "all") return subjects;
  return subjects.filter((subject) => subjectTopics(subject.id).some((topic) => {
    const matchesSearch = !query || `${topic.name} ${topic.group}`.toLowerCase().includes(query);
    const matchesCompletion = completionFilter === "all" || 
      (completionFilter === "completed" && topicData(topic).completed) ||
      (completionFilter === "not-started" && !topicData(topic).completed);
    return matchesSearch && matchesCompletion;
  }));
}

function renderSubjectControls() {
  $("#subject-filters").innerHTML = `<button class="filter-chip ${state.selectedSubject === "all" ? "active" : ""}" data-subject="all">All subjects</button>${SYLLABUS.map((subject) => `<button class="filter-chip ${state.selectedSubject === subject.id ? "active" : ""}" data-subject="${subject.id}">${escapeHTML(subject.short)}</button>`).join("")}`;
  $("#subject-rail").innerHTML = SYLLABUS.map((subject, index) => `<button class="rail-button ${state.selectedSubject === subject.id ? "active" : ""}" data-subject="${subject.id}"><span class="rail-no">${String(index + 1).padStart(2, "0")}</span>${escapeHTML(subject.short)}</button>`).join("");
}

function renderStatusFilters() {
  $("#status-filters").innerHTML = `<button class="filter-chip ${completionFilter === "all" ? "active" : ""}" data-completion="all">All topics</button><button class="filter-chip ${completionFilter === "completed" ? "active" : ""}" data-completion="completed">Completed</button><button class="filter-chip ${completionFilter === "not-started" ? "active" : ""}" data-completion="not-started">Not started</button>`;
}

function topicCard(topic) {
  const item = topicData(topic);
  return `<article class="topic-card ${item.completed ? "is-complete" : ""}">
    <div class="topic-info">
      <span class="topic-category">${escapeHTML(topic.group)}</span>
      <strong class="topic-name">${escapeHTML(topic.name)}</strong>
    </div>
    <div class="topic-actions">
      <input type="checkbox" class="topic-checkbox" data-id="${topic.id}" ${item.completed ? "checked" : ""} aria-label="Mark ${escapeHTML(topic.name)} as done" />
    </div>
  </article>`;
}

function renderSyllabus() {
  renderSubjectControls();
  renderStatusFilters();
  const query = $("#topic-search")?.value.trim().toLowerCase() || "";
  const subjects = selectedSubjects();
  $("#topic-area").innerHTML = subjects.length ? subjects.map((subject) => {
    const stat = subjectStats(subject.id);
    const groups = subject.groups.map((group) => {
      const groupTopics = subjectTopics(subject.id).filter((topic) => topic.group === group.name && (!query || `${topic.name} ${topic.group}`.toLowerCase().includes(query)));
      return groupTopics.length ? groupTopics.map(topicCard).join("") : "";
    }).join("");
    return `<section class="subject-section" id="section-${subject.id}"><header class="subject-section-header"><div><h2>${escapeHTML(subject.name)}</h2><p>${escapeHTML(subject.description)}</p></div><span class="subject-mini-progress">${stat.complete}/${stat.total} COMPLETE</span></header>${groups || `<div class="empty-state">No matching topic in this subject.</div>`}</section>`;
  }).join("") : `<div class="empty-state">No topics match your search.</div>`;
}

function renderAll() {
  updateCountdown();
  renderDashboard();
  renderSyllabus();
}

function showView(view) {
  activeView = view;
  $$(".view").forEach((element) => element.classList.toggle("active", element.id === `${view}-view`));
  $$(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  const [kicker, title] = VIEW_META[view];
  $("#page-kicker").textContent = kicker;
  $("#page-title").textContent = title;
  $(".sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleTopic(topicId) {
  if (!state.topics[topicId]) return;
  state.topics[topicId].completed = !state.topics[topicId].completed;
  saveState();
  renderAll();
  const topic = TOPIC_BY_ID[topicId];
  showToast(state.topics[topicId].completed ? `✓ ${topic.name}` : `○ ${topic.name}`);
}

function openDateDialog() {
  $("#exam-date-input").value = state.examDate || "";
  $("#date-dialog").showModal();
}

function saveDate(event) {
  event.preventDefault();
  state.examDate = $("#exam-date-input").value;
  saveState();
  $("#date-dialog").close();
  updateCountdown();
  showToast(state.examDate ? "Exam date saved" : "Date cleared");
}

function exportBackup() {
  const exportData = { version: 1, exportedAt: new Date().toISOString(), data: state };
  const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `gate-cse-tracker-backup-${todayKey()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup downloaded");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("click", (event) => {
  const closeDialog = event.target.closest("[data-close-dialog]");
  if (closeDialog) {
    $(`#${closeDialog.dataset.closeDialog}`).close();
    return;
  }
  const nav = event.target.closest("[data-view]");
  if (nav) {
    showView(nav.dataset.view);
    return;
  }
  const jump = event.target.closest("[data-go-to]");
  if (jump) {
    showView(jump.dataset.goTo);
    return;
  }
  const action = event.target.closest("[data-action]");
  if (action) {
    const { action: kind, id } = action.dataset;
    if (kind === "toggle") toggleTopic(id);
    return;
  }
  const subjectButton = event.target.closest("[data-subject]");
  if (subjectButton) {
    state.selectedSubject = subjectButton.dataset.subject;
    saveState();
    renderSyllabus();
  }
  const completionButton = event.target.closest("[data-completion]");
  if (completionButton) {
    completionFilter = completionButton.dataset.completion;
    renderSyllabus();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches(".topic-checkbox")) {
    toggleTopic(event.target.dataset.id);
  }
});

$("#topic-search").addEventListener("input", renderSyllabus);
$("#set-date-button").addEventListener("click", openDateDialog);
$("#clock-date-button").addEventListener("click", openDateDialog);
$("#date-form").addEventListener("submit", saveDate);
$("#export-button").addEventListener("click", exportBackup);
$("#mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("open"));

renderAll();