// ===================[ BACKGROUND SCRIPT ]===================

// الاستماع للرسائل من الـ popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "generateProposal") {
    const description = message.description;

    try {
      // إرسال الوصف لـ backend على localhost
      const response = await fetch("http://localhost:3000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      const proposal = data.proposal || "مافيش رد من Gemini";

      // ✅ بدلاً من فتح صفحة React جديدة، خزنه في chrome.storage
      chrome.storage.local.set({ latestProposal: proposal }, () => {
        console.log("Proposal saved to storage, no new tab opened");
      });

      // إرسال النتيجة لأي صفحة مفتوحة من الإكستنشن
      chrome.runtime.sendMessage({
        action: "showProposal",
        proposal,
      });
    } catch (err) {
      console.error("Gemini Error:", err);
    }
  }
});

// ===================[ END OF BACKGROUND SCRIPT ]===================
