const telegramMessagesCheckBox = document.querySelector("#telegram-messages");
const apiInput = document.querySelector("#telegram-api-key");
const chatIdInput = document.querySelector("#telegram-chat-id");
const saveBtn = document.querySelector("#save");
const notesBox = document.getElementById("notes-box");
const saveNotesBtn = document.getElementById("save-btn");
const message = document.getElementById("message");

// =======================
//  Force Decimal for Job Rate
// =======================
function forceDecimal(input) {
  let value = input.value;
  if (value === "") return;
  if (!value.includes(".")) {
    input.value = value + ".0";
  } else {
    const parts = value.split(".");
    if (parts[1] === "") {
      input.value = parts[0] + ".0";
    }
  }
}

document.getElementById("min-rate").addEventListener("blur", function () {
  forceDecimal(this);
});
document.getElementById("max-rate").addEventListener("blur", function () {
  forceDecimal(this);
});

// =======================
//  Load Saved Settings
// =======================
chrome.storage.local.get(
  ["apiKey", "chatId", "isTelegramMessagesOn", "notes", "salaryType", "minHire", "maxHire", "minRate", "maxRate"],
  function (items) {
    apiInput.value = items.apiKey || "";
    chatIdInput.value = items.chatId || "";
    telegramMessagesCheckBox.checked = items.isTelegramMessagesOn || false;

    if (items.notes) notesBox.value = items.notes;

    if (items.salaryType) {
      document.querySelector(`input[name="jobType"][value="${items.salaryType}"]`).checked = true;
    }

    // Load hire rate as numbers
    if (items.minHire !== undefined)
      document.getElementById("min-hire").value = items.minHire;

    if (items.maxHire !== undefined)
      document.getElementById("max-hire").value = items.maxHire;

    // Load decimal job rate
    if (items.minRate !== undefined)
      document.getElementById("min-rate").value = parseFloat(items.minRate).toFixed(1);

    if (items.maxRate !== undefined)
      document.getElementById("max-rate").value = parseFloat(items.maxRate).toFixed(1);
  }
);

// =======================
// Save Notes
// =======================
saveNotesBtn.addEventListener("click", () => {
  const notes = notesBox.value.trim();
  chrome.storage.local.set({ notes }, () => {
    message.style.display = "block";
    setTimeout(() => (message.style.display = "none"), 2000);
  });
});

// =======================
// Get Job Description & Open React
// =======================
document.getElementById("cool-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    alert("افتح صفحة Upwork أولاً!");
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        const url = window.location.href;
        let el;

        if (url.includes("details")) {
          el = document.querySelector('[data-test="Description Description"]');
        } else {
          const jobTile = document.querySelector(".job-tile.air3-card.air3-card-list");
          if (jobTile && jobTile.children[2] && jobTile.children[2].children[2]) {
            el = jobTile.children[2].children[2];
          }
        }

        return el ? el.innerText.trim() : "مش لاقي وصف الوظيفة";
      },
    },
    (results) => {
      const jobDescription = results?.[0]?.result;

      if (jobDescription && jobDescription !== "مش لاقي وصف الوظيفة") {
        chrome.storage.local.get(["notes"], (res) => {
          const notes = res.notes || "";
          const finalText = jobDescription + (notes ? "\n\n" + notes : "");

          const reactAppUrl = "http://localhost:5173/?desc=" + encodeURIComponent(finalText);
          chrome.tabs.create({ url: reactAppUrl, active: true });

          chrome.runtime.sendMessage({
            action: "generateProposal",
            description: finalText,
          });
        });
      } else {
        alert("لم يتم العثور على وصف الوظيفة!");
      }
    }
  );
});

// =======================
// Save Settings
// =======================
document.getElementById("save-settings").addEventListener("click", () => {
  const salaryType = document.querySelector('input[name="jobType"]:checked').value;

  // Extract hire rates as numbers (no %)
  const minHire = parseInt(document.getElementById("min-hire").value);
  const maxHire = parseInt(document.getElementById("max-hire").value);

  // Job rate decimal
  let minRate = parseFloat(document.getElementById("min-rate").value);
  let maxRate = parseFloat(document.getElementById("max-rate").value);

  minRate = parseFloat(minRate.toFixed(1));
  maxRate = parseFloat(maxRate.toFixed(1));

  // Validations
  if (minHire < 0 || maxHire > 100 || minHire > maxHire) {
    alert("Please enter a valid hire rate range from 0 to 100.");
    return;
  }

  if (minRate < 0 || maxRate > 5 || minRate > maxRate) {
    alert("Please enter a valid job rate range from 0.0 to 5.0.");
    return;
  }

  chrome.storage.local.set({ salaryType, minHire, maxHire, minRate, maxRate }, () => {
    const msg = document.getElementById("success-msg");
    msg.style.display = "block";
    setTimeout(() => (msg.style.display = "none"), 2000);

    console.log("Settings saved:", {
      salaryType,
      minHire,
      maxHire,
      minRate,
      maxRate,
    });
  });
});
