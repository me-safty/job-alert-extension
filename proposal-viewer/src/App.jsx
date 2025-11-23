import { useEffect, useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);

  // قراءة البيانات من URL عند التحميل
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const descFromUrl = params.get("desc");
    const notesFromUrl = params.get("notes");

    if (descFromUrl) setDescription(descFromUrl);
    if (notesFromUrl) setNotes(notesFromUrl);

    // ✅ إرسال مباشرة عند وجود desc
    if (descFromUrl) {
      const fullText = notesFromUrl ? descFromUrl + "\n\n" + notesFromUrl : descFromUrl;
      generateProposal(fullText);
    }
  }, []);

  const generateProposal = async (text) => {
    setLoading(true);
    setProposal("");

    try {
      const res = await fetch("http://localhost:3000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });

      const data = await res.json();
      setProposal(data.proposal);
    } catch (err) {
      console.error(err);
      setProposal("❌ Error: Could not get proposal from Gemini.");
    } finally {
      setLoading(false);
    }
  };

  // زرار دمج الـ Notes يضيفها إلى Description
  const addNotesToDescription = () => {
    const newText = description + "\n\n" + notes;
    setDescription(newText);
  };

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      alert("Proposal copied to clipboard!");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "auto" }}>
      <h1>Upwork Proposal Generator</h1>
      <div style={{ display: "flex", gap: "40px" }}>
        {/* Description */}
        <div style={{ flex: 1 }}>
          <textarea
            rows="8"
            placeholder="Paste the job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <button
            onClick={() => generateProposal(description)}
            disabled={loading}
            style={{
              marginTop: "1rem",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {loading ? "Generating..." : "Generate Proposal"}
          </button>
        </div>

        {/* Notes */}
        <div style={{ flex: 1 }}>
          <textarea
            rows="8"
            placeholder="Write your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <button
            onClick={addNotesToDescription}
            style={{
              marginTop: "1rem",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Add Notes to Description
          </button>
        </div>
      </div>

      {proposal && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Generated Proposal:</h3>
          <textarea
            rows="10"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", resize: "vertical" }}
          />
          <button
            onClick={handleCopy}
            style={{
              marginTop: "0.5rem",
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Copy Proposal
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
