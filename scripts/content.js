{
	// {} Block used to avoid setting global variables
  
	let apiKey,
	  chatId,
	  isTelegramMessagesOn = false,
	  interval;
  
	chrome.storage.local.get(
	  ["apiKey", "chatId", "isTelegramMessagesOn"],
	  function (items) {
		isTelegramMessagesOn = items.isTelegramMessagesOn || false;
		apiKey = items.apiKey;
		chatId = items.chatId;
	  }
	);
  
	chrome.storage.onChanged.addListener((changes) => {
	  if (changes.isTelegramMessagesOn) {
		isTelegramMessagesOn = changes.isTelegramMessagesOn.newValue;
	  }
	  if (changes.apiKey) {
		apiKey = changes.apiKey.newValue;
	  }
	  if (changes.chatId) {
		chatId = changes.chatId.newValue;
	  }
	  clearInterval(interval);
	  getJobAlert();
	});
  
	if (!("Notification" in window)) {
	  alert("This browser does not support desktop notification");
	} else if (Notification.permission === "granted") {
	  run();
	} else if (Notification.permission !== "denied") {
	  Notification.requestPermission().then((permission) => {
		if (permission === "granted") {
		  run();
		}
	  });
	}
	//first it open the jops page then
	function getJobAlert() {
	  //(jop)
	  let job = document.querySelector(".job-tile.air3-card.air3-card-list");
	  console.log(
		job,
		document.querySelector(".job-tile.air3-card.air3-card-list")
	  );
	  //jop = the first jop in the page
	  if (job) {
		interval = setInterval(() => {
		  reloadJobs();
		  setTimeout(() => {
			let newJob = document.querySelector(
			  ".job-tile.air3-card.air3-card-list"
			);
			if (job.dataset.testKey !== newJob.dataset.testKey) {
			  console.log("new jop");
			  newJob.click();
			  setTimeout(() => {
				sendChromeNotification(
				  getJobDescription(newJob),
				  newJob?.children[1].children[0].children[1].children[0]
					.children[0].children[0].href
				);
				sendTelegramMessage(
				  apiKey,
				  chatId,
				  isTelegramMessagesOn,
				  getJobDescription(newJob)
				);
			  }, 7000);
			  setTimeout(() => {
				const button = document.querySelector(
				  '[data-test="slider-close-desktop"]'
				);
				button.click();
			  }, 10000);
			  job = newJob;
			}
		  }, 3000);
		}, 20000);
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
		};
  
		fetch(`https://api.telegram.org/bot${apiKey}/sendMessage`, options)
		  .then((response) => response.json())
		  .then((response) => {
			if (response.ok === false) {
			  alert("the token or the chatId is wrong");
			}
		  })
		  .catch((err) => {
			console.error(err);
		  });
	  }
	}
  
	function getJobDescription(job) {
	  try {
		const name =
		  job?.children[1]?.children[0]?.children[1]?.children[0]?.children[0]
			?.innerText;
		const level = job?.children[2]?.children[1]?.children[1]?.innerText;
		const type = job?.children[2]?.children[1]?.children[0]?.innerText;
		const price = job?.children[2]?.children[1]?.children[2]?.innerText;
		const rate =
		  job?.children[2]?.children[0]?.children[1]?.children[0]?.children[0]
			?.children[0]?.children[3]?.innerText;
		const country =
		  job?.children[2]?.children[0]?.children[3]?.children[0]?.innerText;
		const spent = `spent: ${job?.children[2]?.children[0]?.children[2]?.children[0]?.children[0]?.innerText}`;
		const jobLink =
		  job?.children[1]?.children[0]?.children[1]?.children[0]?.children[0]
			?.children[0]?.href;
  
		const connectElement = document.querySelector(
		  'div[data-test="ConnectsDesktop"]'
		);
		const requiredConnects = connectElement
		  ? connectElement.children[0].innerText
		  : "Not Found";
  
		const clientData =  document.querySelector('[data-test="about-client-container AboutClientUserShared AboutClientUser"]').innerText;
  
		return `${name}\n${level}\n${type}\n4-Price: ${price}\n5-Rate: ${rate} star - 6-Country: ${country} 7-Spent: ${spent}\n Connects: ${requiredConnects}  \n${jobLink}\n${clientData}`;
	  } catch (error) {
		console.error("Error constructing job description:", error);
		return null;
	  }
	}
  
	function sendChromeNotification(body, link) {
	  const notification = new Notification("new job", {
		body,
	  });
	  notification.onclick = (event) => {
		event.preventDefault();
		window.open(link, "_blank");
	  };
	  // const knockDoor = new Audio(
	  // 	"https://cms-artifacts.motionarray.com/content/motion-array/1297037/Knock_At_The_Door_mp3.mp3?Expires=2003734670657&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=gFm01Y~XUy5ZaV9Qbb1NkNAxBqw~W41yAd7pkZ3T4hrH64-eRgG2n2nLAvHfRZtHh32yp6uvCBZ7TMFk8-k0UJE47qfFc0vH4mmK23R9IWyp8BlXoklUvNmuIEHgjewGZ1eunytqu8bUtkyRtiUdQhICsz4CVLiAwnBeb4jvqfhk2qzwNZLLV57IrupVx2Ql5FRddSYjFxAV8T3Ibw75Ci1leB8DqAcDpLtsY~A57LGkUKypS2SThxNu1ks0Iccl87h0TJolYOYZqhvN7FCBNaKGDRnZLWq8tDYFmi2yEcmi7JO1Bw8-O7VhLwhV2r45104bdTykdL2Bk64AWx3iFQ__"
	  // )
	  // knockDoor.play()
	}
  
	function getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn) {
	  let job = document.querySelector(".job-tile.air3-card.air3-card-list");
	  console.log(
		job,
		document.querySelector(".job-tile.air3-card.air3-card-list")
	  );
  
	  if (job) {
		job.click();
		setTimeout(() => {
		  sendChromeNotification(
			getJobDescription(job), //i must to correct the details in down
			job?.children[1].children[0].children[1].children[0].children[0]
			  .children[0].href
		  );
		  sendTelegramMessage(
			apiKey,
			chatId,
			isTelegramMessagesOn,
			getJobDescription(job)
		  );
		}, 7000);
		setTimeout(() => {
		  const button = document.querySelector(
			'[data-test="slider-close-desktop"]'
		  );
		  button.click();
		}, 10000);
	  }
	}
	let toogle = true;
	function reloadJobs() {
	  const searchInput = document.querySelector(
		'input[aria-labelledby="search-bar-label"]'
	  );
	  if (searchInput.value.length > 0) {
		if (toogle) {
		  searchInput.value = searchInput.value.slice(
			searchInput.value.length / 2 + 1
		  );
		  searchInput.disabled = false;
		  searchInput.style.opacity= 1;
		} else {
		  searchInput.value = searchInput.value + " " + searchInput.value;
		  searchInput.disabled = true;
		  searchInput.style.opacity= 0;
		}
		toogle = !toogle;
		console.log(toogle);
		searchInput.dispatchEvent(
		  new Event("input", { bubbles: true, cancelable: true })
		);
		searchInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  
		// Trigger a form submit or search function (you may need to adapt this depending on the page structure)
	  }
	}
	function run() {
	  window.addEventListener("load", () => {
		setTimeout(() => {
		  getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn);
		  getJobAlert();
		}, 3000);
	  });
	}
  }
  //1 run() when load wait 3s then start
  //2 getAlertForFirstJob(); then 3 getJobAlert()
  // 2 getAlertForFirstJob() select the jop class and if jop is defined start chrome including details from 4 getjopdescription(newjop)and telegram
  // 3 getJobAlert() i will ask safty about why he didn't do that getJopAlert(jop), select the jop class and if jop is defined
  // it start to set interval every 5 seconds to start 5 reloadJops()it,s about clicking the input and typing the words then click enter
  //                then after reloading it wait 3s then select the first jop in the new page and if there is diffrence
  //                it send notification including the details from 4 getjopdescription(newjop) then jop = new jop
  //
  //
  //
  //
  //
  //
  //
  