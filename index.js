// =======================
// popup.js
// =======================

// عناصر التليجرام
const telegramMessagesCheckBox = document.querySelector("#telegram-messages")
const apiInput = document.querySelector("#telegram-api-key")
const chatIdInput = document.querySelector("#telegram-chat-id")
const saveBtn = document.querySelector("#save")

let apiKey, chatId

// جلب الإعدادات المحفوظة
chrome.storage.local.get(
  ["apiKey", "chatId", "isTelegramMessagesOn"],
  function (items) {
    apiInput.value = items.apiKey ? items.apiKey : ""
    apiKey = apiInput.value
    chatIdInput.value = items.chatId ? items.chatId : ""
    chatId = chatIdInput.value
    telegramMessagesCheckBox.checked = items.isTelegramMessagesOn
      ? items.isTelegramMessagesOn
      : false
    console.log("Settings retrieved", items)
  }
)

// onCheckBoxChange(telegramMessagesCheckBox, "isTelegramMessagesOn")

// تفعيل أو تعطيل الرسائل
telegramMessagesCheckBox.addEventListener("change", () => {
  if (apiInput.value && chatIdInput.value && apiKey && chatId) {
    chrome.storage.local.set(
      { isTelegramMessagesOn: telegramMessagesCheckBox.checked },
      function () {
        console.log("isTelegramMessagesOn", telegramMessagesCheckBox.checked)
      }
    )
  } else if (apiInput.value && chatIdInput.value) {
    telegramMessagesCheckBox.checked = false
    alert("plz click on the save btn first")
  } else {
    telegramMessagesCheckBox.checked = false
    alert("plz provide the token and the chatId first")
  }
})

// حفظ إعدادات التليجرام
saveBtn.onclick = () => {
  if (apiInput.value && chatIdInput.value) {
    chrome.storage.local.set(
      { apiKey: apiInput.value, chatId: chatIdInput.value },
      function () {
        console.log("Settings saved")
        alert("Settings saved")
      }
    )
  }
}
console.log("Settings saved")

// =======================
// زرار جلب وصف الوظيفة وفتح localhost
// =======================
document.getElementById("cool-btn").addEventListener("click", async () => {
  console.log("Button clicked!")

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab) {
    alert("افتح صفحة Upwork أولاً!")
    return
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        const url = window.location.href
        let el

        if (url.includes("details")) {
          el = document.querySelector('[data-test="Description Description"]')
        } else {
          const jobTile = document.querySelector(".job-tile.air3-card.air3-card-list")
          if (jobTile && jobTile.children[2] && jobTile.children[2].children[2]) {
            el = jobTile.children[2].children[2]
          }
        }

        return el ? el.innerText.trim() : "مش لاقي وصف الوظيفة"
      },
    },
    (results) => {
      const jobDescription = results?.[0]?.result
      console.log("Job Description:", jobDescription)

      if (jobDescription && jobDescription !== "مش لاقي وصف الوظيفة") {
        // ✅ نبعته للـ background
        chrome.runtime.sendMessage({
          action: "generateProposal",
          description: jobDescription,
        })

        // ✅ فتح صفحة React localhost فقط في تبويب جديد
        const reactAppUrl =
          "http://localhost:5173/?desc=" + encodeURIComponent(jobDescription)

        chrome.tabs.create({ url: reactAppUrl, active: true })
      } else {
        alert("لم يتم العثور على وصف الوظيفة!")
      }
    }
  )
})

// function onCheckBoxChange(checkBox, key) {
//   checkBox.addEventListener("change", () => {
//     chrome.storage.local.set({ [key]: checkBox.checked }, function () {
//       console.log(key, checkBox.checked)
//     })
//   })
// }
