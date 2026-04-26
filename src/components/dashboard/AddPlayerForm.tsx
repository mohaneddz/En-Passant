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
    <div className="bg-[#071034]/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 mb-8 shadow-2xl">
      <h2 className="text-white text-xl font-black tracking-tighter uppercase mb-8" style={{ fontFamily: "var(--font-heading)" }}>
        Player Registration Hub
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500/60">Single Entry</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-cyan-500/40 text-[10px] font-black mb-1.5 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="PRO PLAYER NAME"
                className="w-full bg-cyan-900/10 border border-cyan-500/10 rounded-xl px-5 py-3.5 text-white placeholder-cyan-900 focus:outline-none focus:border-cyan-500/40 focus:bg-cyan-900/20 transition-all text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-cyan-500/40 text-[10px] font-black mb-1.5 uppercase tracking-widest ml-1">
                Elo Rating
              </label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="1200"
                className="w-full bg-cyan-900/10 border border-cyan-500/10 rounded-xl px-5 py-3.5 text-white placeholder-cyan-900 focus:outline-none focus:border-cyan-500/40 focus:bg-cyan-900/20 transition-all text-sm font-bold"
              />
            </div>

            <button
              onClick={handleAddSingleUser}
              disabled={busy}
              className="mt-2 flex items-center justify-center gap-2 bg-[#00e5ff] hover:bg-cyan-400 text-[#050d1e] font-black tracking-widest uppercase px-8 py-4 rounded-xl transition-all w-full sm:w-auto disabled:opacity-40 shadow-[0_0_15px_rgba(0,229,255,0.3)] active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              <span>{busy ? "Registering..." : "Add Competitor"}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500/60">Bulk Import (CSV)</h3>
          </div>

          <div className="space-y-4">
             <p className="text-[10px] text-cyan-500/40 font-bold uppercase tracking-wider ml-1">
                Required header: <code>full_name,elo</code> or <code>name,elo</code>
             </p>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="w-full bg-cyan-900/10 border border-cyan-500/10 rounded-xl px-4 py-3 text-xs text-cyan-200 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-[#00e5ff] file:font-black file:uppercase file:text-[10px] file:tracking-widest cursor-pointer"
            />

            <button
              onClick={handleImportCsv}
              disabled={busy || !csvFile}
              className="mt-2 flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-[#00e5ff] font-black tracking-widest uppercase px-8 py-4 rounded-xl transition-all w-full sm:w-auto disabled:opacity-40 active:scale-95"
            >
              <Upload size={18} strokeWidth={3} />
              <span>{busy ? "Processing..." : "Import Roster"}</span>
            </button>

            {importSummary && (
              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4 flex justify-between gap-2">
                 <span>Inserted: {importSummary.inserted}</span>
                 <span className="text-cyan-900">|</span>
                 <span>Skipped: {importSummary.skipped_duplicate}</span>
                 <span className="text-cyan-900">|</span>
                 <span className="text-red-400/80">Invalid: {importSummary.invalid_rows}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default AddPlayerForm;
