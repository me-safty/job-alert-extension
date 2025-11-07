chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "generateProposal") {
    const description = message.description;

    try {
      const response = await fetch("http://localhost:3000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      const proposal = data.proposal || "مافيش رد من Gemini";

      // افتح صفحة الريأكت لعرض الاقتراح
      chrome.tabs.create({
        url: chrome.runtime.getURL("proposal.html"),
      });

      // بعت النتيجة لأي صفحة مفتوحة من الإكستنشن
      chrome.runtime.sendMessage({
        action: "showProposal",
        proposal,
      });
    } catch (err) {
      console.error("Gemini Error:", err);
    }
  }
});
