import React from 'react';
import { Sprout, ShieldCheck, Heart, ArrowRight, Send, Compass } from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutViewProps {
  settings: SiteSettings;
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ settings, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      
      {/* Editorial Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#27523D] font-semibold">
          <Sprout className="w-3.5 h-3.5 text-[#27523D]" />
          <span>About Debloom</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#163323] tracking-tight leading-[1.15]">
          Start where you are.<br /> Bloom from there. 🌱
        </h1>

        <p className="text-base sm:text-lg text-[#57615C] leading-relaxed max-w-2xl font-editorial italic">
          "A place to discover. A place to learn. A place to experiment. A place to take action. A place to grow."
        </p>
      </div>

      {/* Origin & Philosophy */}
      <div className="prose prose-stone max-w-none text-[#1F2421] space-y-6 text-sm sm:text-base leading-relaxed">
        <p>
          Debloom was created to help young people discover what exists beyond ordinary classroom learning. 
          For many students in Nigeria and around the world, school syllabuses are structured around exams and memory retention, leaving little room to discover modern digital skills, legitimate global opportunities, or practical career paths before stepping into adulthood.
        </p>

        <p>
          Students often find themselves asking:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 not-prose">
          {[
            "I don't know what opportunities exist.",
            "I don't know what skill I should start learning.",
            "I want to prepare for university.",
            "I want to discover what I can do outside the classroom.",
            "I want to find legitimate opportunities.",
            "I want to develop myself without getting scammed.",
          ].map((quote, i) => (
            <div key={i} className="p-3 bg-white border border-[#E5E2D9] rounded-lg text-xs text-[#57615C] italic">
              "{quote}"
            </div>
          ))}
        </div>

        <p>
          Debloom provides an honest starting point. It is built to remain focused and manageable rather than attempting to become an overwhelming directory of thousands of unverified links.
        </p>
      </div>

      {/* Core Philosophy Banner */}
      <div className="bg-[#163323] text-[#FCFBF7] rounded-2xl p-6 sm:p-10 space-y-4">
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
          The Debloom Philosophy
        </h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-[#8FA89B] pt-2">
          <span className="text-white">DISCOVER</span>
          <span>→</span>
          <span className="text-white">LEARN</span>
          <span>→</span>
          <span className="text-white">PRACTISE</span>
          <span>→</span>
          <span className="text-white">SUBMIT</span>
          <span>→</span>
          <span className="text-white">IMPROVE</span>
          <span>→</span>
          <span className="text-[#C49B4B]">GROW 🌱</span>
        </div>
        <p className="text-xs sm:text-sm text-[#DCE7E1] leading-relaxed pt-2">
          "Don't just read. Do something with what you learn." That is why every relevant guide includes a Bloom Challenge: a real, bite-sized exercise designed to build genuine proof of capability.
        </p>
      </div>

      {/* Founder Debbie Note (Strictly adhering to Section 6: truthful, no fake bio or photo) */}
      <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 sm:p-8 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#27523D]">
          Founder Note
        </div>

        <div className="flex items-start gap-4">
          {/* Tasteful typographical brand graphic instead of fake stock photo */}
          <div className="w-12 h-12 rounded-xl bg-[#E2ECE5] text-[#163323] flex items-center justify-center font-editorial font-bold text-xl shrink-0">
            D
          </div>

          <div className="space-y-2">
            <h3 className="font-editorial text-xl font-bold text-[#163323]">
              Debbie
            </h3>
            <p className="text-xs text-[#7B8681]">
              Founder, Debloom
            </p>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed pt-1">
              Debloom was founded by Debbie with a straightforward intention: to help students start where they are and gradually build capability. Rather than creating another overwhelming corporate site, Debbie envisioned a clean, safe, and encouraging space where young people could discover real possibilities beyond school walls.
            </p>
          </div>
        </div>
      </div>

      {/* Nigerian roots. Global usefulness. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#FAF2DC] p-6 rounded-xl border border-[#E5E2D9] space-y-2">
          <h4 className="font-editorial text-lg font-bold text-[#163323]">
            Nigerian Roots. Global Usefulness.
          </h4>
          <p className="text-xs text-[#57615C] leading-relaxed">
            The platform is built with close attention to the realities young Nigerians face—data constraints, university preparation, and digital work barriers—while remaining globally useful to students everywhere.
          </p>
        </div>

        <div className="bg-[#F7F5EE] p-6 rounded-xl border border-[#E5E2D9] space-y-2">
          <h4 className="font-editorial text-lg font-bold text-[#163323]">
            Zero Fabricated Claims
          </h4>
          <p className="text-xs text-[#57615C] leading-relaxed">
            We do not manufacture reviews, fake partnerships, or sponsored awards. We would rather leave a section in a clean empty state than fill it with misleading placeholders.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8 border-t border-[#E5E2D9] space-y-4">
        <h3 className="font-editorial text-2xl font-bold text-[#163323]">
          Ready to begin?
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('explore')}
            className="px-6 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] transition-colors"
          >
            Explore Resources & Guides
          </button>
          <button
            onClick={() => onNavigate('submit')}
            className="px-6 py-2.5 bg-white border border-[#E5E2D9] text-[#163323] text-xs font-semibold rounded-lg hover:bg-[#F1F6F3] transition-colors"
          >
            Submit an Opportunity
          </button>
        </div>
      </div>

    </div>
  );
};
