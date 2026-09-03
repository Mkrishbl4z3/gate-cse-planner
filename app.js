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
const STATUS_LABELS = { "not-started": "Not started", learning: "Learning", practising: "Practising", revised: "Revised", complete: "Complete" };
const VIEW_META = {
  dashboard: ["GATE CSE PREPARATION", "Your preparation, at a glance."],
  syllabus: ["COMPLETE GATE 2027 CSE", "Make every portion count."],
  revisions: ["SPACED REVISION", "Keep every revision visible."],
  pyqs: ["PREVIOUS-YEAR QUESTIONS", "Practice coverage, topic by topic."],
  insights: ["PREPARATION INSIGHTS", "See where your effort is going."]
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
  return { status: "not-started", revisions: 0, pyqs: 0, note: "", lastRevised: null, nextRevision: null };
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
        ...savedTopic,
        status: STATUS_LABELS[savedTopic.status] ? savedTopic.status : "not-started",
        revisions: Math.max(0, Number(savedTopic.revisions) || 0),
        pyqs: Math.max(0, Number(savedTopic.pyqs) || 0)
      };
    });
    return base;
  } catch {
    return base;
  }
}

let state = loadState();
let activeView = "dashboard";
let revisionFilter = "due";
let editingTopicId = null;
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

function addDays(key, days) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
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
  const complete = topics.filter((topic) => topicData(topic).status === "complete").length;
  const revisions = topics.reduce((total, topic) => total + topicData(topic).revisions, 0);
  const pyqs = topics.reduce((total, topic) => total + topicData(topic).pyqs, 0);
  return { total: topics.length, complete, revisions, pyqs, progress: topics.length ? Math.round((complete / topics.length) * 100) : 0 };
}

function totals() {
  const complete = TOPICS.filter((topic) => topicData(topic).status === "complete").length;
  const revisions = TOPICS.reduce((total, topic) => total + topicData(topic).revisions, 0);
  const pyqs = TOPICS.reduce((total, topic) => total + topicData(topic).pyqs, 0);
  return { total: TOPICS.length, complete, revisions, pyqs, progress: Math.round((complete / TOPICS.length) * 100) };
}

function dueTopics() {
  const today = todayKey();
  return TOPICS.filter((topic) => {
    const item = topicData(topic);
    return item.revisions > 0 && item.nextRevision && daysBetween(today, item.nextRevision) <= 0;
  }).sort((a, b) => dateFromKey(topicData(a).nextRevision) - dateFromKey(topicData(b).nextRevision));
}

function revisedTopics() {
  return TOPICS.filter((topic) => topicData(topic).revisions > 0);
}

function revisionInterval(revisions) {
  if (revisions <= 1) return 1;
  if (revisions === 2) return 7;
  if (revisions === 3) return 21;
  return 30;
}

