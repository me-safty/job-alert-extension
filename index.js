const telegramMessagesCheckBox = document.querySelector("#telegram-messages")
// const notificationSoundCheckBox = document.querySelector("#notification-sound")

const addTelegramApiSection = document.querySelector("section")
const btn = document.querySelector("button")
const apiInput = document.querySelector("#telegram-api-key")
const chatIdInput = document.querySelector("#telegram-chat-id")

chrome.storage.local.get(
  [
    "apiKey",
    "chatId",
    "isTelegramMessagesOn",
    // , "isNotificationSoundOn"
  ],
  function (items) {
    apiInput.value = items.apiKey ? items.apiKey : ""
    chatIdInput.value = items.chatId ? items.chatId : ""
    telegramMessagesCheckBox.checked = items.isTelegramMessagesOn
      ? items.isTelegramMessagesOn
      : false
    // notificationSoundCheckBox.checked = items.isNotificationSoundOn
    console.log("Settings retrieved", items)
  }
)

onCheckBoxChange(telegramMessagesCheckBox, "isTelegramMessagesOn")
// onCheckBoxChange(notificationSoundCheckBox, "isNotificationSoundOn")

btn.onclick = () => {
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

function onCheckBoxChange(checkBox, key) {
  checkBox.addEventListener("change", () => {
    chrome.storage.local.set({ [key]: checkBox.checked }, function () {
      console.log(key, checkBox.checked)
    })
  })
}
