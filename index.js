const telegramMessagesCheckBox = document.querySelector("#telegram-messages")

const addTelegramApiSection = document.querySelector("section")
const btn = document.querySelector("#save")
const apiInput = document.querySelector("#telegram-api-key")
const chatIdInput = document.querySelector("#telegram-chat-id")
let apiKey
let chatId

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

telegramMessagesCheckBox.addEventListener("change", () => {
  if (apiInput.value && chatIdInput.value && apiKey && chatId) {
    chrome.storage.local.set(
      { isTelegramMessagesOn: telegramMessagesCheckBox.checked },
      function () {
        console.log(isTelegramMessagesOn, telegramMessagesCheckBox.checked)
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

// function onCheckBoxChange(checkBox, key) {
//   checkBox.addEventListener("change", () => {
//     chrome.storage.local.set({ [key]: checkBox.checked }, function () {
//       console.log(key, checkBox.checked)
//     })
//   })
// }
