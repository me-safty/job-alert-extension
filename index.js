const telegramMessagesCheckBox = document.querySelector("#telegram-messages")

const addTelegramApiSection = document.querySelector("section")
const btn = document.querySelector("button")
const apiInput = document.querySelector("#telegram-api-key")
const chatIdInput = document.querySelector("#telegram-chat-id")

btn.onclick = () => {
  if (apiInput.value && chatIdInput.value) {
    chrome.storage.sync.set(
      { apiKey: apiInput.value, chatId: chatIdInput.value },
      function () {
        console.log("Settings saved")
      }
    )
  }
}
