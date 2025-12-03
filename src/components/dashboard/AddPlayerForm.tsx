import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  rating: number;
  points: number;
  wins: number;
  losses: number;
  draws: number;
}

interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="mb-5">
    <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all text-sm"
    />
  </div>
);

interface AddPlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id'>) => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer }) => {
  const [formData, setFormData] = useState({
    name: '',
    rating: '1200',
    points: '0',
    wins: '0',
    losses: '0',
    draws: '0'
  });

  const handleSubmit = () => {
    onAddPlayer({
      name: formData.name,
      rating: parseInt(formData.rating) || 0,
      points: parseFloat(formData.points),
      wins: parseInt(formData.wins),
      losses: parseInt(formData.losses),
      draws: parseInt(formData.draws)
    });
    setFormData({ name: '', rating: '1200', points: '0', wins: '0', losses: '0', draws: '0' });
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 mb-8">
      <h2 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
        Add New Player
      </h2>
      <div className="space-y-1">
        <FormInput
          label="Full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter player full name"
        />
        <FormInput
          label="Rating"
          type="number"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          placeholder="1200"
        />
        <button
          onClick={handleSubmit}
          className="mt-6 flex items-center justify-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold px-6 py-3 rounded-lg transition-all w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Player</span>
        </button>
      </div>
    </div>
  );
};

export default AddPlayerForm;
