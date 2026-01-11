/***** FIREBASE *****/
firebase.initializeApp({
  apiKey: "AIzaSyBRhE9av_RtN_6K_fYZ8CvPsEpIxNLtLJ0",
  authDomain: "nift-mfm-tracker.firebaseapp.com",
  databaseURL: "https://nift-mfm-tracker-default-rtdb.firebaseio.com",
  projectId: "nift-mfm-tracker",
  storageBucket: "nift-mfm-tracker.firebasestorage.app",
  messagingSenderId: "262014567970",
  appId: "1:262014567970:web:298762653f4fed228f2c7b",
});

const db = firebase.database();
const storage = firebase.storage();
const STUDY_ID = "nift-mfm-shared";

/***** COUNTDOWN *****/
const examDate = new Date("2026-02-05T22:00:00+05:30");
const pad = (n) => n.toString().padStart(2, "0");

const quotes = [
  //   "⏳ Time left to take your revenge — no excuses!",
  "🔥 Every second wasted is a second your dream slips away!",
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

  countdown.innerHTML = `<b>${quote} — ${pad(hours)}h ${pad(minutes)}m ${pad(
    seconds
  )}s</b>`;

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
    "Singular and plural",
  ],
  "General Knowledge & Current Affairs": [
    "Current affairs",
    "Polity",
    "Geography",
    "Sports",
    "Awards and honors",
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
    "Surface area and volume",
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
    "Logical sequence of words",
  ],
  "Analytical Reasoning": [
    "Mirror image",
    "Water image",
    "Paper folding",
    "Paper cutting",
    "Cube and dice",
  ],
  "Arithmetical Reasoning": [
    "Seating arrangements",
    "Syllogism",
    "Cause and effect",
    "Data sufficiency",
    "Statement and argument",
    "Statement and assumptions",
    "Statement and conclusions",
  ],
  "Case Study & Caselets": ["Case study and caselets practice"],
};

const tracker = document.getElementById("tracker");
let total = 0;

