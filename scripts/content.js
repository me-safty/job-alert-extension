{
  // {} Block used to avoid setting global variables

  let key
  let chatId

  chrome.storage.sync.get(["apiKey", "chatId"], function (items) {
    if (items.apiKey && items.chatId) {
      key = items.apiKey
      chatId = items.chatId
    } else {
      alert(
        "you must provied the api token and the chat id to make the messages work"
      )
    }
    console.log(key, chatId, items)
  })

  chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(changes, namespace, "key", key, "chat", chatId)

    key = changes.apiKey ? changes.apiKey.newValue : key
    chatId = changes.chatId ? changes.chatId.newValue : chatId

    console.log(changes, namespace, "key", key, "chat", chatId)
  })

  const knockDoor = new Audio(
    "https://cms-artifacts.motionarray.com/content/motion-array/1297037/Knock_At_The_Door_mp3.mp3?Expires=2003734670657&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=gFm01Y~XUy5ZaV9Qbb1NkNAxBqw~W41yAd7pkZ3T4hrH64-eRgG2n2nLAvHfRZtHh32yp6uvCBZ7TMFk8-k0UJE47qfFc0vH4mmK23R9IWyp8BlXoklUvNmuIEHgjewGZ1eunytqu8bUtkyRtiUdQhICsz4CVLiAwnBeb4jvqfhk2qzwNZLLV57IrupVx2Ql5FRddSYjFxAV8T3Ibw75Ci1leB8DqAcDpLtsY~A57LGkUKypS2SThxNu1ks0Iccl87h0TJolYOYZqhvN7FCBNaKGDRnZLWq8tDYFmi2yEcmi7JO1Bw8-O7VhLwhV2r45104bdTykdL2Bk64AWx3iFQ__"
  )

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification")
  } else if (Notification.permission === "granted") {
    getJobAlert()
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getJobAlert()
      }
    })
  }

  function getJobAlert() {
    alert("to use the (job alert extention), please click on the page firsr.")
    window.addEventListener("load", function () {
      let job = document.querySelector(
        ".up-card-section.up-card-list-section.up-card-hover"
      )
      if (job) {
        setInterval(() => {
          document.querySelector(".up-btn.up-btn-primary").click()
          setTimeout((_) => {
            let newJob = document.querySelector(
              ".up-card-section.up-card-list-section.up-card-hover"
            )
            if (job.id !== newJob.id) {
              const name = newJob.children[0].children[0].children[1].innerText
              const level =
                newJob.children[1].children[0].children[0].children[1].innerText
              const type =
                newJob.children[1].children[0].children[0].children[0].innerText
              const prise =
                newJob.children[1].children[0].children[0].children[2].innerText
              const rate =
                newJob.children[1].children[4].children[1].children[0]
                  .children[0].children[1].children.length
              const country =
                newJob.children[1].children[4].children[3].children[1].innerText
              const spent =
                newJob.children[1].children[4].children[2].children[0].innerText
              const jobLink =
                newJob.children[0].children[0].children[1].children[0].href
              const title = "upwork job"
              const icon = ""
              const body = `${name}\n${level} - ${type}\n${prise} - ${rate} ⭐ - ${country} - ${spent}`
              const notification = new Notification(title, { body, icon })
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

              if (key && chatId) {
                const options = {
                  method: "POST",
                  headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    text: `${name}\n${level} - ${type}\n${prise} - ${rate} ⭐ - ${country} - ${spent} \n${jobLink}`,
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
                    alert("the token or the chatid is wrong")
                    console.error(err)
                  })
              }

              job = newJob
            }
          }, 3500)
        }, 13000)
      }
    })
  }
}
