import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Eye,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  onOpenImageModal?: () => void;
  onPreview?: () => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * Visual WYSIWYG Rich Text Editor for Debloom writers.
 * Supports bold, italics, headings, quotes, lists, dividers, links, images, undo/redo.
 * Persists clean semantic formatting without forcing writers to know HTML or raw markdown tags.
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onOpenImageModal,
  onPreview,
  placeholder = 'Write your thoughts, guides, reflections, or practical steps here...',
  minHeight = '360px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  // Convert markdown to clean initial HTML if needed
  const getInitialHtml = (raw: string): string => {
    if (!raw) return '<p><br></p>';
    if (/<[a-z][\s\S]*>/i.test(raw)) return raw;

    // Convert basic markdown blocks to HTML
    return raw
      .split('\n\n')
      .map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('# ')) return `<h1>${trimmed.replace(/^#\s+/, '')}</h1>`;
        if (trimmed.startsWith('## ')) return `<h2>${trimmed.replace(/^##\s+/, '')}</h2>`;
        if (trimmed.startsWith('### ')) return `<h3>${trimmed.replace(/^###\s+/, '')}</h3>`;
        if (trimmed.startsWith('> ')) return `<blockquote>${trimmed.replace(/^>\s*/, '')}</blockquote>`;
        if (trimmed === '---' || trimmed === '***') return '<hr />';
        if (/^[-*]\s+/m.test(trimmed)) {
          const lis = trimmed.split('\n').map(l => `<li>${l.replace(/^[-*]\s+/, '')}</li>`).join('');
          return `<ul>${lis}</ul>`;
        }
        if (/^\d+\.\s+/m.test(trimmed)) {
          const lis = trimmed.split('\n').map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
          return `<ol>${lis}</ol>`;
        }
        // Paragraph with basic inline bold/italic
        const formatted = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return `<p>${formatted}</p>`;
      })
      .filter(Boolean)
      .join('');
  };

  // Sync value from prop into contentEditable div (avoiding cursor jump while typing)
  useEffect(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    if (isUpdatingRef.current) return;

    const initial = getInitialHtml(value);
    if (currentHtml !== initial && (currentHtml === '<p><br></p>' || !currentHtml || value !== currentHtml)) {
      editorRef.current.innerHTML = initial;
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleSaveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0));
      setLinkText(sel.toString());
    }
  };

  const handleRestoreSelection = () => {
    if (savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
    }
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) {
      setLinkModalOpen(false);
      return;
    }

    handleRestoreSelection();
    const url = linkUrl.startsWith('http') || linkUrl.startsWith('mailto:') ? linkUrl : `https://${linkUrl}`;

    if (linkText) {
      document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
    } else {
      document.execCommand('createLink', false, url);
    }

    setLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    handleInput();
  };

  return (
    <div className="border border-[#E5E2D9] rounded-xl bg-white overflow-hidden shadow-xs">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF8F2] border-b border-[#E5E2D9] text-xs">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => exec('undo')}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec('redo')}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#D8D4C4] mx-1" />

        {/* Headings & Paragraph */}
        <button
          type="button"
          onClick={() => exec('formatBlock', '<p>')}
          title="Normal Paragraph"
          className="px-2 py-1 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
        >
          <Type className="w-3 h-3" />
          <span>Body</span>
        </button>

        <button
          type="button"
          onClick={() => exec('formatBlock', '<h1>')}
          title="Main Heading (H1)"
          className="px-2 py-1 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] font-bold text-xs transition-colors cursor-pointer"
        >
          <Heading1 className="w-3.5 h-3.5 inline" />
        </button>

        <button
          type="button"
          onClick={() => exec('formatBlock', '<h2>')}
          title="Section Heading (H2)"
          className="px-2 py-1 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] font-bold text-xs transition-colors cursor-pointer"
        >
          <Heading2 className="w-3.5 h-3.5 inline" />
        </button>

        <button
          type="button"
          onClick={() => exec('formatBlock', '<h3>')}
          title="Sub Heading (H3)"
          className="px-2 py-1 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] font-bold text-xs transition-colors cursor-pointer"
        >
          <Heading3 className="w-3.5 h-3.5 inline" />
        </button>

        <div className="w-[1px] h-4 bg-[#D8D4C4] mx-1" />

        {/* Inline Formatting */}
        <button
          type="button"
          onClick={() => exec('bold')}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec('italic')}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec('underline')}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#D8D4C4] mx-1" />

        {/* Blockquote & Lists */}
        <button
          type="button"
          onClick={() => exec('formatBlock', '<blockquote>')}
          title="Blockquote / Reflection"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <Quote className="w-3.5 h-3.5 text-[#27523D]" />
        </button>

        <button
          type="button"
          onClick={() => exec('insertUnorderedList')}
          title="Bulleted List"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec('insertOrderedList')}
          title="Numbered Steps List"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec('insertHorizontalRule')}
          title="Section Divider"
          className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#D8D4C4] mx-1" />

        {/* Link & Image Insertion */}
        <button
          type="button"
          onClick={() => {
            handleSaveSelection();
            setLinkModalOpen(true);
          }}
          title="Add Link"
          className="px-2 py-1 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EAE6D8] transition-colors cursor-pointer flex items-center gap-1"
        >
          <LinkIcon className="w-3.5 h-3.5 text-[#27523D]" />
          <span>Link</span>
        </button>

        {onOpenImageModal && (
          <button
            type="button"
            onClick={onOpenImageModal}
            title="Insert Image into body"
            className="px-2 py-1 rounded-lg bg-[#E2ECE5] hover:bg-[#D3E3D8] text-[#163323] font-medium transition-colors cursor-pointer flex items-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#27523D]" />
            <span>Image</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => exec('removeFormat')}
          title="Clear formatting"
          className="p-1.5 rounded-lg text-[#7B8681] hover:text-red-700 hover:bg-[#EAE6D8] transition-colors cursor-pointer"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>

        {/* Optional Live Preview Trigger */}
        {onPreview && (
          <div className="ml-auto pl-2">
            <button
              type="button"
              onClick={onPreview}
              className="px-3 py-1 bg-white border border-[#DCE7E1] hover:bg-[#F1F6F3] text-[#163323] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#27523D]" />
              <span>Preview</span>
            </button>
          </div>
        )}
      </div>

      {/* Editable Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="p-5 sm:p-7 text-[#1F2421] text-base leading-[1.75] font-sans focus:outline-none overflow-y-auto debloom-editor-canvas"
      />

      {/* Link Popover Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-[#E5E2D9] p-5 space-y-4">
            <h4 className="font-editorial text-lg font-bold text-[#163323]">Insert Web Link</h4>

            <form onSubmit={handleApplyLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Web Address (URL)</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-[#FCFBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Link Text (optional)</label>
                <input
                  type="text"
                  placeholder="Display text..."
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-[#FCFBF7]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#57615C] hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D]"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
