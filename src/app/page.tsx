import React from 'react';
import { Calendar, Clock, MapPin, Trophy, BookOpen, Users } from 'lucide-react';
import Image from 'next/image';
export default function ChessTournamentLanding() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Navigation */}


      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Animated Chess Knight */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Image
                src="/photo.png"
                alt="Chess Knight"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
            <span className="text-yellow-500">EN</span>{' '}
            <span className="text-white">PASSANT</span>
          </h1>

          <h2 className="text-2xl md:text-3xl text-yellow-500 font-semibold mb-4">
            Chess Tournament
          </h2>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Join us for an unforgettable day of strategic battles, brilliant tactics, and championship glory
          </p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-yellow-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold">Date</h3>
              </div>
              <p className="text-neutral-400 text-sm">Friday - Saturday</p>
              <p className="text-neutral-400 text-sm">28th November</p>
            </div>

            {/* Time Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-yellow-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold">Time</h3>
              </div>
              <p className="text-neutral-400 text-sm">4h00 PM</p>
            </div>

            {/* Location Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-yellow-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold">Location</h3>
              </div>
              <p className="text-neutral-400 text-sm">ENSIA</p>
            </div>

            {/* Format Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-yellow-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold">Format</h3>
              </div>
              <p className="text-neutral-400 text-sm">Swiss System</p>
              <p className="text-neutral-400 text-sm">7 rounds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Rules */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <BookOpen className="w-8 h-8 text-yellow-500" />
            <h2 className="text-4xl font-bold">Tournament Rules</h2>
          </div>

          <div className="space-y-4">
            {/* Time Control */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Time Control</h3>
              <p className="text-neutral-400">
                15 minutes + 10 seconds increment per move
              </p>
            </div>

            {/* Scoring System */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Scoring System</h3>
              <p className="text-neutral-400">
                Win: 1 point | Draw: 0.5 points | Loss: 0 points
              </p>
            </div>

            {/* Tie-Breaking */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Tie-Breaking</h3>
              <p className="text-neutral-400">
                1. Direct encounter | 2. Buchholz score | 3. Progressive score
              </p>
            </div>

            {/* Conduct */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Conduct</h3>
              <p className="text-neutral-400">
                All players must follow FIDE rules. Mobile phones must be turned off. Any violation may result in forfeiture of the game.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}