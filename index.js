const telegramMessagesCheckBox = document.querySelector("#telegram-messages")
const apiInput = document.querySelector("#telegram-api-key")
const chatIdInput = document.querySelector("#telegram-chat-id")
const saveBtn = document.querySelector("#save")
const notesBox = document.getElementById("notes-box")
const saveNotesBtn = document.getElementById("save-btn")
const message = document.getElementById("message")

let apiKey, chatId

// جلب الإعدادات والملاحظات المحفوظة
chrome.storage.local.get(
  ["apiKey", "chatId", "isTelegramMessagesOn", "notes"],
  function (items) {
    apiInput.value = items.apiKey || ""
    chatIdInput.value = items.chatId || ""
    apiKey = apiInput.value
    chatId = chatIdInput.value
    telegramMessagesCheckBox.checked = items.isTelegramMessagesOn || false
    if (items.notes) notesBox.value = items.notes
  }
)

// حفظ الملاحظات عند الضغط على Save
saveNotesBtn.addEventListener("click", () => {
  const notes = notesBox.value.trim()
  chrome.storage.local.set({ notes }, () => {
    message.style.display = "block"
    setTimeout(() => (message.style.display = "none"), 2000)
  })
})

// زر جلب الوصف وفتح React
document.getElementById("cool-btn").addEventListener("click", async () => {
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
      if (jobDescription && jobDescription !== "مش لاقي وصف الوظيفة") {
        // جلب الملاحظات من localStorage
        chrome.storage.local.get(["notes"], (res) => {
          const notes = res.notes || ""
          const finalText = jobDescription + (notes ? "\n\n" + notes : "")
          const reactAppUrl =
            "http://localhost:5173/?desc=" +
            encodeURIComponent(finalText)
          chrome.tabs.create({ url: reactAppUrl, active: true })

          // إرسال الوصف + الملاحظات للـ background إذا محتاج
          chrome.runtime.sendMessage({
            action: "generateProposal",
            description: finalText,
          })
        })
      } else {
        alert("لم يتم العثور على وصف الوظيفة!")
      }
    }
  )
})
