import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  is_active: boolean;
  is_present: boolean;
}

interface AddGameFormProps {
  players: Player[];
  onAddGame: (game: { whiteId: number; blackId: number; result?: string }) => void;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, value, onChange, options, placeholder }) => (
  <div className="mb-5">
    <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wide">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-cyan-900/10 border border-cyan-500/10 rounded-xl px-5 py-4 text-white placeholder-cyan-900 focus:outline-none focus:border-cyan-500/40 focus:bg-cyan-900/20 transition-all text-sm font-bold appearance-none cursor-pointer"
    >
      <option value="" className="text-gray-600">{placeholder || 'Select an option'}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="text-white bg-[#111]">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const AddGameForm: React.FC<AddGameFormProps> = ({ players, onAddGame }) => {
  const [formData, setFormData] = useState({
    whiteId: '',
    blackId: '',
    result: ''
  });

  const [error, setError] = useState<string | null>(null);

  // Filter active and present players
  const availablePlayers = players.filter(p => p.is_active && p.is_present);

  const playerOptions = availablePlayers.map(p => ({
    value: p.id.toString(),
    label: p.name
  }));

  const resultOptions = [
    { value: '1-0', label: '1-0 (White Wins)' },
    { value: '0-1', label: '0-1 (Black Wins)' },
    { value: '0.5-0.5', label: '0.5-0.5 (Draw)' }
  ];

  const handleSubmit = () => {
    setError(null);

    // Validation
    if (!formData.whiteId) {
      setError('Please select a white player');
      return;
    }
    if (!formData.blackId) {
      setError('Please select a black player');
      return;
    }
    if (formData.whiteId === formData.blackId) {
      setError('White and black players must be different');
      return;
    }

    onAddGame({
      whiteId: parseInt(formData.whiteId),
      blackId: parseInt(formData.blackId),
      result: formData.result || undefined
    });

    // Reset form
    setFormData({ whiteId: '', blackId: '', result: '' });
  };

  return (
    <div className="bg-[#071034]/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 mb-8 shadow-2xl">
      <h2 className="text-white text-xl font-black tracking-tighter uppercase mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
        Authorize Match
      </h2>
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-black uppercase tracking-widest">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <FormSelect
          label="Arena White"
          value={formData.whiteId}
          onChange={(e) => setFormData({ ...formData, whiteId: e.target.value })}
          options={playerOptions}
          placeholder="CHOOSE WHITE PLAYER"
        />
        <FormSelect
          label="Arena Black"
          value={formData.blackId}
          onChange={(e) => setFormData({ ...formData, blackId: e.target.value })}
          options={playerOptions}
          placeholder="CHOOSE BLACK PLAYER"
        />
        <FormSelect
          label="Manual Result (OPTIONAL)"
          value={formData.result}
          onChange={(e) => setFormData({ ...formData, result: e.target.value })}
          options={resultOptions}
          placeholder="LEAVE FOR LIVE UPDATES"
        />
        <button
          onClick={handleSubmit}
          className="mt-8 flex items-center justify-center gap-3 bg-[#00e5ff] hover:bg-cyan-400 text-[#050d1e] font-black tracking-widest uppercase px-8 py-4 rounded-xl transition-all w-full sm:w-auto shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Authorize Match</span>
        </button>
      </div>
    </div>
  );
};

export default AddGameForm;
