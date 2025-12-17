// ===================[ VARIABLES ]===================
let apiKey,
  chatId,
  isTelegramMessagesOn = false,
  waitingTime_getJobAlert = 15 * 60 * 1000, // 15 دقيقة
  waitingTime_afterSearching = 15000;

let savedSalaryType, savedMinHire, savedMaxHire, savedMinRate, savedMaxRate;

let name, level, type, priceWord;
let statsElement, statsText, divElement, divText;
let rateElement, rate, country, spent;
let jobLink,
  connectElement,
  requiredConnects,
  getEllipsis,
  jobDescription,
  jobSalaryType;

// ===================[ GET SAVED SETTINGS ]===================
chrome.storage.local.get(
  [
    "salaryType",
    "minHire",
    "maxHire",
    "minRate",
    "maxRate",
    "apiKey",
    "chatId",
    "isTelegramMessagesOn",
  ],
  (items) => {
    savedSalaryType = items.salaryType;
    savedMinHire = items.minHire;
    savedMaxHire = items.maxHire;
    savedMinRate =
      items.minRate !== undefined
        ? parseFloat(items.minRate).toFixed(1)
        : undefined;
    savedMaxRate =
      items.maxRate !== undefined
        ? parseFloat(items.maxRate).toFixed(1)
        : undefined;

    apiKey = items.apiKey;
    chatId = items.chatId;
    isTelegramMessagesOn = items.isTelegramMessagesOn || false;

    console.log("✅ Saved Settings loaded in content.js:", {
      salaryType: savedSalaryType,
      minHire: savedMinHire !== undefined ? savedMinHire + "%" : undefined,
      maxHire: savedMaxHire !== undefined ? savedMaxHire + "%" : undefined,
      minRate: savedMinRate,
      maxRate: savedMaxRate,
      apiKey,
      chatId,
      isTelegramMessagesOn,
    });
  }
);

// ===================[ TELEGRAM NOTIFICATION ]===================
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
        if (!response.ok) {
          console.error("Telegram error:", response);
        }
      })
      .catch((err) => console.error(err));
  }
}

