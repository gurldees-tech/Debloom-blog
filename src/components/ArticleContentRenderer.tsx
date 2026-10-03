import React from 'react';

interface ArticleContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Universal content renderer for Debloom articles.
 * Safely and beautifully renders both visual rich HTML and Markdown formatted content
 * with true editorial styling (headings, blockquotes, lists, dividers, bold, italics, links, images).
 */
export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  // If content is already rich HTML (from the new WYSIWYG editor)
  if (isHtml) {
    return (
      <div
        className={`debloom-editorial-prose text-[#1F2421] text-base sm:text-[17px] leading-[1.75] font-sans space-y-5 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Fallback: If content was written in Markdown, parse into structured editorial elements
  const sections = content.split('\n\n');

  return (
    <div className={`debloom-editorial-prose text-[#1F2421] text-base sm:text-[17px] leading-[1.75] font-sans space-y-5 ${className}`}>
      {sections.map((sec, idx) => {
        const trimmed = sec.trim();
        if (!trimmed) return null;

        // Image: ![Alt text](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const alt = imgMatch[1];
          const url = imgMatch[2];
          return (
            <figure key={idx} className="my-8 space-y-2">
              <div className="rounded-2xl overflow-hidden border border-[#E5E2D9] shadow-xs bg-[#F7F5EE]">
                <img
                  src={url}
                  alt={alt || 'Article visual illustration'}
                  className="w-full max-h-[520px] object-cover hover:scale-[1.01] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-xs text-[#7B8681] italic font-sans">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // Blockquote: > quote
        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <blockquote
              key={idx}
              className="my-6 pl-5 border-l-4 border-[#27523D] bg-[#F7F5EE]/80 py-3.5 px-4 rounded-r-xl text-base sm:text-lg italic text-[#163323] font-editorial leading-relaxed"
            >
              {parseInlineMarkdown(quoteText)}
            </blockquote>
          );
        }

        // H1: #
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="font-editorial text-3xl sm:text-4xl font-bold text-[#163323] mt-10 mb-4 tracking-tight">
              {parseInlineMarkdown(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }

        // H2: ##
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="font-editorial text-2xl sm:text-3xl font-bold text-[#163323] mt-10 mb-4 tracking-tight">
              {parseInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        // H3: ###
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="font-editorial text-xl sm:text-2xl font-bold text-[#163323] mt-8 mb-3">
              {parseInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // Divider: ---
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-8 border-[#E5E2D9]" />;
        }

        // Bullet or Numbered lists
        if (/^[-*]\s+/m.test(trimmed) || /^\d+\.\s+/m.test(trimmed)) {
          const lines = trimmed.split('\n');
          const isOrdered = /^\d+\.\s+/.test(lines[0]);
          const ListTag = isOrdered ? 'ol' : 'ul';

          return (
            <ListTag
              key={idx}
              className={`my-4 pl-6 space-y-2 text-[#2D3430] ${isOrdered ? 'list-decimal' : 'list-disc'}`}
            >
              {lines.map((line, liIdx) => {
                const cleaned = line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
                return (
                  <li key={liIdx} className="leading-relaxed">
                    {parseInlineMarkdown(cleaned)}
                  </li>
                );
              })}
            </ListTag>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Helper to parse bold, italic, underline, and links inside text
 */
function parseInlineMarkdown(text: string): React.ReactNode {
  // Bold + Italic: ***text***
  // Bold: **text**
  // Italic: *text*
  // Link: [text](url)

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for link [title](url)
    const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/);
    // Check for bold **text**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Check for italic *text*
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/);

    // Find earliest match
    type MatchInfo = { type: 'link' | 'bold' | 'italic'; index: number; match: RegExpMatchArray };
    const candidates: MatchInfo[] = [];

    if (linkMatch && linkMatch.index !== undefined) candidates.push({ type: 'link', index: linkMatch.index, match: linkMatch });
    if (boldMatch && boldMatch.index !== undefined) candidates.push({ type: 'bold', index: boldMatch.index, match: boldMatch });
    if (italicMatch && italicMatch.index !== undefined) candidates.push({ type: 'italic', index: italicMatch.index, match: italicMatch });

    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }

    candidates.sort((a, b) => a.index - b.index);
    const earliest = candidates[0];

    // Push text before match
    if (earliest.index > 0) {
      parts.push(remaining.substring(0, earliest.index));
    }

    if (earliest.type === 'link') {
      const linkText = earliest.match[1];
      const linkUrl = earliest.match[2];
      const isExternal = linkUrl.startsWith('http');
      parts.push(
        <a
          key={key++}
          href={linkUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#27523D] font-medium underline underline-offset-2 hover:text-[#163323] transition-colors"
        >
          {linkText}
        </a>
      );
      remaining = remaining.substring(earliest.index + earliest.match[0].length);
    } else if (earliest.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-bold text-[#163323]">
          {earliest.match[1]}
        </strong>
      );
      remaining = remaining.substring(earliest.index + earliest.match[0].length);
    } else if (earliest.type === 'italic') {
      parts.push(
        <em key={key++} className="italic">
          {earliest.match[1]}
        </em>
      );
      remaining = remaining.substring(earliest.index + earliest.match[0].length);
    }
  }

  return <>{parts}</>;
}
