"use client";

import { Calendar, Clock, MapPin, Trophy, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/InfoCard";
import { RuleCard } from "@/components/RuleCard";

import Link from "next/link";
import Image from 'next/image';

export default function ChessTournamentLanding() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
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
            <span className="text-[#EAC360]">EN</span>{' '}
            <span className="text-white">PASSANT</span>
          </h1>

          <h2 className="text-2xl md:text-3xl text-[#EAC360] font-semibold mb-4">
            Chess Tournament
          </h2>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-8">
            Join us for an unforgettable day of strategic battles, brilliant tactics, and championship glory
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard
              title="Date"
              icon={<Calendar className="w-6 h-6 text-[#EAC360]" />}
            >
              <p>Friday - Saturday</p>
              <p>28th November</p>
            </InfoCard>

            <InfoCard
              title="Time"
              icon={<Clock className="w-6 h-6 text-[#EAC360]" />}
            >
              <p>4h00 PM</p>
            </InfoCard>

            <InfoCard
              title="Location"
              icon={<MapPin className="w-6 h-6 text-[#EAC360]" />}
            >
              <p>ENSIA</p>
            </InfoCard>

            <InfoCard
              title="Format"
              icon={<Trophy className="w-6 h-6 text-[#EAC360]" />}
            >
              <p>Swiss System</p>
              <p>7 rounds</p>
            </InfoCard>
          </div>
        </div>
      </section>

      {/* Tournament Rules */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <BookOpen className="w-8 h-8 text-[#EAC360]" />
            <h2 className="text-4xl font-bold">Tournament Rules</h2>
          </div>

          <div className="space-y-4">
            <RuleCard
              title="Time Control"
              description="15 minutes + 10 seconds increment per move"
            />
            <RuleCard
              title="Scoring System"
              description="Win: 1 point | Draw: 0.5 points | Loss: 0 points"
            />
            <RuleCard
              title="Tie-Breaking"
              description="1. Direct encounter | 2. Buchholz score | 3. Progressive score"
            />
            <RuleCard
              title="Conduct"
              description="All players must follow FIDE rules. Mobile phones must be turned off. Any violation may result in forfeiture of the game."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
