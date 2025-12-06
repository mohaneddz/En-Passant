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
      className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all text-sm"
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
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 mb-8">
      <h2 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
        Add New Game
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <FormSelect
          label="White Player"
          value={formData.whiteId}
          onChange={(e) => setFormData({ ...formData, whiteId: e.target.value })}
          options={playerOptions}
          placeholder="Select white player"
        />
        <FormSelect
          label="Black Player"
          value={formData.blackId}
          onChange={(e) => setFormData({ ...formData, blackId: e.target.value })}
          options={playerOptions}
          placeholder="Select black player"
        />
        <FormSelect
          label="Result (Optional)"
          value={formData.result}
          onChange={(e) => setFormData({ ...formData, result: e.target.value })}
          options={resultOptions}
          placeholder="Leave empty for pending game"
        />
        <button
          onClick={handleSubmit}
          className="mt-6 flex items-center justify-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold px-6 py-3 rounded-lg transition-all w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Game</span>
        </button>
      </div>
    </div>
  );
};

export default AddGameForm;
