import React, { useEffect } from 'react';
import { 
  Sprout, 
  ArrowRight, 
  Send, 
  Compass, 
  BookOpen, 
  Target, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutViewProps {
  settings: SiteSettings;
  onNavigate: (view: string, param?: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ settings, onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'About Debloom – Student Platform by Debbie 🌱';

    const scriptId = 'debloom-about-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AboutPage',
          '@id': 'https://debloom.org/about#webpage',
          'url': 'https://debloom.org/about',
          'name': 'About Debloom',
          'description': 'The story, purpose, mission, and creator behind Debloom, a student-focused learning and opportunities platform.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Debloom',
            'url': 'https://debloom.org',
            'slogan': 'Start where you are. Bloom from there.'
          },
          'mainEntity': {
            '@type': 'Person',
            'name': 'Debbie',
            'jobTitle': 'Creator of Debloom',
            'description': 'Student and creator learning, researching, and sharing practical opportunities, skills, and resources with fellow students.'
          }
        }
      ]
    };

    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16 animate-in fade-in duration-200">
      
      {/* 1. Header & Slogan */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#27523D] font-semibold">
          <Sprout className="w-3.5 h-3.5 text-[#27523D]" />
          <span>The Story & Heart of Debloom</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-[#163323] tracking-tight leading-[1.14]">
          Start where you are.<br /> Bloom from there. 🌱
        </h1>

        <p className="text-base sm:text-lg text-[#57615C] leading-relaxed max-w-2xl font-editorial italic">
          "A world where students don't feel limited simply because they haven't yet discovered what is possible."
        </p>
      </div>

      {/* 2. Authentic Creator Story from Debbie */}
      <section className="bg-white rounded-2xl border border-[#E5E2D9] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E5E2D9] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E2ECE5] text-[#163323] flex items-center justify-center font-editorial font-bold text-lg">
            D
          </div>
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#163323]">
              A Letter from Debbie
            </h2>
            <p className="text-xs text-[#7B8681]">
              Creator of Debloom 🌱
            </p>
          </div>
        </div>

        <div className="text-[#1F2421] text-base sm:text-[17px] leading-[1.8] font-sans space-y-4">
          <p className="font-medium text-[#163323]">
            Hi, I'm Debbie. 🌱
          </p>

          <p>
            And honestly, Debloom didn't start because I had everything figured out.
          </p>

          <p>
            It started from where I was.
          </p>

          <p>
            I was learning things, discovering opportunities, trying different things online, asking questions, figuring things out and sometimes thinking:
          </p>

          <blockquote className="my-3 pl-4 border-l-3 border-[#27523D] italic text-[#163323] font-editorial text-lg bg-[#FAF8F2] py-2 px-3 rounded-r-lg">
            "Wait… why didn't anybody tell me this before?" 😂
          </blockquote>

          <p>
            And that made me think about other students.
          </p>

          <p>
            There are so many things young people can learn outside the normal school curriculum — skills, opportunities, ways to prepare for university, useful tools, financial knowledge, creative ideas and practical things that can make the journey a little easier.
          </p>

          <p className="font-medium text-[#163323]">
            But sometimes the biggest problem isn't that the information doesn't exist.
          </p>

          <p>
            You simply don't know it exists.
          </p>

          <p className="italic text-[#27523D]">
            And you can't search for something you don't know to look for.
          </p>

          <p>
            That's part of why Debloom exists.
          </p>

          <p>
            I'm not building it from the position of someone who has already figured out everything.
          </p>

          <p>
            I'm learning too.
          </p>

          <p>
            I'm discovering, researching, trying things, making mistakes, asking questions and sharing the useful things I find along the way.
          </p>

          <p>
            So in a way, Debloom is growing with me.
          </p>

          <p>
            And hopefully, with you too.
          </p>

          <p className="font-editorial text-lg font-bold text-[#163323] pt-2">
            Start where you are. Bloom from there. 🌱
          </p>
        </div>
      </section>

      {/* 3. The 10 Questions Answered Clearly */}
      <section className="space-y-8">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163323]">
            Understanding Debloom
          </h2>
          <p className="text-xs text-[#57615C] mt-1">
            Clear, transparent answers about who we are, why we exist, and where we are heading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Q1 & Q2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              1. What is Debloom?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              Debloom is a student-focused platform and digital reading room designed to help young people discover useful knowledge, practical online skills, verified opportunities, resources, ideas, and experiences beyond the traditional classroom.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              2. Why does Debloom exist?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              Standard school syllabuses are built for exams, not for navigating modern life. Students miss life-changing opportunities simply because nobody told them where to look. Debloom exists to close that awareness gap honestly.
            </p>
          </div>

          {/* Q3 & Q4 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              3. What is our Mission?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              To help young people discover useful knowledge, opportunities, practical skills, and resources that empower them to make better-informed decisions, explore possibilities, and take their next step with confidence.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              4. What is our Vision?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              A world where students don't feel limited simply because they haven't yet discovered what is possible.
            </p>
          </div>

          {/* Q5 & Q6 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              5. Who created it?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              Debloom was created by Debbie. She isn't an untouchable corporate executive or a distant expert—she is a fellow learner researching, building capability, and sharing honest notes from the journey.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              6. What does "Start where you are. Bloom from there." mean?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              You do not need a fancy laptop, massive savings, or special connections to begin growing. You start with whatever phone, internet, curiosity, and time you have right now—and expand step by step from that foundation.
            </p>
          </div>

          {/* Q7 & Q8 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              7. Who is Debloom for?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              High school students, secondary school leavers, pre-varsity candidates, university undergraduates, self-taught curious learners, and any young person wondering: <em>"What else can I learn or do outside of class?"</em>
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              8. What makes Debloom different?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              Zero fake claims, zero predatory ads, and zero artificial hype. We don't overwhelm you with 10,000 unverified links. Every entry is carefully checked, human-curated, and accompanied by practical exercises rather than passive reading.
            </p>
          </div>

          {/* Q9 & Q10 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              9. Where is it starting from?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              Debloom has Nigerian roots and global usefulness. We understand local realities—data limitations, exam pressure, electricity unpredictability, and digital barriers—while connecting students to legitimate global opportunities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] space-y-2">
            <h3 className="font-editorial text-lg font-bold text-[#163323]">
              10. What does Debloom hope to become?
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              A trusted, welcoming launchpad where thousands of young people discover their first digital skill, win their first verified scholarship, build genuine portfolios, and discover possibilities they never knew existed.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Core Brand Philosophy */}
      <section className="bg-[#163323] text-[#FCFBF7] rounded-2xl p-6 sm:p-10 space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#C49B4B]">
          Brand Principle
        </div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-snug">
          "Don't just read. Do something with what you learn."
        </h2>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-[#8FA89B] pt-2">
          <span className="text-white">Discover</span>
          <span>→</span>
          <span className="text-white">Learn</span>
          <span>→</span>
          <span className="text-white">Practise</span>
          <span>→</span>
          <span className="text-white">Explore</span>
          <span>→</span>
          <span className="text-[#C49B4B]">Grow 🌱</span>
        </div>

        <p className="text-xs sm:text-sm text-[#DCE7E1] leading-relaxed pt-2">
          Passive consumption leaves you right where you started. That is why our guides connect directly to actionable Bloom Challenges and real-world experiments.
        </p>
      </section>

      {/* 5. Official Telegram Community CTA */}
      <section className="bg-[#FAF2DC] rounded-2xl border border-[#E5E2D9] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#27523D]">
          <Send className="w-3.5 h-3.5 text-[#27523D]" />
          <span>Official Telegram Community</span>
        </div>

        <div className="space-y-2">
          <h3 className="font-editorial text-2xl font-bold text-[#163323]">
            Stay Connected with Debloom
          </h3>
          <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
            Get quick updates, useful resources and new Debloom posts on Telegram.
          </p>
        </div>

        <div className="pt-2">
          <a
            href={settings?.telegramUrl || 'https://t.me/DebloomHQ'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-xl hover:bg-[#27523D] transition-all shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join {settings?.telegramChannelName || '@DebloomHQ'}</span>
            <ExternalLink className="w-3 h-3 text-[#8FA89B]" />
          </a>
        </div>
      </section>

      {/* 6. Internal Navigation Hub */}
      <section className="pt-6 border-t border-[#E5E2D9] space-y-6">
        <h3 className="font-editorial text-xl font-bold text-[#163323]">
          Explore the Debloom Platform
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('blog')}
            className="p-4 bg-white border border-[#E5E2D9] hover:bg-[#F1F6F3] rounded-xl text-left transition-colors cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-[#27523D] mb-2" />
            <div className="text-xs font-bold text-[#163323] group-hover:text-[#27523D]">Reading Room</div>
            <div className="text-[11px] text-[#7B8681] mt-0.5">Reflections & guides</div>
          </button>

          <button
            onClick={() => onNavigate('opportunities')}
            className="p-4 bg-white border border-[#E5E2D9] hover:bg-[#F1F6F3] rounded-xl text-left transition-colors cursor-pointer group"
          >
            <Compass className="w-4 h-4 text-[#27523D] mb-2" />
            <div className="text-xs font-bold text-[#163323] group-hover:text-[#27523D]">Opportunities</div>
            <div className="text-[11px] text-[#7B8681] mt-0.5">Verified programs & grants</div>
          </button>

          <button
            onClick={() => onNavigate('challenges')}
            className="p-4 bg-white border border-[#E5E2D9] hover:bg-[#F1F6F3] rounded-xl text-left transition-colors cursor-pointer group"
          >
            <Target className="w-4 h-4 text-[#27523D] mb-2" />
            <div className="text-xs font-bold text-[#163323] group-hover:text-[#27523D]">Bloom Challenges</div>
            <div className="text-[11px] text-[#7B8681] mt-0.5">Bite-sized practice tasks</div>
          </button>

          <button
            onClick={() => onNavigate('explore')}
            className="p-4 bg-white border border-[#E5E2D9] hover:bg-[#F1F6F3] rounded-xl text-left transition-colors cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-[#27523D] mb-2" />
            <div className="text-xs font-bold text-[#163323] group-hover:text-[#27523D]">Explore Everything</div>
            <div className="text-[11px] text-[#7B8681] mt-0.5">Full discovery directory</div>
          </button>
        </div>
      </section>

    </div>
  );
};
