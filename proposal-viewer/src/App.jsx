import { useEffect, useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ لو الصفحة اتفتحت ومعاها ?desc=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const descFromUrl = params.get("desc");
    if (descFromUrl) {
      setDescription(descFromUrl);
      generateProposal(descFromUrl);
    }
  }, []);

  const generateProposal = async (desc) => {
    setLoading(true);
    setProposal("");

    try {
      const res = await fetch("http://localhost:3000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
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

  const handleGenerate = () => generateProposal(description);

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      alert("Proposal copied to clipboard!");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "auto" }}>
      <h1>Upwork Proposal Generator</h1>

      <textarea
        rows="6"
        placeholder="Paste the job description here..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleGenerate}
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

      {proposal && (
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <h3>Generated Proposal:</h3>
          {/* ✅ textarea editable */}
          <textarea
            rows="10"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              resize: "vertical",
            }}
          />
          {/* ✅ Copy button */}
          <button
            onClick={handleCopy}
            style={{
              alignSelf: "flex-start",
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
