{
  const checkbox = document.getElementById("toggleCheckbox");
  let apiKey,
    chatId,
    // newValue,
    isTelegramMessagesOn = false,
    // toogle = true,
    waitingTime_getJobAlert = 60000,
    waitingTime_afterSearching = 10000;

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
    reclearInterval(getJobAlert);

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
  // function getJobAlert(job, lastJobTestKey) {
  //   const searchInput = document.querySelector(
  //     'input[aria-labelledby="search-bar-label"]'
  //   );
  //   const closingButton =
  //     document.querySelector(".d-none.d-md-flex.air3-slider-prev-btn") || null;

  //     if (searchInput.value.length > 0) {
  //       // Step 1: Click the close button if it exists
  //       if (closingButton) {
  //         closingButton.click();
  //       }
  //       setTimeout(() => {
  //         if (job.dataset.testKey !== lastJobTestKey) {
  //           job.click();
  //           setTimeout(() => {
  //             sendChromeNotification(
  //               getJobDescription(job),
  //               job?.children[1].children[0].children[1].children[0]
  //                 .children[0].children[0].href
  //             );
  //             sendTelegramMessage(
  //               apiKey,
  //               chatId,
  //               isTelegramMessagesOn,
  //               getJobDescription(job)
  //             );
  //           }, waitingTime_afterSearching);
  //         }
  //       }, 2000);
  //       setTimeout(() => {
  //         location.reload();
  //       }
  //       , waitingTime_getJobAlert);
  //     }
  // }
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
  function sendChromeNotification(body, link) {
    const notification = new Notification("new job", {
      body,
    });
    notification.onclick = (event) => {
      event.preventDefault();
      window.open(link, "_blank");
    };
  }


  
  function getJobDescription(job) {
    try {
      const name =
        job?.children[1]?.children[0]?.children[1]?.children[0]?.children[0]
          ?.innerText;
      const level = job?.children[2]?.children[1]?.children[1]?.innerText;
      const type = job?.children[2]?.children[1]?.children[0]?.innerText;
      const price = job?.children[2]?.children[1]?.children[2]?.innerText;
      const statsElement =
        document.querySelector('li[data-qa="client-job-posting-stats"]')
          .innerText || null;
      const divElement =
        document.querySelector('div[data-qa="client-hires"]').innerText || null;
      const rate =
        job?.children[2]?.children[0]?.children[1]?.children[0]?.children[0]
          ?.children[0]?.children[3]?.innerText;
      const country =
        job?.children[2]?.children[0]?.children[3]?.children[0]?.innerText;
      const spent = `spent: ${job?.children[2]?.children[0]?.children[2]?.children[0]?.children[0]?.innerText}`;
      // const jobLink =
      //   job?.children[1]?.children[0]?.children[1]?.children[0]?.children[0]
      //     ?.children[0]?.href;

      const connectElement = document.querySelector(
        'div[data-test="ConnectsDesktop"]'
      );
      const requiredConnects = connectElement
        ? connectElement.children[0].innerText
        : "Not Found";

      return `${name}
        2- ${level}
        3- ${type}
        4- ${statsElement}
        5- ${spent} || ${divElement}
        6- ${requiredConnects}
        7- Price: ${price}
        8- Rate: ${rate} star
        9- Country: ${country}
        `;
    } catch (error) {
      console.error("Error constructing job description:", error);
      return null;
    }
  }



  function getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn, job) {
    job.click();
    setTimeout(() => {
      sendChromeNotification(
        getJobDescription(job),
        job?.children[1].children[0].children[1].children[0].children[0]
          .children[0].href
      );
      sendTelegramMessage(
        apiKey,
        chatId,
        isTelegramMessagesOn,
        getJobDescription(job)
      );
      setTimeout(() => {
        const closingButton = document.querySelector(
          ".d-none.d-md-flex.air3-slider-prev-btn"
        );

        if (closingButton) {
          closingButton.click();
        } else {
          ("closing button not found");
        }
      }, 5000);
    }, waitingTime_afterSearching);
    localStorage.setItem("lastJobTestKey", job.dataset.testKey);
  }



  function run() {
    window.addEventListener("load", () => {
      console.log("Page loaded");
      let lastJobTestKey = localStorage.getItem("lastJobTestKey");
      let job = document.querySelector(".job-tile.air3-card.air3-card-list");

      if (job) {
        if (job.dataset.testKey !== lastJobTestKey) {
          console.log("New job detected");
          getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn, job);
        } else {
          console.log("No new job detected");
        }
      } else {
        console.log("No job found on the page");
      }
    });
  }



  const searchInput = document.querySelector(
    'input[aria-labelledby="search-bar-label"]'
  );

  setTimeout(() => {
    if (searchInput.value.length > 0) {
      console.log("Page reloaded");
      location.reload();
    } else {
      ("input is empty");
    }
  }, waitingTime_getJobAlert);
  // function getJobAlert() {
  //   console.log("getJobAlert function called");
  //   const searchInput = document.querySelector(
  //     'input[aria-labelledby="search-bar-label"]'
  //   );
  //   let lastJobTestKey = localStorage.getItem("lastJobTestKey"); // Retrieve the last processed job's test key

  //   setInterval(() => {
  //     if (searchInput.value.length > 0) {
  //       // Step 1: Click the close button if it exists
  //       const closingButton = document.querySelector(
  //         ".d-none.d-md-flex.air3-slider-prev-btn"
  //       );
  //       if (closingButton) {
  //         closingButton.click();
  //       }

  //       // Step 2: Find the current job tile
  //       const job = document.querySelector(
  //         ".job-tile.air3-card.air3-card-list"
  //       );
  //       if (!job) return; // Exit if no job tile is found

  //       // Step 3: Compare the current job's test key with the saved one
  //       if (job.dataset.testKey !== lastJobTestKey) {
  //         // A new job has been detected
  //         job.click();

  //         setTimeout(() => {
  //           sendChromeNotification(
  //             getJobDescription(job),
  //             job?.children[1]?.children[0]?.children[1]?.children[0]
  //               ?.children[0]?.children[0]?.href
  //           );
  //           sendTelegramMessage(
  //             apiKey,
  //             chatId,
  //             isTelegramMessagesOn,
  //             getJobDescription(job)
  //           );

  //           // Update the last processed job's test key in local storage
  //           lastJobTestKey = job.dataset.testKey;
  //           localStorage.setItem("lastJobTestKey", lastJobTestKey);
  //         }, waitingTime_afterSearching);
  //       }

  //       // Step 4: Reload the page to refresh the DOM
  //       location.reload();
  //     }
  //   }, waitingTime_getJobAlert);
  // }
  // function getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn) {
  //   let job = document.querySelector(".job-tile.air3-card.air3-card-list");
  //   if (job) {
  //     job.click();
  //     setTimeout(() => {
  //       sendChromeNotification(
  //         getJobDescription(job),
  //         job?.children[1]?.children[0]?.children[1]?.children[0]?.children[0]
  //           ?.children[0]?.href
  //       );
  //       sendTelegramMessage(
  //         apiKey,
  //         chatId,
  //         isTelegramMessagesOn,
  //         getJobDescription(job)
  //       );
  //     }, waitingTime_afterSearching);
  //   }
  // }
  // function setNativeReactValue(element, value) {
  //   const lastValue = element.value;
  //   element.value = value;

  //   const event = new Event("input", { bubbles: true });

  //   const tracker = element._valueTracker;
  //   if (tracker) {
  //     tracker.setValue(lastValue);
  //   }

  //   element.dispatchEvent(event);
  // }

  // function simulateTyping(element, text, callback) {
  //   let index = 0;

  //   function typeNextChar() {
  //     if (index <= text.length) {
  //       setNativeReactValue(element, text.slice(0, index));
  //       index++;
  //       const delay = Math.random() * 100 + 50;
  //       setTimeout(typeNextChar, delay);
  //     } else {
  //       if (callback) callback();
  //     }
  //   }

  //   typeNextChar();
  // }

  // function reloadJobs() {
  // return new Promise((resolve) => {
  //   const searchInput = document.querySelector(
  //     'input[aria-labelledby="search-bar-label"]'
  //   );
  //     const closingButton =
  //       document.querySelector(".d-none.d-md-flex.air3-slider-prev-btn") ||
  //       null;

  //     if (searchInput.value.length > 0) {
  //       if (closingButton) closingButton.click();
  //       setTimeout(() => {
  // let newValue;

  // if (toogle) {
  //   newValue = searchInput.value.slice(
  //     searchInput.value.length / 2 + 1
  //   );
  // } else {
  //   newValue = searchInput.value + " " + searchInput.value;
  // }

  // searchInput.focus();

  // simulateTyping(searchInput, newValue, () => {
  // const delayAfterTyping = Math.random() * 300 + 200;

  // setTimeout(() => {
  //   searchInput.dispatchEvent(
  //     new KeyboardEvent("keydown", {
  //       key: "Enter",
  //       code: "Enter",
  //       keyCode: 13,
  //       which: 13,
  //       bubbles: true,
  //     })
  //   );

  //   searchInput.dispatchEvent(
  //     new KeyboardEvent("keyup", {
  //       key: "Enter",
  //       code: "Enter",
  //       keyCode: 13,
  //       which: 13,
  //       bubbles: true,
  //     })
  //   );

  //   resolve();
  // }, delayAfterTyping);
  // });

  // toogle = !toogle;
  //       }, 2000);
  //     } else {
  //       resolve();
  //     }
  // });
  // }

  // function run() {
  //   window.addEventListener("load", () => {
  //     getAlertForFirstJob(apiKey, chatId, isTelegramMessagesOn);
  //     getJobAlert();
  //   });
  // }
}