function revisionText(topic) {
  const item = topicData(topic);
  if (!item.nextRevision) return "Not scheduled";
  const difference = daysBetween(todayKey(), item.nextRevision);
  if (difference < 0) return `${Math.abs(difference)}d overdue`;
  if (difference === 0) return "Due today";
  if (difference === 1) return "Due tomorrow";
  return `Due ${formatDate(item.nextRevision)}`;
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
  const due = dueTopics();
  $("#complete-metric").textContent = `${total.complete} / ${total.total}`;
  $("#complete-note").textContent = total.complete ? `${total.total - total.complete} topics still open` : "Start with one topic today";
  $("#revision-metric").textContent = total.revisions;
  $("#revision-note").textContent = total.revisions ? "Every pass is recorded" : "Log each revision, every time";
  $("#pyq-metric").textContent = total.pyqs;
  $("#pyq-note").textContent = total.pyqs ? "Questions logged across topics" : "Track questions by topic";
  $("#due-metric").textContent = due.length;
  $("#due-note").textContent = due.length ? "Open the queue and revise" : "No revision is due right now";
  $("#revision-badge").textContent = due.length;

  const nextAction = due[0] || TOPICS.find((topic) => topicData(topic).status !== "complete");
  if (nextAction) {
    const nextItem = topicData(nextAction);
    $("#next-action-card").innerHTML = `
      <span class="eyebrow">${due.length ? "REVISION DUE" : "NEXT BEST STEP"}</span>
      <h3>${escapeHTML(nextAction.name)}</h3>
      <p>${due.length ? `${escapeHTML(nextAction.subjectShort)} · ${revisionText(nextAction)} · revision #${nextItem.revisions + 1}` : `${escapeHTML(nextAction.subjectShort)} · ${STATUS_LABELS[nextItem.status]}. Move it forward when you study.`}</p>
      <button class="text-button strong" data-action="edit" data-id="${nextAction.id}">${due.length ? "Log revision" : "Update topic"} →</button>`;
  }

  $("#subject-summary").innerHTML = SYLLABUS.map((subject) => {
    const stat = subjectStats(subject.id);
    return `<div class="subject-row"><span title="${escapeHTML(subject.name)}">${escapeHTML(subject.name)}</span><div class="track"><i style="width:${stat.progress}%"></i></div><b>${stat.complete}/${stat.total}</b></div>`;
  }).join("");

  const queue = due.slice(0, 5);
  $("#dashboard-queue").innerHTML = queue.length ? queue.map((topic) => {
    const item = topicData(topic);
    return `<div class="queue-item"><span class="queue-number">${item.revisions + 1}</span><div><strong>${escapeHTML(topic.name)}</strong><small>${escapeHTML(topic.subjectShort)} · ${revisionText(topic)}</small></div><button class="small-action" data-action="revise" data-id="${topic.id}">Revise</button></div>`;
  }).join("") : `<div class="empty-state">Your revision queue will appear here after you log a first revision. The schedule follows 1, 7, and 21-day intervals.</div>`;
}

function selectedSubjects() {
  const query = $("#topic-search")?.value.trim().toLowerCase() || "";
  let subjects = state.selectedSubject === "all" ? SYLLABUS : SYLLABUS.filter((subject) => subject.id === state.selectedSubject);
  if (!query) return subjects;
  return subjects.filter((subject) => subjectTopics(subject.id).some((topic) => `${topic.name} ${topic.group}`.toLowerCase().includes(query)));
}

function renderSubjectControls() {
  $("#subject-filters").innerHTML = `<button class="filter-chip ${state.selectedSubject === "all" ? "active" : ""}" data-subject="all">All subjects</button>${SYLLABUS.map((subject) => `<button class="filter-chip ${state.selectedSubject === subject.id ? "active" : ""}" data-subject="${subject.id}">${escapeHTML(subject.short)}</button>`).join("")}`;
  $("#subject-rail").innerHTML = SYLLABUS.map((subject, index) => `<button class="rail-button ${state.selectedSubject === subject.id ? "active" : ""}" data-subject="${subject.id}"><span class="rail-no">${String(index + 1).padStart(2, "0")}</span>${escapeHTML(subject.short)}</button>`).join("");
}

function topicCard(topic) {
  const item = topicData(topic);
  return `<article class="topic-card ${item.status === "complete" ? "is-complete" : ""}">
    <div class="topic-info">
      <span class="topic-category">${escapeHTML(topic.group)}</span>
      <strong class="topic-name">${escapeHTML(topic.name)}</strong>
      ${item.note ? `<span class="topic-note" title="${escapeHTML(item.note)}">${escapeHTML(item.note)}</span>` : ""}
    </div>
    <div class="topic-actions">
      <select class="status-select" data-id="${topic.id}" aria-label="Status for ${escapeHTML(topic.name)}">${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${item.status === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      <div class="counter"><small>REVISIONS</small><button data-action="adjust" data-id="${topic.id}" data-field="revisions" data-delta="-1" aria-label="Remove a revision">−</button><b>${item.revisions}</b><button data-action="adjust" data-id="${topic.id}" data-field="revisions" data-delta="1" aria-label="Add a revision">+</button></div>
      <div class="counter"><small>PYQs</small><button data-action="adjust" data-id="${topic.id}" data-field="pyqs" data-delta="-1" aria-label="Remove a PYQ">−</button><b>${item.pyqs}</b><button data-action="adjust" data-id="${topic.id}" data-field="pyqs" data-delta="1" aria-label="Add a PYQ">+</button></div>
      <button class="edit-topic" data-action="edit" data-id="${topic.id}" aria-label="Edit ${escapeHTML(topic.name)}">···</button>
    </div>
  </article>`;
}

function renderSyllabus() {
  renderSubjectControls();
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

function renderRevisions() {
  const topics = revisedTopics();
  const today = todayKey();
  let list;
  if (revisionFilter === "due") list = topics.filter((topic) => daysBetween(today, topicData(topic).nextRevision) <= 0);
  else if (revisionFilter === "upcoming") list = topics.filter((topic) => daysBetween(today, topicData(topic).nextRevision) > 0);
  else list = topics;
  list.sort((a, b) => dateFromKey(topicData(a).nextRevision) - dateFromKey(topicData(b).nextRevision));
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.revisionFilter === revisionFilter));
  const emptyCopy = revisionFilter === "due" ? "Nothing is due right now. When you log your first revision, this topic returns after 1 day, then 7 and 21 days." : revisionFilter === "upcoming" ? "No revisions are scheduled yet." : "No revision has been logged yet.";
  $("#revision-list").innerHTML = list.length ? list.map((topic) => {
    const item = topicData(topic);
    return `<article class="revision-card"><span class="revision-time">${revisionText(topic).toUpperCase()}</span><div><h3>${escapeHTML(topic.name)}</h3><p>${escapeHTML(topic.subject)} · Last revised ${formatDate(item.lastRevised)}</p></div><span class="revision-count">${item.revisions} ${item.revisions === 1 ? "revision" : "revisions"}</span><button class="small-action" data-action="revise" data-id="${topic.id}">+ Revise</button></article>`;
  }).join("") : `<div class="panel empty-state">${emptyCopy}</div>`;
}

function renderPyqs() {
  const total = totals();
  const active = TOPICS.filter((topic) => topicData(topic).pyqs > 0).length;
  const untouched = TOPICS.length - active;
  $("#pyq-overview").innerHTML = `<article><span>Total PYQs covered</span><strong>${total.pyqs}</strong><small>All question attempts you have recorded</small></article><article><span>Topics practised</span><strong>${active} / ${TOPICS.length}</strong><small>${active ? `${Math.round((active / TOPICS.length) * 100)}% of the syllabus has PYQ work` : "Start logging questions topic by topic"}</small></article><article><span>Still untouched</span><strong>${untouched}</strong><small>Topics with no PYQs logged yet</small></article>`;
  const query = $("#pyq-search")?.value.trim().toLowerCase() || "";
  const rows = TOPICS.filter((topic) => `${topic.name} ${topic.subject}`.toLowerCase().includes(query)).sort((a, b) => topicData(b).pyqs - topicData(a).pyqs || a.name.localeCompare(b.name));
  $("#pyq-table").innerHTML = rows.length ? rows.map((topic) => {
    const item = topicData(topic);
    const className = item.pyqs > 0 && item.status === "complete" ? "complete" : item.pyqs > 0 ? "in-progress" : "";
    const label = item.pyqs > 0 ? (item.status === "complete" ? "Complete" : "Practised") : "Not started";
    return `<div class="pyq-row"><div class="pyq-topic"><strong>${escapeHTML(topic.name)}</strong><span>${escapeHTML(topic.subjectShort)} · ${escapeHTML(topic.group)}</span></div><span class="pyq-status ${className}"><i></i>${label}</span><span class="pyq-number">${item.pyqs} PYQs</span><div class="counter"><small>ADD</small><button data-action="adjust" data-id="${topic.id}" data-field="pyqs" data-delta="-1">−</button><b>${item.pyqs}</b><button data-action="adjust" data-id="${topic.id}" data-field="pyqs" data-delta="1">+</button></div></div>`;
  }).join("") : `<div class="empty-state">No topic matches this filter.</div>`;
}

function renderInsights() {
  const stats = SYLLABUS.map((subject) => ({ subject, ...subjectStats(subject.id) }));
  const maxPyqs = Math.max(1, ...stats.map((item) => item.pyqs));
  $("#completion-chart").innerHTML = stats.map(({ subject, progress }) => `<div class="bar-row"><span title="${escapeHTML(subject.name)}">${escapeHTML(subject.short)}</span><div class="track"><i style="width:${progress}%"></i></div><b>${progress}%</b></div>`).join("");
  $("#pyq-chart").innerHTML = stats.map(({ subject, pyqs }) => `<div class="bar-row"><span title="${escapeHTML(subject.name)}">${escapeHTML(subject.short)}</span><div class="track"><i class="pyq-fill" style="width:${Math.round((pyqs / maxPyqs) * 100)}%"></i></div><b>${pyqs}</b></div>`).join("");
  const leastCovered = [...stats].sort((a, b) => a.progress - b.progress || a.pyqs - b.pyqs)[0];
  const total = totals();
  $("#focus-insight").innerHTML = `<span class="eyebrow">CURRENT FOCUS</span><h2>${escapeHTML(leastCovered.subject.name)}</h2><p>${leastCovered.complete}/${leastCovered.total} topics complete and ${leastCovered.pyqs} PYQs logged. Move one topic forward to lift your overall ${total.progress}% completion.</p>`;
  const ranking = TOPICS.filter((topic) => topicData(topic).revisions > 0).sort((a, b) => topicData(b).revisions - topicData(a).revisions || a.name.localeCompare(b.name)).slice(0, 5);
  $("#revision-rankings").innerHTML = ranking.length ? ranking.map((topic, index) => `<div class="rank-row"><span class="rank-number">${index + 1}</span><strong>${escapeHTML(topic.name)}</strong><span>${topicData(topic).revisions}×</span></div>`).join("") : `<div class="empty-state">Your most-revised topics will appear here after you start using the revision counter.</div>`;
}

function renderAll() {
  updateCountdown();
  renderDashboard();
  renderSyllabus();
  renderRevisions();
  renderPyqs();
  renderInsights();
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

function adjust(topicId, field, delta) {
  const item = state.topics[topicId];
  if (!item || !["revisions", "pyqs"].includes(field)) return;
  const current = item[field];
  const next = Math.max(0, current + delta);
  if (next === current) return;
  item[field] = next;
  if (field === "revisions") {
    if (next === 0) {
      item.lastRevised = null;
      item.nextRevision = null;
    } else if (delta > 0) {
      item.lastRevised = todayKey();
      item.nextRevision = addDays(todayKey(), revisionInterval(next));
      if (item.status === "not-started") item.status = "revised";
    } else if (item.lastRevised) {
      item.nextRevision = addDays(item.lastRevised, revisionInterval(next));
    }
  }
  if (field === "pyqs" && next > 0 && item.status === "not-started") item.status = "practising";
  saveState();
  renderAll();
  showToast(field === "revisions" ? `Revision count: ${next}` : `PYQ count: ${next}`);
}

function setStatus(topicId, status) {
  if (!state.topics[topicId] || !STATUS_LABELS[status]) return;
  state.topics[topicId].status = status;
  saveState();
  renderAll();
}

function updateDialogTopic() {
  const id = $("#dialog-topic-select").value;
  const topic = TOPIC_BY_ID[id];
  if (!topic) return;
  const item = topicData(topic);
  $("#dialog-topic-title").textContent = topic.name;
  $("#dialog-status").value = item.status;
  $("#dialog-note").value = item.note || "";
}

function openProgressDialog(topicId = null) {
  const first = topicId || dueTopics()[0]?.id || TOPICS.find((topic) => topicData(topic).status !== "complete")?.id || TOPICS[0].id;
  editingTopicId = first;
  $("#dialog-topic-select").innerHTML = TOPICS.map((topic) => `<option value="${topic.id}">${escapeHTML(topic.subjectShort)} — ${escapeHTML(topic.name)}</option>`).join("");
  $("#dialog-topic-select").value = first;
  $("#dialog-revisions").value = 0;
  $("#dialog-pyqs").value = 0;
  updateDialogTopic();
  $("#progress-dialog").showModal();
}

function saveProgressFromDialog(event) {
  event.preventDefault();
  const topicId = $("#dialog-topic-select").value;
  const item = state.topics[topicId];
  const addRevisions = Math.max(0, Number($("#dialog-revisions").value) || 0);
  const addPyqs = Math.max(0, Number($("#dialog-pyqs").value) || 0);
  item.status = $("#dialog-status").value;
  item.note = $("#dialog-note").value.trim();
  if (addRevisions) {
    item.revisions += addRevisions;
    item.lastRevised = todayKey();
    item.nextRevision = addDays(todayKey(), revisionInterval(item.revisions));
  }
  if (addPyqs) item.pyqs += addPyqs;
  saveState();
  $("#progress-dialog").close();
  renderAll();
  showToast("Progress saved");
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
    const { action: kind, id, field, delta } = action.dataset;
    if (kind === "adjust") adjust(id, field, Number(delta));
    if (kind === "edit") openProgressDialog(id);
    if (kind === "revise") {
      adjust(id, "revisions", 1);
    }
    return;
  }
  const subjectButton = event.target.closest("[data-subject]");
  if (subjectButton) {
    state.selectedSubject = subjectButton.dataset.subject;
    saveState();
    renderSyllabus();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches(".status-select")) setStatus(event.target.dataset.id, event.target.value);
  if (event.target.matches("#dialog-topic-select")) updateDialogTopic();
});

$("#topic-search").addEventListener("input", renderSyllabus);
$("#pyq-search").addEventListener("input", renderPyqs);
$("#quick-add-button").addEventListener("click", () => openProgressDialog());
$("#set-date-button").addEventListener("click", openDateDialog);
$("#clock-date-button").addEventListener("click", openDateDialog);
$("#progress-form").addEventListener("submit", saveProgressFromDialog);
$("#date-form").addEventListener("submit", saveDate);
$("#export-button").addEventListener("click", exportBackup);
$("#mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
$$(".tab").forEach((tab) => tab.addEventListener("click", () => {
  revisionFilter = tab.dataset.revisionFilter;
  renderRevisions();
}));

renderAll();
