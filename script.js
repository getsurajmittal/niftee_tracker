/***** FIREBASE *****/
firebase.initializeApp({
  apiKey: "AIzaSyBRhE9av_RtN_6K_fYZ8CvPsEpIxNLtLJ0",
  authDomain: "nift-mfm-tracker.firebaseapp.com",
  databaseURL: "https://nift-mfm-tracker-default-rtdb.firebaseio.com",
  projectId: "nift-mfm-tracker",
  storageBucket: "nift-mfm-tracker.firebasestorage.app",
  messagingSenderId: "262014567970",
  appId: "1:262014567970:web:298762653f4fed228f2c7b"
});

const db = firebase.database();
const STUDY_ID = "nift-mfm-shared";

/***** COUNTDOWN *****/
const examDate = new Date("2026-02-05T22:00:00+05:30");
const pad = n => n.toString().padStart(2, "0");

const quotes = [
//   "⏳ Time left to take your revenge — no excuses!",
  "🔥 Every second wasted is a second your dream slips away!"
//   "⚡ Countdown to dominance — push harder now!",
//   "💪 This is your war — hours left to conquer it!",
//   "🚀 No mercy. No pause. Only results.",
//   "⏰ Time is ticking — be relentless!",
//   "🔥 Outwork, outsmart, outlast — the clock is your enemy!"
];

setInterval(() => {
  const now = new Date();
  const diff = examDate - now;

  if (diff <= 0) {
    countdown.innerHTML = "<b>⏳ EXAM TIME!</b>";
    countdown.className = "";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const quote = quotes[Math.floor(Date.now() / 5000) % quotes.length];

  countdown.innerHTML = `<b>${quote} — ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s</b>`;

  if (hours < 48) {
    countdown.style.color = "#ff5252";
    countdown.classList.add("pulse");
  } else if (hours < 168) {
    countdown.style.color = "#ff9800";
    countdown.classList.remove("pulse");
  } else {
    countdown.style.color = "#4caf50";
    countdown.classList.remove("pulse");
  }
}, 1000);

/***** SYLLABUS *****/
const syllabus = {
"Communication Ability & English": [
"One word substitutions",
"Idioms and phrases",
"Correct spelling",
"Synonyms and antonyms",
"Singular and plural"
],
"General Knowledge & Current Affairs": [
"Current affairs",
"Polity",
"Geography",
"Sports",
"Awards and honors"
],
"Quantitative Aptitude": [
"Number system",
"Fractions",
"Percentage",
"Profit and loss",
"Rate of interest",
"Work and task",
"Ratio proportion",
"Time, distance and speed",
"Simplification",
"Averages",
"Pipes and cisterns",
"Problem on ages",
"Mixture and allegations",
"Boats and streams",
"Permutations",
"Combination",
"Problem on trains",
"Surface area and volume"
],
"Verbal & Non-Verbal Reasoning": [
"Series completion",
"Analogy",
"Percentage",
"Coding and decoding",
"Blood relation",
"Puzzle test",
"Direction sense",
"Logical venn diagram",
"Alphabet test",
"Order and ranking",
"Mathematical operations",
"Logical sequence of words"
],
"Analytical Reasoning": [
"Mirror image",
"Water image",
"Paper folding",
"Paper cutting",
"Cube and dice"
],
"Arithmetical Reasoning": [
"Seating arrangements",
"Syllogism",
"Cause and effect",
"Data sufficiency",
"Statement and argument",
"Statement and assumptions",
"Statement and conclusions"
],
"Case Study & Caselets": [
"Case study and caselets practice"
]
};

const tracker = document.getElementById("tracker");
let total = 0;

Object.entries(syllabus).forEach(([sec, topics]) => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<h2>${sec}</h2>`;

  topics.forEach(t => {
    total++;
    const id = `${sec}-${t}`;
    card.innerHTML += `
      <label>
        <input type="checkbox" data-id="${id}" onchange="saveDone('${id}',this.checked)">
        ${t}
      </label>
      <textarea data-id="${id}" placeholder="Notes..." oninput="saveNote('${id}',this.value)"></textarea>
      <br><br>`;
  });

  tracker.appendChild(card);
});

/***** SAVE FUNCTIONS *****/
function saveDone(id,val){ db.ref(`${STUDY_ID}/done/${id}`).set(val); }
function saveNote(id,val){ db.ref(`${STUDY_ID}/notes/${id}`).set(val); }

/***** SYNC FIREBASE *****/
// Checkboxes
db.ref(`${STUDY_ID}/done`).on("value", snapshot => {
  const doneData = snapshot.val() || {};
  Object.keys(doneData).forEach(id => {
    const checkbox = document.querySelector(`input[data-id='${id}']`);
    if (checkbox) checkbox.checked = doneData[id];
  });

  const doneCount = Object.values(doneData).filter(v => v).length;
  const pct = Math.round((doneCount/total)*100);
  progress.style.width = pct + "%";
  progressText.innerText = `${pct}% completed`;
});

// Notes
db.ref(`${STUDY_ID}/notes`).on("value", snapshot => {
  const notesData = snapshot.val() || {};
  Object.keys(notesData).forEach(id => {
    const textarea = document.querySelector(`textarea[data-id='${id}']`);
    if (textarea) textarea.value = notesData[id];
  });
});

/***** MOCKS + CHART *****/
let mockChart;
function addMock(){
  const name = mockName.value.trim();
  const score = mockScore.value.trim();
  if(!name || !score) return alert("Enter both fields");
  db.ref(`${STUDY_ID}/mocks`).push({name,score:Number(score)});
  mockName.value = ""; mockScore.value = "";
}
function deleteMock(k){ if(confirm("Delete this mock?")) db.ref(`${STUDY_ID}/mocks/${k}`).remove(); }

db.ref(`${STUDY_ID}/mocks`).on("value", snap => {
  mockList.innerHTML = "";
  const labels=[], scores=[];
  snap.forEach(c => {
    const {name, score} = c.val();
    labels.push(name); scores.push(score);
    mockList.innerHTML += `<li>${name} – <b>${score}</b> <button class='delete' onclick="deleteMock('${c.key}')">Delete</button></li>`;
  });

  const ctx = mockChart?.ctx || document.getElementById("mockChart").getContext("2d");
  if(mockChart) mockChart.destroy();
  mockChart = new Chart(ctx, {
    type: "line",
    data: { labels, datasets:[{label:"Mock Trend", data:scores, tension:0.3}] },
    options: { scales:{ y:{beginAtZero:true} } }
  });
});

/***** DARK MODE *****/
function toggleDark(){ document.body.classList.toggle("dark"); }
