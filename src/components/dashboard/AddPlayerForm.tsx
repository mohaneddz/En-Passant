import React, { useState } from "react";
import { Plus, Upload } from "lucide-react";

interface AddPlayerFormProps {
  onAddPlayer: (player: { name: string; rating: number }) => Promise<void> | void;
  onImportPlayers: (file: File) => Promise<{
    inserted: number;
    skipped_duplicate: number;
    invalid_rows: number;
  }>;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({
  onAddPlayer,
  onImportPlayers,
}) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("1200");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [importSummary, setImportSummary] = useState<
    { inserted: number; skipped_duplicate: number; invalid_rows: number } | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddSingleUser = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    setBusy(true);
    try {
      await onAddPlayer({
        name: name.trim(),
        rating: Number.parseInt(rating, 10) || 1200,
      });
      setName("");
      setRating("1200");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add user.");
    } finally {
      setBusy(false);
    }
  };

  const handleImportCsv = async () => {
    setError(null);
    setImportSummary(null);

    if (!csvFile) {
      setError("Please choose a CSV file first.");
      return;
    }

    setBusy(true);
    try {
      const summary = await onImportPlayers(csvFile);
      setImportSummary(summary);
      setCsvFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to import CSV.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 mb-8">
      <h2 className="text-white text-lg font-bold mb-6">Add User / Add Users</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-gray-300">Add User</h3>

          <div>
            <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wide">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user full name"
              className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wide">
              Elo
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="1200"
              className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all text-sm"
            />
          </div>

          <button
            onClick={handleAddSingleUser}
            disabled={busy}
            className="mt-2 flex items-center justify-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold px-6 py-3 rounded-lg transition-all w-full sm:w-auto disabled:opacity-60"
          >
            <Plus size={18} />
            <span>{busy ? "Saving..." : "Add User"}</span>
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-gray-300">Add Users (CSV)</h3>

          <p className="text-xs text-gray-400">
            CSV header must be <code>full_name,elo</code> or <code>name,elo</code>.
          </p>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#262626] file:text-gray-200"
          />

          <button
            onClick={handleImportCsv}
            disabled={busy || !csvFile}
            className="mt-2 flex items-center justify-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold px-6 py-3 rounded-lg transition-all w-full sm:w-auto disabled:opacity-60"
          >
            <Upload size={18} />
            <span>{busy ? "Importing..." : "Add Users"}</span>
          </button>

          {importSummary && (
            <div className="text-sm text-gray-300 bg-[#111] border border-[#333] rounded-lg p-3">
              Inserted: <strong>{importSummary.inserted}</strong> | Skipped duplicates: <strong>{importSummary.skipped_duplicate}</strong> | Invalid rows: <strong>{importSummary.invalid_rows}</strong>
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default AddPlayerForm;
