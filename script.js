let selectedFile = null;
let classificationHistory = [];
let model = null;
let modelReady = false;

// DOM Elements
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const classifyBtn = document.getElementById("classifyBtn");
const resetBtn = document.getElementById("resetBtn");
const previewSection = document.getElementById("previewSection");
const previewImage = document.getElementById("previewImage");
const fileInfoSection = document.getElementById("fileInfoSection");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const resultsSection = document.getElementById("resultsSection");
const processingTime = document.getElementById("processingTime");
const resultsList = document.getElementById("resultsList");
const loadingSection = document.getElementById("loadingSection");
const errorSection = document.getElementById("errorSection");
const errorMessage = document.getElementById("errorMessage");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

// File upload handling
uploadBox.addEventListener("click", () => fileInput.click());

uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", () => {
  uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelection(files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFileSelection(e.target.files[0]);
  }
});

resetBtn.addEventListener("click", resetApp);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Enter" && selectedFile && !classifyBtn.disabled) {
    classifyImage();
  }
  if (e.code === "Escape") {
    resetApp();
  }
});

function handleFileSelection(file) {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    showError("❌ Please select a valid image file (JPG, PNG, GIF, etc.)");
    return;
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showError(
      `❌ File too large. Max size is 10MB (Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    );
    return;
  }

  selectedFile = file;
  errorSection.style.display = "none";

  // Display file info
  fileName.textContent = file.name;
  fileSize.textContent = `${(file.size / 1024).toFixed(2)} KB`;
  fileInfoSection.style.display = "block";

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewSection.style.display = "block";
  };
  reader.readAsDataURL(file);

  // Enable classify button
  classifyBtn.disabled = false;

  // Show reset button
  resetBtn.style.display = "inline-block";

  // Hide previous results
  resultsSection.style.display = "none";
}

classifyBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    showError("Please select an image first");
    return;
  }

  await classifyImage();
});

async function classifyImage() {
  try {
    if (!modelReady) {
      throw new Error(
        "AI model is still loading. Please wait a few seconds and try again.",
      );
    }

    showLoading(true);
    errorSection.style.display = "none";
    resultsSection.style.display = "none";

    const start = performance.now();
    const rawPredictions = await model.classify(previewImage, 5);
    const processingMs = Math.max(performance.now() - start, 1);
    const predictions = rawPredictions.map((item) => ({
      label: item.className,
      confidence: item.probability * 100,
    }));

    displayResults(predictions, (processingMs / 1000).toFixed(3));
    addToHistory(predictions, selectedFile.name);
  } catch (error) {
    showError("⚠️ " + error.message);
  } finally {
    showLoading(false);
  }
}

function displayResults(predictions, time) {
  resultsList.innerHTML = "";

  // Show processing time
  processingTime.textContent = `⚡ Processed in ${time}s`;

  predictions.forEach((prediction, index) => {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    const confidence = prediction.confidence;
    const confidencePercent = confidence.toFixed(2);

    resultItem.innerHTML = `
      <div style="width: 100%;">
        <div class="result-label">
          <span>${index + 1}. <strong>${prediction.label}</strong></span>
          <span class="result-confidence">${confidencePercent}%</span>
        </div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${confidence}%; transition-delay: ${index * 0.1}s;"></div>
        </div>
      </div>
    `;

    resultsList.appendChild(resultItem);
  });

  resultsSection.style.display = "block";
}

function addToHistory(predictions, imgName) {
  const topPrediction = predictions[0];
  const historyItem = {
    label: topPrediction.label,
    confidence: topPrediction.confidence.toFixed(2),
    filename: imgName,
    timestamp: new Date().toLocaleTimeString(),
  };

  classificationHistory.unshift(historyItem);

  // Keep only last 5 items
  if (classificationHistory.length > 5) {
    classificationHistory.pop();
  }

  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  if (classificationHistory.length === 0) {
    historySection.style.display = "none";
    return;
  }

  historyList.innerHTML = "";

  classificationHistory.forEach((item, index) => {
    const historyItemEl = document.createElement("div");
    historyItemEl.className = "history-item";
    historyItemEl.innerHTML = `
      <div class="history-item-label">
        ${index + 1}. ${item.label} (${item.confidence}%)
      </div>
      <div class="history-item-meta">
        📄 ${item.filename} • 🕐 ${item.timestamp}
      </div>
    `;

    historyList.appendChild(historyItemEl);
  });

  historySection.style.display = "block";
}

function resetApp() {
  selectedFile = null;
  fileInput.value = "";
  previewSection.style.display = "none";
  resultsSection.style.display = "none";
  errorSection.style.display = "none";
  fileInfoSection.style.display = "none";
  classifyBtn.disabled = true;
  resetBtn.style.display = "none";
  uploadBox.classList.remove("dragover");
}

function showLoading(show) {
  loadingSection.style.display = show ? "block" : "none";
}

function showError(message) {
  errorMessage.textContent = message;
  errorSection.style.display = "block";
}

async function loadModel() {
  try {
    showLoading(true);
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
    modelReady = true;
    console.log("Model loaded in browser successfully.");
  } catch (error) {
    showError(
      "Could not load AI model. Check internet connection and refresh.",
    );
    console.error(error);
  } finally {
    showLoading(false);
  }
}

window.addEventListener("load", async () => {
  try {
    await loadModel();
  } catch (error) {
    console.warn("Initialization error", error);
  }
});