// ===================[ CHROME NOTIFICATION ]===================
function sendChromeNotification(title = "new job", body, link, silent = true) {
  if (!silent) {
    try {
      const audio = new Audio(
        "https://notificationsounds.com/storage/sounds/file-sounds-969-isnt-it.mp3"
      );
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

// ===================[ JOB DESCRIPTION PARSER ]===================
function getJobDescription(job) {
  try {
    name =
      job?.children[1]?.children[0]?.children[1]?.children[0]?.children[0]
        ?.innerText;
    level = job?.children[2]?.children[1]?.children[1]?.innerText;
    type = job?.children[2]?.children[1]?.children[0]?.innerText;
    priceWord =
      job?.children[2]?.children[1]?.children[2]?.children[1]?.innerText;

    statsElement = document.querySelector(
      'li[data-qa="client-job-posting-stats"]'
    );
    statsText = statsElement ? statsElement.innerText : "N/A";
    divElement = document.querySelector('div[data-qa="client-hires"]');
    divText = divElement ? divElement.innerText : "N/A";

    rateElement =
      job?.children[2]?.children[0]?.children[1]?.children[0]?.children[0]
        ?.children[0]?.children[3];
    rate = rateElement ? parseFloat(rateElement.innerText).toFixed(1) : 0.0;
    country =
      job?.children[2]?.children[0]?.children[3]?.children[0]?.innerText;
    spent = `spent: ${job?.children[2]?.children[0]?.children[2]?.children[0]?.children[0]?.innerText}`;

    jobLink =
      job?.children[1].children[0].children[1].children[0].children[0]
        .children[0].href;
    connectElement = document.querySelector('div[data-test="ConnectsDesktop"]');
    requiredConnects = connectElement
      ? connectElement.children[0].innerText
      : "Not Found";

    getEllipsis = (text) =>
      text && text.length > 20 ? text.slice(0, 30) + "..." : text;
    jobDescription =
      document.querySelector('[data-test="Description Description"]')
        ?.innerText || "N/A";
    jobSalaryType =
      job?.children[2]?.children[1]?.children[0]?.innerText || null;

    return {
      description: `${priceWord}, ${rate}⭐︎, ${statsText}, ${country}`,
      link: jobLink,
      title: getEllipsis(name),
      rate: parseFloat(rate),
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
    jobSalaryType = job?.children[2]?.children[1]?.children[0]?.innerText.slice(
      0,
      3
    );

    const hireRate = parseFloat(
      document
        .querySelector('li[data-qa="client-job-posting-stats"]')
        .children[1].innerText.slice(0, 3)
    );
    //     const ratingEl = document.querySelectorAll(".air3-rating-foreground")[9];

    // if (!ratingEl) {
    //   console.log("Not found");
    // } else {

    //   const parentWidth = ratingEl.parentElement.offsetWidth;
    //   const currentWidth = ratingEl.offsetWidth;

    //   const widthPercent = (currentWidth / parentWidth) * 100;
    //   const rating = (widthPercent / 100) * 5;

    //   console.log("⭐ Rating:", rating.toFixed(1), "/ 5");
    // }

    const jobRate = parseFloat(jobDetails.rate) || 0;

    // تحقق من الـ Salary Type
    const typeMatch =
      (savedSalaryType === "Hourly" && jobSalaryType === "Hou") ||
      (savedSalaryType === "Fixed price" && jobSalaryType === "Fix");

    // تحقق من الـ Hire Rate والـ Job Rate
    const statsLi = document.querySelector(
      'li[data-qa="client-job-posting-stats"]'
    );
    console.log(hireRate);
    const hireRateMatch = hireRate >= savedMinHire && hireRate <= savedMaxHire;
    const jobRateMatch = jobRate >= savedMinRate && jobRate <= savedMaxRate;

    if (typeMatch && hireRateMatch && jobRateMatch) {
      sendChromeNotification(
        jobDetails.title,
        jobDetails.description,
        jobDetails.link,
        false
      );
    }

    setTimeout(() => {
      const closingButton = document.querySelector(
        ".d-none.d-md-flex.air3-slider-prev-btn"
      );
      if (closingButton) closingButton.click();
    }, 30000);
  }, waitingTime_afterSearching);

  const { currentJobKey, keyName } = getJobStorageValues(job.dataset.testKey);
  localStorage.setItem(keyName, currentJobKey);
}

// ===================[ STORAGE HELPERS ]===================
const getJobStorageValues = (jobId) => {
  const searchInput = document.querySelector(
    'input[aria-labelledby="search-bar-label"]'
  );
  const keyName = `lastJobTestKey-${searchInput?.value}`;
  return {
    keyName,
    currentJobKey: `${jobId}-${searchInput?.value}`,
    lastJobTestKey: localStorage.getItem(keyName),
  };
};

// ===================[ MAIN RUN FUNCTION ]===================
function run() {
  window.addEventListener("load", () => {
    console.log("Page loaded");
    let job_search = document.querySelector(
      ".job-tile.air3-card.air3-card-list"
    );
    let job_mainMenu = document.querySelectorAll(
      "section.air3-card-section.air3-card-hover"
    )[3];
    if (job_search) {
      const { currentJobKey, keyName } = getJobStorageValues(
        job_search.dataset.testKey
      );
      const savedKey = localStorage.getItem(keyName);
      // if (savedKey !== currentJobKey) {
      getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn, job_search);
      // } else {
      //   alert("لا يوجد وظائف جديدة في هذه الصفحة");
      // }
    } else if (job_mainMenu) {
      const { currentJobKey, keyName } = getJobStorageValues(
        job_mainMenu.dataset.testKey
      );
      const savedKey = localStorage.getItem(keyName);
      // if (savedKey !== currentJobKey) {
      getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn, job_mainMenu);
      // } else {
      //   alert("لا يوجد وظائف جديدة في هذه الصفحة");
      // }
    }
  });
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
  const searchInput = document.querySelector(
    'input[aria-labelledby="search-bar-label"]'
  );
  if (searchInput?.value.length > 0) {
    console.log("Page reloaded");
    location.reload();
  }
}, waitingTime_getJobAlert);

// ===================[ LISTENER FOR DESCRIPTION REQUEST ]===================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getJobDescription") {
    const url = window.location.href;
    let el;
    if (url.includes("details")) {
      // el = document.querySelector('[data-test="Description Description"]');
      el = document.querySelector("div.break.mt-2");
    } else {
      const jobTile = document.querySelector(
        ".job-tile.air3-card.air3-card-list"
      );
      el = jobTile?.children[2]?.children[2];
    }
    const description = el ? el.innerText.trim() : "مش لاقي وصف الوظيفة";
    sendResponse({ description });
  }
});
