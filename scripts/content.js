// ===================[ VARIABLES ]===================
let
  apiKey,
  chatId,
  isTelegramMessagesOn = false,
  waitingTime_getJobAlert = 5 * 60 * 1000, // 5 دقائق = 300000 ملي ثانية
  waitingTime_afterSearching = 15000;

// 

// ===================[ STORAGE SECTION ]===================
// chrome.storage.local.get(
//   ["apiKey", "chatId", "isTelegramMessagesOn"],
//   function (items) {
//     isTelegramMessagesOn = items.isTelegramMessagesOn || false;
//     apiKey = items.apiKey;
//     chatId = items.chatId;
//   }
// );

// chrome.storage.onChanged.addListener((changes) => {
//   if (changes.isTelegramMessagesOn) {
//     isTelegramMessagesOn = changes.isTelegramMessagesOn.newValue;
//   }
//   if (changes.apiKey) {
//     apiKey = changes.apiKey.newValue;
//   }
//   if (changes.chatId) {
//     chatId = changes.chatId.newValue;
//   }
// });

// ===================[ TELEGRAM NOTIFICATION ]===================
function sendTelegramMessage(apiKey, chatId, isTelegramMessagesOn, notificationText) {
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
      .catch((err) => console.error(err));
  }
}

// ===================[ CHROME NOTIFICATION ]===================
function sendChromeNotification(title = "new job", body, link, silent = true) {
  if (!silent) {
    try {
      const audio = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-969-isnt-it.mp3");
      audio.play();
    } catch (error) {
      console.error(error);
    }
  }

  const notification = new Notification(title, { body });
  notification.onclick = (event) => {
    event.preventDefault();
    window.open(link, "_blank");
  };
}

// ===================[ STORAGE HANDLERS ]===================
const getJobStorageValues = (jobId) => {
  const searchInput = document.querySelector('input[aria-labelledby="search-bar-label"]');
  const keyName = `lastJobTestKey-${searchInput.value}`;
  return {
    keyName,
    currentJobKey: `${jobId}-${searchInput.value}`,
    lastJobTestKey: localStorage.getItem(keyName)
  };
};

const isJobAlreadyAlerted = (jobId) => {
  const { currentJobKey, lastJobTestKey } = getJobStorageValues(jobId);
  return currentJobKey === lastJobTestKey;
};

// ===================[ MAIN RUN FUNCTION ]===================
function run() {
  window.addEventListener("load", () => {
    console.log("Page loaded");
    let job = document.querySelector(".job-tile.air3-card.air3-card-list");

    if (!job) {
      console.log("No job found on the page");
      return;
    }

    if (isJobAlreadyAlerted(job.dataset.testKey)) {
      console.log("No new job detected");
      sendChromeNotification("No new job detected", "No new job detected", "https://www.upwork.com/nx/search/");
      return;
    }

    getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn, job);
    console.log("New job detected");
    sendChromeNotification("New job detected", "New job detected", "https://www.upwork.com/nx/search/");
  });
}

// ===================[ JOB DESCRIPTION PARSER ]===================
function getJobDescription(job) {
  try {
    const name = job?.children[1]?.children[0]?.children[1]?.children[0]?.children[0]?.innerText;
    const level = job?.children[2]?.children[1]?.children[1]?.innerText;
    const type = job?.children[2]?.children[1]?.children[0]?.innerText;
    const priceWord = job?.children[2]?.children[1]?.children[2]?.children[1]?.innerText;
    const price = priceWord && priceWord.length > 40 ? "hourly" : priceWord;

    const statsElement = document.querySelector('li[data-qa="client-job-posting-stats"]');
    const statsText = statsElement ? statsElement.innerText : "N/A";
    const divElement = document.querySelector('div[data-qa="client-hires"]');
    const divText = divElement ? divElement.innerText : "N/A";

    const rateElement = job?.children[2]?.children[0]?.children[1]?.children[0]?.children[0]?.children[0]?.children[3];
    const rate = rateElement ? rateElement.innerText : "N/A";
    const country = job?.children[2]?.children[0]?.children[3]?.children[0]?.innerText;
    const spent = `spent: ${job?.children[2]?.children[0]?.children[2]?.children[0]?.children[0]?.innerText}`;

    const jobLink = job?.children[1].children[0].children[1].children[0].children[0].children[0].href;
    const connectElement = document.querySelector('div[data-test="ConnectsDesktop"]');
    const requiredConnects = connectElement ? connectElement.children[0].innerText : "Not Found";

    const getEllipsis = (text) => (text && text.length > 20 ? text.slice(0, 30) + "..." : text);
    const jobDescription = document.querySelector('[data-test="Description Description"]').innerText;

    return {
      description: `${price}, ${rate}⭐︎, ${statsText}, ${country}`,
      link: jobLink,
      title: getEllipsis(name),
      rate: parseFloat(rate) || 0,
    };
  } catch (error) {
    console.error("Error constructing job description:", error);
    return null;
  }
}

// ===================[ ALERT SYSTEM ]===================
function getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn, job) {
  job.click();

  setTimeout(() => {
    const jobDetails = getJobDescription(job);

    if (
      jobDetails &&
      jobDetails.rate >= 4 &&
      !jobDetails.description.includes("hrs/week") &&
      !jobDetails.description.includes("hourly")
    ) {
      const { description, link, title } = jobDetails;
      sendChromeNotification(title, description, link, false);
    }

    setTimeout(() => {
      const closingButton = document.querySelector(".d-none.d-md-flex.air3-slider-prev-btn");
      if (closingButton) closingButton.click();
    }, 30000);
  }, waitingTime_afterSearching);

  const { currentJobKey, keyName } = getJobStorageValues(job.dataset.testKey);
  localStorage.setItem(keyName, currentJobKey);
}

// ===================[ NOTIFICATION PERMISSION ]===================
if (!("Notification" in window))
  alert("This browser does not support desktop notification");
else if (Notification.permission === "granted") run();
else if (Notification.permission !== "denied")
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") run();
  });

// ===================[ PAGE RELOAD TIMER ]===================
setTimeout(() => {
  const searchInput = document.querySelector('input[aria-labelledby="search-bar-label"]');
  if (searchInput.value.length > 0) {
    console.log("Page reloaded");
    location.reload();
  } else {
    console.log("input is empty");
  }
}, waitingTime_getJobAlert);

// content.js
console.log("✅ content.js loaded on Upwork page");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getJobDescription") {
    const url = window.location.href;
    let el;

    // لو اللينك فيه كلمة details
    if (url.includes("details")) {
      el = document.querySelector('[data-test="Description Description"]');
    } 
    // لو اللينك مفيهوش كلمة details
    else {
      const jobTile = document.querySelector(".job-tile.air3-card.air3-card-list");
        el = jobTile.children[2].children[2];
    }

    const description = el ? el.innerText.trim() : "مش لاقي وصف الوظيفة";
    sendResponse({ description });
  }
});



