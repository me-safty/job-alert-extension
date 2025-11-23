chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "generateProposal") {
    const { description, notes } = message;

    try {
      const res = await fetch("http://localhost:3000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, notes }),
      });

      const data = await res.json();
      const proposal = data.proposal || "No response from Gemini";

      chrome.storage.local.set({ latestProposal: proposal }, () => {
        chrome.runtime.sendMessage({ action: "showProposal", proposal });
      });
    } catch (err) {
      console.error("Gemini Error:", err);
    }
  }
});
