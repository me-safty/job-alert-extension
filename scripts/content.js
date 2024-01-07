{
	// {} Block used to avoid setting global variables

	let apiKey,
		chatId,
		isTelegramMessagesOn = false,
		interval

	chrome.storage.local.get(
		["apiKey", "chatId", "isTelegramMessagesOn"],
		function (items) {
			isTelegramMessagesOn = items.isTelegramMessagesOn || false
			apiKey = items.apiKey
			chatId = items.chatId
		}
	)

	chrome.storage.onChanged.addListener((changes) => {
		if (changes.isTelegramMessagesOn) {
			isTelegramMessagesOn = changes.isTelegramMessagesOn.newValue
		}
		if (changes.apiKey) {
			apiKey = changes.apiKey.newValue
		}
		if (changes.chatId) {
			chatId = changes.chatId.newValue
		}
		clearInterval(interval)
		getJobAlert()
	})

	if (!("Notification" in window)) {
		alert("This browser does not support desktop notification")
	} else if (Notification.permission === "granted") {
		run()
	} else if (Notification.permission !== "denied") {
		Notification.requestPermission().then((permission) => {
			if (permission === "granted") {
				run()
			}
		})
	}

	function getJobAlert() {
		let job = document.querySelector(".job-tile.air3-card.air3-card-list")
		if (job) {
			interval = setInterval(() => {
				reloadJobs()
				setTimeout(() => {
					let newJob = document.querySelector(
						".job-tile.air3-card.air3-card-list"
					)
					if (job.dataset.testKey !== newJob.dataset.testKey) {
						sendChromeNotification(
							getJobDescription(newJob),
							newJob?.children[1].children[0].children[1].children[0]
								.children[0].children[0].href
						)
						sendTelegramMessage(
							apiKey,
							chatId,
							isTelegramMessagesOn,
							getJobDescription(newJob)
						)
						job = newJob
					}
				}, 3000)
			}, 10000)
		}
	}

	function sendTelegramMessage(
		apiKey,
		chatId,
		isTelegramMessagesOn,
		notificationText
	) {
		if (apiKey && chatId && isTelegramMessagesOn) {
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

			fetch(`https://api.telegram.org/bot${apiKey}/sendMessage`, options)
				.then((response) => response.json())
				.then((response) => {
					if (response.ok === false) {
						alert("the token or the chatId is wrong")
					}
				})
				.catch((err) => {
					console.error(err)
				})
		}
	}

	function getJobDescription(job) {
		const name =
			job?.children[1].children[0].children[1].children[0].children[0].innerText
		const level =
			job?.children[2].children[0].children[1].children[1].children[0].innerText
		const type =
			job?.children[2].children[0].children[1].children[0].children[0].innerText
		const prise =
			job?.children[2].children[0].children[1].children[2].children[1].innerText
		const rate =
			job?.children[2].children[0].children[0].children[1].children[0]
				.children[0].children[0].children[2].children[5].innerText
		const country =
			job?.children[2].children[0].children[0].children[3].children[0].innerText
		const spent = `spent: ${job?.children[2].children[0].children[0].children[2].children[0].children[0].innerText}`
		const jobLink =
			job?.children[1].children[0].children[1].children[0].children[0]
				.children[0].href

		return `${name}\n${level} - ${type}\n${prise} - ${rate} star - ${country} - ${spent} \n${jobLink}`
	}

	function sendChromeNotification(body, link) {
		const notification = new Notification("new job", {
			body,
		})
		notification.onclick = (event) => {
			event.preventDefault()
			window.open(link, "_blank")
		}
		// const knockDoor = new Audio(
		// 	"https://cms-artifacts.motionarray.com/content/motion-array/1297037/Knock_At_The_Door_mp3.mp3?Expires=2003734670657&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=gFm01Y~XUy5ZaV9Qbb1NkNAxBqw~W41yAd7pkZ3T4hrH64-eRgG2n2nLAvHfRZtHh32yp6uvCBZ7TMFk8-k0UJE47qfFc0vH4mmK23R9IWyp8BlXoklUvNmuIEHgjewGZ1eunytqu8bUtkyRtiUdQhICsz4CVLiAwnBeb4jvqfhk2qzwNZLLV57IrupVx2Ql5FRddSYjFxAV8T3Ibw75Ci1leB8DqAcDpLtsY~A57LGkUKypS2SThxNu1ks0Iccl87h0TJolYOYZqhvN7FCBNaKGDRnZLWq8tDYFmi2yEcmi7JO1Bw8-O7VhLwhV2r45104bdTykdL2Bk64AWx3iFQ__"
		// )
		// knockDoor.play()
	}

	function getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn) {
		let job = document.querySelector(".job-tile.air3-card.air3-card-list")

		if (job) {
			sendChromeNotification(
				getJobDescription(job),
				job?.children[1].children[0].children[1].children[0].children[0]
					.children[0].href
			)
			sendTelegramMessage(
				apiKey,
				chatId,
				isTelegramMessagesOn,
				getJobDescription(job)
			)
		}
	}

	function reloadJobs() {
		const openSearchBtn = document.querySelector(
			".air3-btn.air3-btn-link.px-2x.px-md-0.line-height-6x"
		)
		const arr = "qwertyuiopasfg".split("")
		const randomNum = Math.floor(Math.random() * arr.length)

		openSearchBtn.click()

		setTimeout(() => {
			const searchInput = document.querySelector("input#anyWords")
			const searchBtn = document.querySelector("[data-test='submit-button']")
			var inputEvent = new Event("input", {
				bubbles: true,
				cancelable: true,
			})
			searchInput.value = `${"frontend react NOT wordpress NOT shopify NOT webflow"}${
				arr[randomNum]
			}`
			searchInput.dispatchEvent(inputEvent)

			searchBtn.click()
		}, 1000)
	}

	function run() {
		window.addEventListener("load", () => {
			setTimeout(() => {
				getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn)
				getJobAlert()
			}, 3000)
		})
	}
}
