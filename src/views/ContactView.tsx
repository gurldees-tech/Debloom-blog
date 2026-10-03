import React, { useState } from 'react';
import { Mail, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../types';
import { submissionService } from '../services/storage';

interface ContactViewProps {
  settings: SiteSettings;
  onToast: (msg: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings, onToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      submissionService.create({
        type: 'Question',
        submitterName: name,
        submitterContact: email,
        payload: {
          subject,
          message,
        }
      });
      setSent(true);
      onToast('Message sent to the Debloom team! 🌱');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#27523D] font-semibold">
          <Mail className="w-3.5 h-3.5 text-[#27523D]" />
          <span>Get in Touch</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight">
          Contact Debloom 🌱
        </h1>
        <p className="text-sm sm:text-base text-[#57615C] leading-relaxed">
          Have a question about a resource, feedback on an article, or an inquiry for Debbie and the Debloom team? Send a note below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Info Column */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-[#E5E2D9] space-y-1.5">
            <div className="text-xs font-semibold text-[#163323]">Email Inquiries</div>
            <a 
              href={`mailto:${settings.contactEmail}`}
              className="text-xs text-[#27523D] hover:underline break-all block font-medium"
            >
              {settings.contactEmail}
            </a>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E5E2D9] space-y-1.5">
            <div className="text-xs font-semibold text-[#163323]">Telegram Channel</div>
            <a 
              href={settings.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#27523D] hover:underline flex items-center gap-1 font-medium"
            >
              <Send className="w-3.5 h-3.5 text-[#8FA89B]" />
              <span>{settings.telegramChannelName}</span>
            </a>
          </div>

          <div className="p-4 bg-[#FAF2DC] rounded-xl border border-[#E5E2D9] text-xs text-[#57615C]">
            <strong className="text-[#163323] block mb-1">Direct Verification:</strong>
            If you represent a university, scholarship foundation, or verified student program, please include your official email domain for priority verification.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {sent ? (
            <div className="bg-white rounded-xl border border-[#E5E2D9] p-8 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-[#27523D] mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-[#163323]">
                Message Received
              </h3>
              <p className="text-xs text-[#57615C]">
                Thank you for reaching out. We read every message and respond as quickly as possible.
              </p>
              <button
                onClick={() => { setSent(false); setMessage(''); setSubject(''); }}
                className="mt-2 text-xs text-[#27523D] hover:underline font-semibold"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E2D9] p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Your Name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Subject *
                </label>
                <input
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g., Question about CS50 courseware"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#163323] hover:bg-[#27523D] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