Object.entries(syllabus).forEach(([sec, topics]) => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<h2>${sec}</h2>`;

  topics.forEach((t) => {
    total++;
    const id = `${sec}-${t}`;
    card.innerHTML += `
      <label>
        <input type="checkbox" data-id="${id}" onchange="saveDone('${id}',this.checked)">
        ${t}
      </label>
      <textarea data-id="${id}" placeholder="Notes..." oninput="saveNote('${id}',this.value)"></textarea>
      <div class="image-upload">
        <label for="img-${id}">📸 Upload Image</label>
        <input type="file" id="img-${id}" accept="image/*" data-id="${id}" onchange="uploadImage('${id}',this)" />
      </div>
      <div class="images-container" data-id="${id}"></div>
      <br><br>`;
  });

  tracker.appendChild(card);
});

/***** SAVE FUNCTIONS *****/
function saveDone(id, val) {
  db.ref(`${STUDY_ID}/done/${id}`).set(val);
}
function saveNote(id, val) {
  db.ref(`${STUDY_ID}/notes/${id}`).set(val);
}

/***** IMAGE UPLOAD *****/
function uploadImage(id, fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    let base64String = e.target.result;

    // Compress image for mobile if it's too large
    if (file.size > 1 * 1024 * 1024) {
      compressImage(base64String, (compressed) => {
        saveImageToDatabase(id, compressed, file.name, fileInput);
      });
    } else {
      saveImageToDatabase(id, base64String, file.name, fileInput);
    }
  };

  reader.onerror = function () {
    alert("Failed to read file");
  };

  reader.readAsDataURL(file);
}

function compressImage(base64String, callback) {
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    let width = img.width;
    let height = img.height;

    // Reduce size to max 1200px width
    if (width > 1200) {
      height = Math.round(height * (1200 / width));
      width = 1200;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // Compress to JPEG with quality 0.7
    const compressed = canvas.toDataURL("image/jpeg", 0.7);
    callback(compressed);
  };
  img.src = base64String;
}

function saveImageToDatabase(id, base64String, filename, fileInput) {
  const timestamp = Date.now();

  console.log("Uploading image:", filename);

  const imageObj = {};
  imageObj[timestamp] = {
    data: base64String,
    name: filename,
  };

  db.ref(`${STUDY_ID}/images/${id}`)
    .update(imageObj)
    .then(() => {
      console.log("Image uploaded successfully");
      alert("Image uploaded successfully!");
    })
    .catch((error) => {
      console.error("Upload error:", error);
      alert("Failed to upload image: " + error.message);
    });

  fileInput.value = "";
}

function deleteImage(id, timestamp) {
  if (!confirm("Delete this image?")) return;

  console.log("Deleting image with timestamp:", timestamp);

  db.ref(`${STUDY_ID}/images/${id}/${timestamp}`)
    .remove()
    .then(() => {
      console.log("Image deleted successfully");
    })
    .catch((error) => {
      console.error("Delete error:", error);
      alert("Failed to delete image: " + error.message);
    });
}

/***** IMAGE VIEWER *****/
let currentZoom = 1;
let touchStartDistance = 0;

function openImageViewer(imageSrc, imageName) {
  const modal = document.getElementById("imageViewerModal");
  const img = document.getElementById("viewerImage");
  const info = document.getElementById("viewerInfo");

  img.src = imageSrc;
  info.textContent = imageName || "Image";
  modal.classList.add("active");

  currentZoom = 1;
  img.style.transform = "scale(1)";

  // Add touch and wheel listeners
  img.addEventListener("wheel", handleWheel, false);
  document.addEventListener("touchmove", handleTouchMove, false);
  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchend", handleTouchEnd, false);
}

function closeImageViewer() {
  const modal = document.getElementById("imageViewerModal");
  const img = document.getElementById("viewerImage");

  modal.classList.remove("active");

  // Remove listeners
  img.removeEventListener("wheel", handleWheel);
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchstart", handleTouchStart);
  document.removeEventListener("touchend", handleTouchEnd);
}

function handleWheel(e) {
  e.preventDefault();
  const img = document.getElementById("viewerImage");
  const zoomSpeed = 0.1;

  if (e.deltaY < 0) {
    currentZoom += zoomSpeed;
  } else {
    currentZoom = Math.max(1, currentZoom - zoomSpeed);
  }

  currentZoom = Math.min(currentZoom, 5);
  img.style.transform = `scale(${currentZoom})`;
}

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    touchStartDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const img = document.getElementById("viewerImage");
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );

    const zoomSpeed = 0.01;
    const delta = currentDistance - touchStartDistance;
    currentZoom += delta * zoomSpeed;

    currentZoom = Math.max(1, Math.min(currentZoom, 5));
    img.style.transform = `scale(${currentZoom})`;

    touchStartDistance = currentDistance;
  }
}

function handleTouchEnd(e) {
  touchStartDistance = 0;
}

/***** SYNC FIREBASE *****/
// Checkboxes
db.ref(`${STUDY_ID}/done`).on("value", (snapshot) => {
  const doneData = snapshot.val() || {};
  Object.keys(doneData).forEach((id) => {
    const checkbox = document.querySelector(`input[data-id='${id}']`);
    if (checkbox) checkbox.checked = doneData[id];
  });

  const doneCount = Object.values(doneData).filter((v) => v).length;
  const pct = Math.round((doneCount / total) * 100);
  progress.style.width = pct + "%";
  progressText.innerText = `${pct}% completed`;
});

// Notes
db.ref(`${STUDY_ID}/notes`).on("value", (snapshot) => {
  const notesData = snapshot.val() || {};
  Object.keys(notesData).forEach((id) => {
    const textarea = document.querySelector(`textarea[data-id='${id}']`);
    if (textarea) textarea.value = notesData[id];
  });
});

// Images
db.ref(`${STUDY_ID}/images`).on("value", (snapshot) => {
  const imagesData = snapshot.val() || {};
  console.log("Images data received:", imagesData);

  Object.keys(imagesData).forEach((id) => {
    const container = document.querySelector(
      `.images-container[data-id='${id}']`
    );
    if (container) {
      container.innerHTML = "";
      const imagesObj = imagesData[id];

      // imagesObj is now an object with timestamps as keys
      if (typeof imagesObj === "object" && imagesObj !== null) {
        Object.keys(imagesObj).forEach((timestamp) => {
          const img = imagesObj[timestamp];

          if (img && img.data) {
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";
            wrapper.style.margin = "4px";

            const imgElement = document.createElement("img");
            imgElement.src = img.data;
            imgElement.alt = img.name || "note image";
            imgElement.style.maxWidth = "150px";
            imgElement.style.maxHeight = "150px";
            imgElement.style.borderRadius = "6px";
            imgElement.style.display = "block";
            imgElement.style.cursor = "pointer";
            imgElement.title = "Click to view full size";

            // Click to view full size in modal
            imgElement.onclick = function () {
              openImageViewer(img.data, img.name || "Image");
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete";
            deleteBtn.textContent = "✕";
            deleteBtn.style.position = "absolute";
            deleteBtn.style.top = "0";
            deleteBtn.style.right = "0";
            deleteBtn.style.padding = "4px 8px";
            deleteBtn.style.fontSize = "0.8rem";
            deleteBtn.onclick = (e) => {
              e.stopPropagation();
              deleteImage(id, timestamp);
            };

            wrapper.appendChild(imgElement);
            wrapper.appendChild(deleteBtn);
            container.appendChild(wrapper);
          }
        });
      }
    }
  });
});

/***** MOCKS + CHART *****/
let mockChart;
function addMock() {
  const name = mockName.value.trim();
  const score = mockScore.value.trim();
  if (!name || !score) return alert("Enter both fields");
  db.ref(`${STUDY_ID}/mocks`).push({ name, score: Number(score) });
  mockName.value = "";
  mockScore.value = "";
}
function deleteMock(k) {
  if (confirm("Delete this mock?")) db.ref(`${STUDY_ID}/mocks/${k}`).remove();
}

db.ref(`${STUDY_ID}/mocks`).on("value", (snap) => {
  mockList.innerHTML = "";
  const labels = [],
    scores = [];
  snap.forEach((c) => {
    const { name, score } = c.val();
    labels.push(name);
    scores.push(score);
    mockList.innerHTML += `<li>${name} – <b>${score}</b> <button class='delete' onclick="deleteMock('${c.key}')">Delete</button></li>`;
  });

  const ctx =
    mockChart?.ctx || document.getElementById("mockChart").getContext("2d");
  if (mockChart) mockChart.destroy();
  mockChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "Mock Trend", data: scores, tension: 0.3 }],
    },
    options: { scales: { y: { beginAtZero: true } } },
  });
});

/***** DARK MODE *****/
function toggleDark() {
  document.body.classList.toggle("dark");
}
