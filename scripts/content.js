{
  // {} Block used to avoid setting global variables

  const knockDoor = new Audio(
    "https://cms-artifacts.motionarray.com/content/motion-array/1297037/Knock_At_The_Door_mp3.mp3?Expires=2003734670657&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=gFm01Y~XUy5ZaV9Qbb1NkNAxBqw~W41yAd7pkZ3T4hrH64-eRgG2n2nLAvHfRZtHh32yp6uvCBZ7TMFk8-k0UJE47qfFc0vH4mmK23R9IWyp8BlXoklUvNmuIEHgjewGZ1eunytqu8bUtkyRtiUdQhICsz4CVLiAwnBeb4jvqfhk2qzwNZLLV57IrupVx2Ql5FRddSYjFxAV8T3Ibw75Ci1leB8DqAcDpLtsY~A57LGkUKypS2SThxNu1ks0Iccl87h0TJolYOYZqhvN7FCBNaKGDRnZLWq8tDYFmi2yEcmi7JO1Bw8-O7VhLwhV2r45104bdTykdL2Bk64AWx3iFQ__"
  )
  let key
  let chatId
  let isTelegramMessagesOn
  let interval

  chrome.storage.local.get(
    [
      "apiKey",
      "chatId",
      "isTelegramMessagesOn",
      //  "isNotificationSoundOn"
    ],
    function (items) {
      // isNotificationSoundOn = items.isNotificationSoundOn || false
      isTelegramMessagesOn = items.isTelegramMessagesOn || false
      if (isTelegramMessagesOn) {
        if (items.apiKey && items.chatId) {
          key = items.apiKey
          chatId = items.chatId
        } else {
          alert(
            "you must provide the api token and the chat id to make the messages work"
          )
        }
      }
      console.log(
        key,
        chatId,
        isTelegramMessagesOn,
        // isNotificationSoundOn,
        items
      )
    }
  )

  chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(changes, namespace, "key", key, "chat", chatId)

    isTelegramMessagesOn = changes.isTelegramMessagesOn
      ? changes.isTelegramMessagesOn.newValue
      : isTelegramMessagesOn

    key = changes.apiKey ? changes.apiKey.newValue : key
    chatId = changes.chatId ? changes.chatId.newValue : chatId
    clearInterval(interval)
    getJobAlert()

    console.log(changes, namespace)
  })

  // not working

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification")
  } else if (Notification.permission === "granted") {
    alert("to use the job alert extension, please click on the page first.")
    window.addEventListener("load", function () {
      getJobAlert()
    })
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        alert("to use the job alert extension, please click on the page first.")
        window.addEventListener("load", function () {
          getJobAlert()
        })
      }
    })
  }

  function getJobAlert() {
    let job = document.querySelector(
      ".up-card-section.up-card-list-section.up-card-hover"
    )
    if (job) {
      interval = setInterval(() => {
        document.querySelector(".up-btn.up-btn-primary").click()
        setTimeout((_) => {
          let newJob = document.querySelector(
            ".up-card-section.up-card-list-section.up-card-hover"
          )
          if (job.id !== newJob.id) {
            const body = getJobDescription(newJob)
            const notification = new Notification("upwork job", {
              body,
            })

            notification.onclick = (event) => {
              event.preventDefault()
              window.open(jobLink, "_blank")
            }

            const playPromise = knockDoor.play()
            if (playPromise !== undefined) {
              playPromise.catch(function (error) {
                console.log(error)
                alert("Please interact with the document first.")
              })
            }

            telegramMessages(key, chatId, isTelegramMessagesOn, body)

            job = newJob
          }
        }, 3000)
      }, 8000)
    }
  }
}

function telegramMessages(key, chatId, isTelegramMessagesOn, notificationText) {
  if (key && chatId && isTelegramMessagesOn) {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: notificationText,
        parse_mode: "None",
        disable_web_page_preview: false,
        disable_notification: false,
        reply_to_message_id: 0,
        chat_id: chatId,
      }),
    }

    fetch(`https://api.telegram.org/bot${key}/sendMessage`, options)
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => {
        alert("the token or the chatId is wrong")
        console.error(err)
      })
  }
}

function getJobDescription(job) {
  const name = job.children[0].children[0].children[1].innerText
  const level = job.children[1].children[0].children[0].children[1].innerText
  const type = job.children[1].children[0].children[0].children[0].innerText
  const prise = job.children[1].children[0].children[0].children[2].innerText
  const rate = +[
    ...job.children[1].children[4].children[1].children[0].children[0]
      .children[2].children,
  ]
    .at(-1)
    .innerText.split(" ")[2]
  const country =
    job?.children[1]?.children[4]?.children[3]?.children[1]?.innerText
  const spent = job.children[1].children[4].children[2].children[0].innerText
  const jobLink = job.children[0].children[0].children[1].children[0].href

  return `${name}\n${level} - ${type}\n${prise} - ${rate.toFixed(
    2
  )} star - ${country} - ${spent} \n${jobLink}`
}
