"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestPairingPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/generate-pairing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundNumber: 2,
          tournamentId : "test-tournament",
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Test Generate Pairing</h1>
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Pairings (Round 2)"}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto border">
          <h2 className="font-semibold mb-2">Result:</h2>
          <pre className="text-xs font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
