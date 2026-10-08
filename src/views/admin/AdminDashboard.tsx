import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  FileText, 
  Compass, 
  Wrench, 
  Target, 
  Inbox, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  Clock,
  Sparkles,
  Search,
  Eye,
  Check,
  X,
  Archive,
  RotateCcw,
  Calendar,
  Tag,
  Image as ImageIcon,
  Download,
  Upload,
  ListOrdered,
  List,
  Quote,
  Minus,
  Loader2,
  Camera,
  BookOpen,
  Database
} from 'lucide-react';
import { 
  Article, 
  Opportunity, 
  Resource, 
  BloomChallenge, 
  BloomOfTheWeek, 
  SiteSettings, 
  Writer, 
  UserSubmission, 
  ContentReport, 
  AuthUser,
  ArticleStatus,
  OpportunityStatus
} from '../../types';
import { 
  articleService, 
  opportunityService, 
  resourceService, 
  challengeService, 
  bloomOfWeekService, 
  submissionService, 
  reportService, 
  writerService, 
  settingsService, 
  analyticsService 
} from '../../services/storage';
import { RichTextEditor } from '../../components/RichTextEditor';
import { ArticleContentRenderer } from '../../components/ArticleContentRenderer';

interface AdminDashboardProps {
  currentUser: AuthUser;
  articles: Article[];
  opportunities: Opportunity[];
  resources: Resource[];
  challenges: BloomChallenge[];
  bloomOfTheWeek: BloomOfTheWeek;
  settings: SiteSettings;
  submissions: UserSubmission[];
  reports: ContentReport[];
  writers: Writer[];
  onRefreshData: () => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
}

type AdminTab = 
  | 'overview' 
  | 'articles' 
  | 'opportunities' 
  | 'resources' 
  | 'challenges' 
  | 'bloom-of-week'
  | 'submissions' 
  | 'reports' 
  | 'writers' 
  | 'analytics' 
  | 'settings';

export const CURATED_STUDY_IMAGES = [
  {
    title: 'Study Desk & Laptop',
    category: 'Study & Tech',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Journal & Pen Writing',
    category: 'Writing & Reflection',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'University Campus Life',
    category: 'Campus & University',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Coding on Laptop',
    category: 'Digital Skills',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Library & Book Stacks',
    category: 'Academic & Learning',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Goal Planner & Checklist',
    category: 'Planning & Action',
    url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Student Teamwork & Peer Learning',
    category: 'Community',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Quiet Study Morning',
    category: 'Discipline',
    url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Green Sprout & Growing Plant',
    category: 'Growth Mindset',
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Creative Strategy & Notes',
    category: 'Career Discovery',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  articles,
  opportunities,
  resources,
  challenges,
  bloomOfTheWeek,
  settings,
  submissions,
  reports,
  writers,
  onRefreshData,
  onLogout,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Modal editor states
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Image assistant states
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    target: 'featured' | 'body' | 'opportunity';
  }>({ isOpen: false, target: 'featured' });
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'library' | 'url'>('upload');

  // Article filters, search, and preview state
  const [articleFilter, setArticleFilter] = useState<'all' | 'Published' | 'Draft' | 'Archived'>('all');
  const [articleSearch, setArticleSearch] = useState('');
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // ZIP download state
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      onToast('Preparing debloom-app.zip...');
      const response = await fetch('/api/download-zip');
      if (!response.ok) {
        throw new Error('Download failed: ' + response.statusText);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'debloom-app.zip';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsDownloadingZip(false);
        onToast('debloom-app.zip downloaded successfully!');
      }, 500);
    } catch (err: any) {
      console.error('Download error:', err);
      setIsDownloadingZip(false);
      onToast('Direct download failed: ' + (err.message || 'Please use the top-right export button'));
    }
  };

  // Deletion confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'article' | 'opportunity' | 'resource' | 'challenge';
    id: string;
    title: string;
  } | null>(null);

  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);

  const [editingRes, setEditingRes] = useState<Resource | null>(null);
  const [isResModalOpen, setIsResModalOpen] = useState(false);

  const [editingChallenge, setEditingChallenge] = useState<BloomChallenge | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Bloom of the Week form state
  const [botwForm, setBotwForm] = useState<BloomOfTheWeek>(bloomOfTheWeek);

  // Role permissions
  const isAdmin = currentUser.role === 'admin';

  // Real Counts for Dashboard Cards (Zero or real, never fabricated)
  const draftsCount = articles.filter(a => a.status === 'Draft' || a.status === 'Review').length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'Pending').length;
  const pendingReportsCount = reports.filter(r => r.status === 'Open').length;
  const publishedArticlesCount = articles.filter(a => a.status === 'Published').length;
  const activeOpportunitiesCount = opportunities.filter(o => o.status === 'Verified/Open' || o.status === 'Closing Soon').length;
  const challengeEntriesCount = submissions.filter(s => s.type === 'Bloom Challenge entry').length;

  // ================= ARTICLE ACTIONS =================
  const handleOpenNewArticle = () => {
    const today = new Date().toISOString().split('T')[0];
    const newArticle: Article = {
      id: 'art-' + Date.now(),
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      author: currentUser.name || 'Debbie',
      authorRole: currentUser.role === 'admin' ? 'Founder' : 'Contributing Writer',
      category: 'Skills',
      tags: ['Skills'],
      createdDate: today,
      publishDate: today,
      readingTimeMinutes: 5,
      status: 'Draft',
      views: 0
    };
    setEditingArticle(newArticle);
    setIsArticleModalOpen(true);
  };

  const handleSaveArticleWithStatus = async (targetStatus?: ArticleStatus) => {
    if (!editingArticle) return;
    if (!editingArticle.title.trim()) {
      onToast('Please provide an article title before saving.');
      return;
    }

    const statusToUse: ArticleStatus = targetStatus || editingArticle.status;
    const baseSlug = editingArticle.slug.trim() || editingArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const today = new Date().toISOString().split('T')[0];

    const toSave: Article = {
      ...editingArticle,
      slug: baseSlug,
      status: statusToUse,
      createdDate: editingArticle.createdDate || today,
      updatedDate: today,
      publishDate: statusToUse === 'Published' ? (editingArticle.publishDate || today) : editingArticle.publishDate,
    };

    try {
      const saved = await articleService.save(toSave);
      setIsArticleModalOpen(false);
      setEditingArticle(null);
      onRefreshData();

      if (statusToUse === 'Published') {
        onToast(`Article "${saved.title}" published live! 🌱 (URL: /blog/${saved.slug})`);
      } else if (statusToUse === 'Archived') {
        onToast(`Article "${saved.title}" moved to archive.`);
      } else {
        onToast(`Draft "${saved.title}" saved. (Not visible on public site)`);
      }
    } catch (err: any) {
      console.error('Failed to save article:', err);
      onToast(`Failed to save article: ${err.message || 'Please check your admin login session.'}`);
    }
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveArticleWithStatus();
  };

  const handleQuickTogglePublish = async (article: Article) => {
    const isPub = article.status === 'Published';
    const newStatus: ArticleStatus = isPub ? 'Draft' : 'Published';
    const today = new Date().toISOString().split('T')[0];
    const updated: Article = {
      ...article,
      status: newStatus,
      updatedDate: today,
      publishDate: newStatus === 'Published' ? (article.publishDate || today) : article.publishDate,
    };
    try {
      await articleService.save(updated);
      onRefreshData();
      onToast(isPub ? `Article "${article.title}" unpublished (set to draft).` : `Article "${article.title}" published live! 🌱`);
    } catch (err: any) {
      onToast(`Error updating article: ${err.message}`);
    }
  };

  const handleQuickToggleArchive = async (article: Article) => {
    const isArchived = article.status === 'Archived';
    const newStatus: ArticleStatus = isArchived ? 'Draft' : 'Archived';
    const today = new Date().toISOString().split('T')[0];
    const updated: Article = {
      ...article,
      status: newStatus,
      updatedDate: today,
    };
    try {
      await articleService.save(updated);
      onRefreshData();
      onToast(isArchived ? `Article "${article.title}" restored from archive to draft.` : `Article "${article.title}" archived.`);
    } catch (err: any) {
      onToast(`Error archiving article: ${err.message}`);
    }
  };

  // Image upload and selection handlers
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, target: 'featured' | 'body' | 'opportunity') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('Please select a valid image file (JPEG, PNG, WebP, GIF, or SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      onToast('Image is larger than 8MB. Please select a smaller photo.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentUser.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {})
          },
          body: JSON.stringify({ image: base64Data, filename: file.name }),
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data.url) {
          throw new Error('Server did not return a valid persistent storage URL');
        }

        setIsUploading(false);
        applySelectedImage(data.url, target, imageCaptionInput || file.name.replace(/\.[^/.]+$/, ''));
        onToast('Image permanently stored in cloud media library! ☁️');
      } catch (err: any) {
        setIsUploading(false);
        console.error('Direct upload error:', err);
        onToast(`Image upload failed: ${err.message || 'Could not save to persistent storage'}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const applySelectedImage = (url: string, target: 'featured' | 'body' | 'opportunity', caption?: string) => {
    if (target === 'opportunity') {
      if (editingOpp) {
        setEditingOpp({
          ...editingOpp,
          featuredImage: url,
          imageAltText: caption || editingOpp.imageAltText || editingOpp.title
        });
        onToast('Opportunity banner image attached! ✨');
      }
    } else if (target === 'featured') {
      if (editingArticle) {
        setEditingArticle({
          ...editingArticle,
          featuredImage: url,
          imageAltText: caption || editingArticle.imageAltText || editingArticle.title
        });
        onToast('Featured banner image updated! ✨');
      }
    } else {
      if (editingArticle) {
        const cleanCaption = caption ? caption.trim() : 'Article illustration';
        const markdownImage = `\n\n![${cleanCaption}](${url})\n\n`;
        setEditingArticle({
          ...editingArticle,
          body: (editingArticle.body || '') + markdownImage,
        });
        onToast('Image inserted into article body! 🖼️');
      }
    }

    setImageModal({ isOpen: false, target: 'featured' });
    setImageCaptionInput('');
    setCustomImageUrlInput('');
  };

  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    if (!editingArticle) return;
    const body = editingArticle.body || '';
    const insertion = `\n\n${prefix}${placeholder}${suffix}\n\n`;
    setEditingArticle({
      ...editingArticle,
      body: body + insertion,
    });
  };

  const promptDelete = (type: 'article' | 'opportunity' | 'resource' | 'challenge', id: string, title: string) => {
    setDeleteDialog({ isOpen: true, type, id, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog) return;
    const { type, id, title } = deleteDialog;
    if (type === 'article') {
      articleService.delete(id);
      if (editingArticle?.id === id) {
        setIsArticleModalOpen(false);
        setEditingArticle(null);
      }
      onToast(`Article "${title}" permanently deleted.`);
    } else if (type === 'opportunity') {
      opportunityService.delete(id);
      onToast(`Opportunity "${title}" deleted.`);
    } else if (type === 'resource') {
      resourceService.delete(id);
      onToast(`Resource "${title}" deleted.`);
    } else if (type === 'challenge') {
      challengeService.delete(id);
      onToast(`Challenge "${title}" deleted.`);
    }
    setDeleteDialog(null);
    onRefreshData();
  };

  // ================= OPPORTUNITY ACTIONS =================
  const handleOpenNewOpp = () => {
    const newOpp: Opportunity = {
      id: 'opp-' + Date.now(),
      title: '',
      slug: '',
      organizer: '',
      description: '',
      category: 'Scholarship',
      eligibility: '',
      countryRegion: 'Global (including Nigeria)',
      deadline: '',
      cost: 'Free to apply',
      benefits: '',
      requirements: '',
      officialWebsite: '',
      applicationLink: '',
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      status: 'Verified/Open',
      clicks: 0,
      featuredImage: '',
      imageAltText: '',
      seoTitle: '',
      metaDescription: ''
    };
    setEditingOpp(newOpp);
    setIsOppModalOpen(true);
  };

  const handleSaveOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;
    if (!editingOpp.title.trim()) {
      onToast('Please provide a title for the opportunity.');
      return;
    }
    const autoSlug = editingOpp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const finalOpp: Opportunity = {
      ...editingOpp,
      slug: (editingOpp.slug && editingOpp.slug.trim()) ? editingOpp.slug.trim().toLowerCase() : autoSlug,
    };
    try {
      const saved = await opportunityService.save(finalOpp);
      setIsOppModalOpen(false);
      setEditingOpp(null);
      onRefreshData();
      onToast(`Opportunity "${saved.title}" saved! (URL: /opportunities/${saved.slug || saved.id})`);
    } catch (err: any) {
      onToast(`Failed to save opportunity: ${err.message}`);
    }
  };

  const handleDeleteOpp = async (id: string, title: string) => {
    if (!isAdmin) return;
    if (confirm(`Delete "${title}"?`)) {
      try {
        await opportunityService.delete(id);
        onRefreshData();
        onToast('Opportunity deleted.');
      } catch (err: any) {
        onToast(`Delete failed: ${err.message}`);
      }
    }
  };

  // ================= RESOURCE ACTIONS =================
  const handleOpenNewRes = () => {
    const newRes: Resource = {
      id: 'res-' + Date.now(),
      name: '',
      description: '',
      category: 'Online Learning',
      intendedAudience: 'Secondary & University Students',
      cost: 'Free',
      countryAvailability: 'Global',
      officialWebsite: '',
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      status: 'Published',
      clicks: 0
    };
    setEditingRes(newRes);
    setIsResModalOpen(true);
  };

  const handleSaveRes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;
    try {
      await resourceService.save(editingRes);
      setIsResModalOpen(false);
      setEditingRes(null);
      onRefreshData();
      onToast(`Resource "${editingRes.name}" saved to server!`);
    } catch (err: any) {
      onToast(`Failed to save resource: ${err.message}`);
    }
  };

  const handleDeleteRes = async (id: string, name: string) => {
    if (!isAdmin) return;
    if (confirm(`Delete resource "${name}"?`)) {
      try {
        await resourceService.delete(id);
        onRefreshData();
        onToast('Resource deleted.');
      } catch (err: any) {
        onToast(`Delete failed: ${err.message}`);
      }
    }
  };

  // ================= CHALLENGE ACTIONS =================
  const handleOpenNewChallenge = () => {
    const newChal: BloomChallenge = {
      id: 'chal-' + Date.now(),
      title: '',
      whatYoullDo: '',
      whatYouNeed: '',
      steps: ['Step 1: ', 'Step 2: ', 'Step 3: '],
      expectedOutput: '',
      howToSubmit: 'Submit your public document link via Debloom',
      whatYouCanLearn: '',
      difficulty: 'Beginner',
      status: 'Active',
      submissionsCount: 0
    };
    setEditingChallenge(newChal);
    setIsChallengeModalOpen(true);
  };

  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;
    try {
      await challengeService.save(editingChallenge);
      setIsChallengeModalOpen(false);
      setEditingChallenge(null);
      onRefreshData();
      onToast(`Bloom Challenge "${editingChallenge.title}" saved to server!`);
    } catch (err: any) {
      onToast(`Failed to save challenge: ${err.message}`);
    }
  };

  const handleDeleteChallenge = async (id: string, title: string) => {
    if (!isAdmin) return;
    if (confirm(`Delete challenge "${title}"?`)) {
      try {
        await challengeService.delete(id);
        onRefreshData();
        onToast('Challenge deleted.');
      } catch (err: any) {
        onToast(`Delete failed: ${err.message}`);
      }
    }
  };

  // ================= SUBMISSION & REPORT ACTIONS =================
  const handleUpdateSubmissionStatus = (id: string, status: UserSubmission['status']) => {
    submissionService.updateStatus(id, status);
    onRefreshData();
    onToast(`Submission updated to ${status}.`);
  };

  const handleUpdateReportStatus = (id: string, status: ContentReport['status']) => {
    reportService.updateStatus(id, status);
    onRefreshData();
    onToast(`Report updated to ${status}.`);
  };

  // ================= BLOOM OF THE WEEK ACTIONS =================
  const handleSaveBloomOfTheWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await bloomOfWeekService.save(botwForm);
      onRefreshData();
      onToast('Bloom of the Week spotlight updated on server!');
    } catch (err: any) {
      onToast(`Failed to update Bloom of the Week: ${err.message}`);
    }
  };

  const handleResetBloomOfTheWeek = async () => {
    if (!isAdmin) return;
    const reset = { awarded: false };
    setBotwForm(reset);
    try {
      await bloomOfWeekService.save(reset);
      onRefreshData();
      onToast('Bloom of the Week reset to honest empty state.');
    } catch (err: any) {
      onToast(`Failed to reset: ${err.message}`);
    }
  };

  // ================= SETTINGS SAVE =================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const saved = await settingsService.save(settingsForm);
      setSettingsForm(saved);
      onRefreshData();
      onToast(`Settings saved live! Telegram link is: ${saved.telegramChannelName}`);
    } catch (err: any) {
      console.error('Settings save error:', err);
      onToast(`Failed to save settings: ${err.message || 'Check admin session.'}`);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { 'Authorization': `Bearer ${currentUser?.token || ''}` }
      });
      if (!res.ok) throw new Error('Failed to generate backup');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debloom-database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      onToast('Database backup downloaded successfully! 💾');
    } catch (err: any) {
      onToast(`Backup failed: ${err.message}`);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token || ''}`
        },
        body: JSON.stringify(json)
      });
      if (!res.ok) throw new Error('Server rejected backup restore');
      onToast('Database successfully restored and synced to cloud! 🔄 Reloading data...');
      onRefreshData();
    } catch (err: any) {
      onToast(`Restore failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#1F2421]">
      
      {/* Top Admin Bar */}
      <header className="bg-[#163323] text-white border-b border-[#27523D] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8FA89B] text-[#163323] flex items-center justify-center font-bold">
              🌱
            </div>
            <div>
              <span className="font-editorial text-xl font-bold tracking-tight text-white block leading-none">
                DEBLOOM ADMIN
              </span>
              <span className="text-[10px] text-[#8FA89B] uppercase tracking-wider block mt-0.5">
                Content Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="flex items-center gap-1.5 text-xs text-[#163323] font-semibold bg-[#C49B4B] hover:bg-[#d8ab55] disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              title="Download entire project codebase as ZIP file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingZip ? 'Downloading...' : 'Download ZIP'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#12281B] rounded-lg border border-[#27523D]">
              <span className="w-2 h-2 rounded-full bg-[#C49B4B]" />
              <span>Signed in: <strong className="text-white">{currentUser.name}</strong></span>
              <span className="text-[#8FA89B]">({currentUser.role})</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-xs text-[#DCE7E1] hover:text-white bg-[#27523D] px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#E5E2D9] mb-6 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'articles', label: `Articles (${articles.length})`, icon: FileText },
            { id: 'opportunities', label: `Opportunities (${opportunities.length})`, icon: Compass },
            { id: 'resources', label: `Resources (${resources.length})`, icon: Wrench },
            { id: 'challenges', label: `Challenges (${challenges.length})`, icon: Target },
            { id: 'bloom-of-week', label: 'Bloom of Week 🌱', icon: Award },
            { id: 'submissions', label: `Submissions (${pendingSubmissionsCount} pending)`, icon: Inbox },
            { id: 'reports', label: `Reports (${pendingReportsCount} open)`, icon: AlertTriangle },
            { id: 'writers', label: 'Writers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as AdminTab)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                activeTab === id
                  ? 'bg-[#163323] text-white shadow-xs'
                  : 'bg-white text-[#57615C] border border-[#E5E2D9] hover:bg-[#F1F6F3]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            
            {/* Quick Actions Bar */}
            <div className="bg-white p-5 rounded-xl border border-[#E5E2D9] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#163323]">Quick Content Actions</h3>
                <p className="text-xs text-[#57615C]">Create verified entries directly into the Debloom database.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenNewArticle}
                  className="px-3 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#8FA89B]" />
                  <span>+ New Article</span>
                </button>
                <button
                  onClick={handleOpenNewOpp}
                  className="px-3 py-2 bg-white text-[#163323] border border-[#DCE7E1] text-xs font-semibold rounded-lg hover:bg-[#F1F6F3] flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#27523D]" />
                  <span>+ New Opportunity</span>
                </button>
                <button
                  onClick={handleOpenNewRes}
                  className="px-3 py-2 bg-white text-[#163323] border border-[#DCE7E1] text-xs font-semibold rounded-lg hover:bg-[#F1F6F3] flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#27523D]" />
                  <span>+ New Resource</span>
                </button>
                <button
                  onClick={handleOpenNewChallenge}
                  className="px-3 py-2 bg-white text-[#163323] border border-[#DCE7E1] text-xs font-semibold rounded-lg hover:bg-[#F1F6F3] flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#27523D]" />
                  <span>+ Create Challenge</span>
                </button>
              </div>
            </div>

            {/* Dashboard Real Count Cards (Section 18) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E5E2D9]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8681]">Drafts</div>
                <div className="text-2xl font-bold text-[#163323] mt-1">{draftsCount}</div>
                <div className="text-[10px] text-[#57615C] mt-1">Pending review / draft</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E2D9]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8681]">Pending Subs</div>
                <div className="text-2xl font-bold text-[#C49B4B] mt-1">{pendingSubmissionsCount}</div>
                <div className="text-[10px] text-[#57615C] mt-1">From public portal</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E2D9]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8681]">Pending Reports</div>
                <div className="text-2xl font-bold text-red-600 mt-1">{pendingReportsCount}</div>
                <div className="text-[10px] text-[#57615C] mt-1">Discrepancy flags</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E2D9]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8681]">Published Articles</div>
                <div className="text-2xl font-bold text-[#27523D] mt-1">{publishedArticlesCount}</div>
                <div className="text-[10px] text-[#57615C] mt-1">Live on site</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E2D9]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8681]">Active Opps</div>
                <div className="text-2xl font-bold text-[#27523D] mt-1">{activeOpportunitiesCount}</div>
                <div className="text-[10px] text-[#57615C] mt-1">Verified open</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E2D9]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8681]">Challenge Entries</div>
                <div className="text-2xl font-bold text-[#163323] mt-1">{challengeEntriesCount}</div>
                <div className="text-[10px] text-[#57615C] mt-1">Student submissions</div>
              </div>
            </div>

            {/* Recent Submissions preview */}
            <div className="bg-white rounded-xl border border-[#E5E2D9] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-lg font-bold text-[#163323]">
                  Latest User Submissions ({submissions.length})
                </h3>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="text-xs text-[#27523D] font-semibold hover:underline"
                >
                  View all in inbox →
                </button>
              </div>

              {submissions.length === 0 ? (
                <p className="text-xs text-[#57615C] py-4 text-center">
                  No public submissions yet. When students submit opportunities, challenge entries, or questions, they will appear here.
                </p>
              ) : (
                <div className="divide-y divide-[#E5E2D9]">
                  {submissions.slice(0, 4).map(sub => (
                    <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#163323] mr-2">[{sub.type}]</span>
                        <span className="text-[#57615C]">{sub.submitterName || 'Anonymous'}</span>
                        <span className="text-[#7B8681] ml-2">· {new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sub.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {sub.status}
                        </span>
                        <button
                          onClick={() => setActiveTab('submissions')}
                          className="text-[#27523D] hover:underline font-medium"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 2: ARTICLES ================= */}
        {activeTab === 'articles' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                  Articles & Guides Management
                </h2>
                <p className="text-xs text-[#57615C]">
                  Draft, preview, publish, and manage educational student guides.
                </p>
              </div>
              <button
                onClick={handleOpenNewArticle}
                className="px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] flex items-center gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ New Article</span>
              </button>
            </div>

            {/* Filter Tabs & Search Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-[#E5E2D9]">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All', count: articles.length },
                  { id: 'Published', label: 'Published', count: articles.filter(a => a.status === 'Published').length },
                  { id: 'Draft', label: 'Drafts', count: articles.filter(a => a.status === 'Draft' || a.status === 'Review').length },
                  { id: 'Archived', label: 'Archived', count: articles.filter(a => a.status === 'Archived').length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setArticleFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      articleFilter === tab.id
                        ? 'bg-[#163323] text-white shadow-xs'
                        : 'text-[#57615C] hover:text-[#163323] hover:bg-[#F1F6F3]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      articleFilter === tab.id ? 'bg-[#27523D] text-[#8FA89B]' : 'bg-[#EFECE1] text-[#7B8681]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7B8681]" />
                <input
                  type="text"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Search articles by title, slug..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FCFBF7] border border-[#E5E2D9] rounded-lg text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>
            </div>

            {/* Articles Table or Empty State */}
            {(() => {
              const filteredArticles = articles.filter(a => {
                const matchesFilter = articleFilter === 'all' 
                  ? true 
                  : articleFilter === 'Draft' 
                    ? (a.status === 'Draft' || a.status === 'Review') 
                    : a.status === articleFilter;
                const q = articleSearch.trim().toLowerCase();
                const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
                return matchesFilter && matchesSearch;
              });

              if (filteredArticles.length === 0) {
                return (
                  <div className="bg-white rounded-xl border border-[#E5E2D9] p-12 text-center space-y-3">
                    <p className="font-editorial text-lg text-[#163323] font-semibold">
                      {articles.length === 0 ? '🌱 No articles created yet' : 'No articles match this filter'}
                    </p>
                    <p className="text-xs text-[#57615C] max-w-sm mx-auto leading-relaxed">
                      {articles.length === 0 
                        ? 'All sample articles have been removed. Click "+ New Article" to draft or publish your first verified student guide.'
                        : 'Try selecting a different status filter or clearing your search keywords.'}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleOpenNewArticle}
                        className="px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Create Article</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-white rounded-xl border border-[#E5E2D9] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF2DC] border-b border-[#E5E2D9] text-[#163323] font-semibold">
                        <tr>
                          <th className="p-3.5">Title & Slug</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Author</th>
                          <th className="p-3.5">Views</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Dates</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E2D9]">
                        {filteredArticles.map(article => (
                          <tr key={article.id} className="hover:bg-[#FCFBF7] transition-colors">
                            <td className="p-3.5 max-w-xs">
                              <div className="font-semibold text-[#163323] truncate">{article.title}</div>
                              <div className="text-[11px] text-[#7B8681] font-mono truncate">/{article.slug}</div>
                            </td>
                            <td className="p-3.5 text-[#57615C] whitespace-nowrap">{article.category}</td>
                            <td className="p-3.5 text-[#57615C] whitespace-nowrap">{article.author}</td>
                            <td className="p-3.5 text-[#163323] font-medium whitespace-nowrap">
                              <span className="inline-flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-[#8FA89B]" />
                                <span>{article.views || 0} views</span>
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                article.status === 'Published' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : article.status === 'Archived'
                                  ? 'bg-stone-100 text-stone-700 border-stone-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {article.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-[#7B8681] whitespace-nowrap text-[11px]">
                              <div>Pub: {article.publishDate || '—'}</div>
                              {article.updatedDate && (
                                <div className="text-[10px] text-[#A0AAA4]">Upd: {article.updatedDate}</div>
                              )}
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                              {/* Preview Action */}
                              <button
                                type="button"
                                onClick={() => setPreviewArticle(article)}
                                className="p-1.5 rounded-md text-[#57615C] hover:text-[#163323] hover:bg-[#F1F6F3] transition-colors cursor-pointer"
                                title="Live Preview"
                              >
                                <Eye className="w-3.5 h-3.5 inline" />
                              </button>

                              {/* Edit Action */}
                              <button
                                type="button"
                                onClick={() => { setEditingArticle(article); setIsArticleModalOpen(true); }}
                                className="p-1.5 rounded-md text-[#27523D] hover:text-[#163323] hover:bg-[#F1F6F3] transition-colors cursor-pointer"
                                title="Edit Article"
                              >
                                <Edit className="w-3.5 h-3.5 inline" />
                              </button>

                              {/* Publish / Unpublish Action */}
                              <button
                                type="button"
                                onClick={() => handleQuickTogglePublish(article)}
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                  article.status === 'Published'
                                    ? 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                                }`}
                                title={article.status === 'Published' ? 'Unpublish to draft' : 'Publish to live website'}
                              >
                                {article.status === 'Published' ? (
                                  <RotateCcw className="w-3.5 h-3.5 inline" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 inline" />
                                )}
                              </button>

                              {/* Archive Action */}
                              <button
                                type="button"
                                onClick={() => handleQuickToggleArchive(article)}
                                className="p-1.5 rounded-md text-[#7B8681] hover:text-[#1F2421] hover:bg-[#F1F6F3] transition-colors cursor-pointer"
                                title={article.status === 'Archived' ? 'Restore from archive' : 'Archive article'}
                              >
                                <Archive className="w-3.5 h-3.5 inline" />
                              </button>

                              {/* Delete Action */}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => promptDelete('article', article.id, article.title)}
                                  className="p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB 3: OPPORTUNITIES ================= */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                  Verified Opportunities Management
                </h2>
                <p className="text-xs text-[#57615C]">
                  Maintain strict verification for scholarships, fellowships, and internships.
                </p>
              </div>
              <button
                onClick={handleOpenNewOpp}
                className="px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ New Opportunity</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E2D9] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF2DC] border-b border-[#E5E2D9] text-[#163323] font-semibold">
                    <tr>
                      <th className="p-3.5">Title & Organizer</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Region</th>
                      <th className="p-3.5">Deadline</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2D9]">
                    {opportunities.map(opp => (
                      <tr key={opp.id} className="hover:bg-[#FCFBF7]">
                        <td className="p-3.5">
                          <div className="font-semibold text-[#163323]">{opp.title}</div>
                          <div className="text-[11px] text-[#7B8681]">{opp.organizer}</div>
                        </td>
                        <td className="p-3.5 text-[#57615C]">{opp.category}</td>
                        <td className="p-3.5 text-[#57615C]">{opp.countryRegion}</td>
                        <td className="p-3.5 text-[#57615C]">{opp.deadline}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            opp.status === 'Verified/Open' ? 'bg-emerald-100 text-emerald-800' :
                            opp.status === 'Closing Soon' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {opp.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => { setEditingOpp(opp); setIsOppModalOpen(true); }}
                            className="p-1 text-[#27523D] hover:text-[#163323]"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5 inline" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteOpp(opp.id, opp.title)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: RESOURCES ================= */}
        {activeTab === 'resources' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                  Curated Resources Management
                </h2>
                <p className="text-xs text-[#57615C]">
                  Tools, websites, and open courseware for student capability.
                </p>
              </div>
              <button
                onClick={handleOpenNewRes}
                className="px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ New Resource</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E2D9] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF2DC] border-b border-[#E5E2D9] text-[#163323] font-semibold">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Cost</th>
                      <th className="p-3.5">Audience</th>
                      <th className="p-3.5">Last Verified</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2D9]">
                    {resources.map(res => (
                      <tr key={res.id} className="hover:bg-[#FCFBF7]">
                        <td className="p-3.5 font-semibold text-[#163323]">{res.name}</td>
                        <td className="p-3.5 text-[#57615C]">{res.category}</td>
                        <td className="p-3.5 text-[#57615C]">{res.cost}</td>
                        <td className="p-3.5 text-[#57615C]">{res.intendedAudience}</td>
                        <td className="p-3.5 text-[#7B8681]">{res.lastVerifiedDate}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => { setEditingRes(res); setIsResModalOpen(true); }}
                            className="p-1 text-[#27523D] hover:text-[#163323]"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5 inline" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteRes(res.id, res.name)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: CHALLENGES ================= */}
        {activeTab === 'challenges' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                  Bloom Challenges Management
                </h2>
                <p className="text-xs text-[#57615C]">
                  Configure practical, step-by-step tasks that link to Debloom educational guides.
                </p>
              </div>
              <button
                onClick={handleOpenNewChallenge}
                className="px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Create Challenge</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(chal => (
                <div key={chal.id} className="bg-white p-5 rounded-xl border border-[#E5E2D9] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#27523D]">{chal.difficulty}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      chal.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {chal.status}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg font-bold text-[#163323]">
                    {chal.title}
                  </h3>

                  <p className="text-xs text-[#57615C] leading-relaxed line-clamp-2">
                    {chal.whatYoullDo}
                  </p>

                  <div className="text-xs text-[#7B8681]">
                    Steps: {chal.steps.length} | Output: {chal.expectedOutput}
                  </div>

                  <div className="pt-3 border-t border-[#F1F6F3] flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingChallenge(chal); setIsChallengeModalOpen(true); }}
                      className="px-3 py-1.5 text-xs text-[#27523D] hover:bg-[#F1F6F3] rounded-lg"
                    >
                      Edit Challenge
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteChallenge(chal.id, chal.title)}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: BLOOM OF THE WEEK ================= */}
        {activeTab === 'bloom-of-week' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-[#E5E2D9] space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#163323] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C49B4B]" />
                <span>Bloom of the Week Recognition</span>
              </h2>
              <p className="text-xs text-[#57615C] mt-1">
                Adhere strictly to the Content Trust Rule: If no student work has been selected, maintain the honest empty state.
              </p>
            </div>

            <form onSubmit={handleSaveBloomOfTheWeek} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="awardedCheck"
                  checked={botwForm.awarded}
                  onChange={(e) => setBotwForm({ ...botwForm, awarded: e.target.checked })}
                  className="rounded border-[#E5E2D9] text-[#163323] focus:ring-[#163323]"
                />
                <label htmlFor="awardedCheck" className="text-xs font-semibold text-[#1F2421]">
                  Bloom of the Week is Currently Awarded
                </label>
              </div>

              {botwForm.awarded && (
                <div className="space-y-4 pt-2 border-t border-[#E5E2D9]">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Student Name *
                    </label>
                    <input
                      required={botwForm.awarded}
                      type="text"
                      value={botwForm.studentName || ''}
                      onChange={(e) => setBotwForm({ ...botwForm, studentName: e.target.value })}
                      placeholder="E.g., Emeka Okafor"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Challenge Title *
                    </label>
                    <input
                      required={botwForm.awarded}
                      type="text"
                      value={botwForm.challengeTitle || ''}
                      onChange={(e) => setBotwForm({ ...botwForm, challengeTitle: e.target.value })}
                      placeholder="The 7-Day Curiosity Audit"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Work Description & Standout Details *
                    </label>
                    <textarea
                      required={botwForm.awarded}
                      rows={3}
                      value={botwForm.outputDescription || ''}
                      onChange={(e) => setBotwForm({ ...botwForm, outputDescription: e.target.value })}
                      placeholder="Describe the student's submission and why it stood out..."
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Public Link to Student Artifact
                    </label>
                    <input
                      type="url"
                      value={botwForm.submissionLink || ''}
                      onChange={(e) => setBotwForm({ ...botwForm, submissionLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Date Awarded
                    </label>
                    <input
                      type="text"
                      value={botwForm.dateAwarded || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBotwForm({ ...botwForm, dateAwarded: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Student Reflection (optional quote)
                    </label>
                    <textarea
                      rows={2}
                      value={botwForm.reflection || ''}
                      onChange={(e) => setBotwForm({ ...botwForm, reflection: e.target.value })}
                      placeholder="What the student said they gained from the exercise"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-[#E5E2D9]">
                <button
                  type="button"
                  onClick={handleResetBloomOfTheWeek}
                  className="text-xs text-red-600 hover:underline"
                >
                  Reset to Unawarded Empty State
                </button>

                <button
                  type="submit"
                  disabled={!isAdmin}
                  className="px-5 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] transition-colors"
                >
                  Save Spotlight State
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 7: SUBMISSIONS INBOX ================= */}
        {activeTab === 'submissions' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                Submissions Moderation Inbox ({submissions.length})
              </h2>
              <p className="text-xs text-[#57615C]">
                Review public opportunities, resources, challenge entries, and student questions.
              </p>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E2D9] p-8 text-center text-xs text-[#57615C]">
                No submissions in inbox.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map(sub => (
                  <div key={sub.id} className="bg-white p-5 rounded-xl border border-[#E5E2D9] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#163323]">{sub.type}</span>
                        <span className="text-[#7B8681]">· Submitted by: {sub.submitterName || 'Anonymous'}</span>
                        {sub.submitterContact && (
                          <span className="text-[#27523D]">({sub.submitterContact})</span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        sub.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F7F5EE] rounded-lg text-xs font-mono space-y-1 overflow-x-auto text-[#2D3430]">
                      {Object.entries(sub.payload).map(([k, v]) => (
                        <div key={k}>
                          <strong className="text-[#163323]">{k}:</strong> {String(v)}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-[#F1F6F3]">
                      <span className="text-[#7B8681] text-[11px]">{new Date(sub.submittedAt).toLocaleString()}</span>
                      
                      <div className="flex items-center gap-2">
                        {sub.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateSubmissionStatus(sub.id, 'Approved')}
                              className="px-3 py-1 bg-emerald-700 text-white rounded-md text-xs font-medium hover:bg-emerald-800"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateSubmissionStatus(sub.id, 'Rejected')}
                              className="px-3 py-1 bg-stone-300 text-stone-800 rounded-md text-xs font-medium hover:bg-stone-400"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {sub.status !== 'Pending' && (
                          <button
                            onClick={() => handleUpdateSubmissionStatus(sub.id, 'Pending')}
                            className="text-xs text-[#27523D] hover:underline"
                          >
                            Mark as Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 8: REPORTS & CORRECTIONS ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                Reports & Discrepancies Inbox ({reports.length})
              </h2>
              <p className="text-xs text-[#57615C]">
                User flags on broken links, changed deadlines, or inaccurate eligibility criteria.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E2D9] p-8 text-center text-xs text-[#57615C]">
                No reports currently logged. The directory is operating cleanly! 🌱
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(rep => (
                  <div key={rep.id} className="bg-white p-5 rounded-xl border border-[#E5E2D9] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-red-700 mr-2">[{rep.targetType.toUpperCase()}]</span>
                        <strong className="text-[#163323]">{rep.targetTitle}</strong>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rep.status === 'Open' ? 'bg-red-100 text-red-800' :
                        rep.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div><strong>Discrepancy:</strong> {rep.whatNeedsCorrection}</div>
                      <div><strong>User Note:</strong> {rep.whatIsCurrentlyWrong}</div>
                      {rep.suggestedCorrection && (
                        <div><strong>Suggested fix:</strong> {rep.suggestedCorrection}</div>
                      )}
                      {rep.supportingSource && (
                        <div><strong>Source:</strong> <a href={rep.supportingSource} target="_blank" rel="noreferrer" className="text-[#27523D] underline">{rep.supportingSource}</a></div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-[#F1F6F3]">
                      <span className="text-[11px] text-[#7B8681]">{new Date(rep.reportedAt).toLocaleString()}</span>
                      
                      <div className="flex items-center gap-2">
                        {rep.status === 'Open' ? (
                          <>
                            <button
                              onClick={() => handleUpdateReportStatus(rep.id, 'Resolved')}
                              className="px-3 py-1 bg-emerald-700 text-white rounded-md text-xs font-semibold hover:bg-emerald-800"
                            >
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => handleUpdateReportStatus(rep.id, 'Rejected')}
                              className="px-3 py-1 bg-stone-200 text-stone-700 rounded-md text-xs font-semibold hover:bg-stone-300"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, 'Open')}
                            className="text-xs text-[#27523D] hover:underline"
                          >
                            Re-open
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 9: WRITERS ================= */}
        {activeTab === 'writers' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                Writer & Contributor Management
              </h2>
              <p className="text-xs text-[#57615C]">
                Approved writers can draft articles and submit for admin review.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E2D9] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF2DC] border-b border-[#E5E2D9] text-[#163323] font-semibold">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Published Articles</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]">
                  {writers.map(w => (
                    <tr key={w.id}>
                      <td className="p-3.5 font-semibold text-[#163323]">{w.name}</td>
                      <td className="p-3.5 text-[#57615C]">{w.email}</td>
                      <td className="p-3.5 font-medium">{w.role}</td>
                      <td className="p-3.5 text-[#57615C]">{w.publishedArticlesCount}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 10: ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                Privacy-Conscious Platform Analytics
              </h2>
              <p className="text-xs text-[#57615C]">
                Real event tracking: Article reads, opportunity clicks, search queries, and challenge entries.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(analyticsService.getSummary()).map(([key, val]) => (
                <div key={key} className="bg-white p-4 rounded-xl border border-[#E5E2D9]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8681] truncate">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-2xl font-bold text-[#163323] mt-1">{val}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#E5E2D9] p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#163323]">Recent Event Log (Live)</h3>
              <div className="divide-y divide-[#E5E2D9] max-h-80 overflow-y-auto">
                {analyticsService.getEvents().slice(0, 30).map(evt => (
                  <div key={evt.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#27523D]">{evt.type}</span>
                    <span className="text-[#57615C] truncate max-w-sm">{evt.detail}</span>
                    <span className="text-[11px] text-[#7B8681]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 11: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-[#E5E2D9] space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                Debloom Platform Settings
              </h2>
              <p className="text-xs text-[#57615C]">
                Configure public Telegram channel, contact point, and top banner notices.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Telegram Channel URL
                </label>
                <input
                  type="url"
                  value={settingsForm.telegramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, telegramUrl: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Telegram Display Handle
                </label>
                <input
                  type="text"
                  value={settingsForm.telegramChannelName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, telegramChannelName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Public Contact Email
                </label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Top Announcement Banner (optional)
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementNotice || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementNotice: e.target.value })}
                  placeholder="Welcome to Debloom 🌱. Start where you are. Bloom from there."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E2D9] flex justify-end">
                <button
                  type="submit"
                  disabled={!isAdmin}
                  className="px-5 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] transition-colors cursor-pointer"
                >
                  Save Platform Settings
                </button>
              </div>
            </form>

            {/* Cloud Database & Safe Backups Section */}
            <div className="pt-6 border-t border-[#E5E2D9] space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#27523D]" />
                <h3 className="text-sm font-bold text-[#163323]">
                  Cloud Database & Safe Backups
                </h3>
              </div>

              <div className="p-4 bg-[#F1F6F3] rounded-xl border border-[#C5DDD1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#163323]">Persistent Storage</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Google Cloud Firestore (Connected & Active)
                  </span>
                </div>
                <p className="text-[11px] text-[#57615C] leading-relaxed">
                  Your articles, opportunities, challenges, and settings are backed up to Google Cloud Firestore. Your content stays online permanently across container restarts and cloud redeployments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-4 py-2.5 bg-white border border-[#E5E2D9] hover:bg-[#F7F5EE] text-[#163323] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#27523D]" />
                  <span>Download Backup (JSON)</span>
                </button>

                <label className="px-4 py-2.5 bg-white border border-[#E5E2D9] hover:bg-[#F7F5EE] text-[#163323] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-center shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-[#27523D]" />
                  <span>Restore from Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL: ARTICLE EDITOR ================= */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-4xl bg-[#FCFBF7] rounded-2xl shadow-2xl border border-[#E5E2D9] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5E2D9] bg-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-[#163323]">
                  {articles.some(a => a.id === editingArticle.id) ? 'Edit Article' : 'Create New Article'}
                </h3>
                <p className="text-xs text-[#7B8681] mt-0.5">
                  Publish to the Debloom reading room or save as private draft
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsArticleModalOpen(false)} 
                className="p-1.5 rounded-lg text-[#7B8681] hover:text-[#1F2421] hover:bg-[#F1F6F3] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 sm:p-8 space-y-6">
              
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">Title *</label>
                  <input
                    required
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingArticle({ 
                        ...editingArticle, 
                        title: newTitle,
                        slug: editingArticle.slug ? editingArticle.slug : autoSlug
                      });
                    }}
                    placeholder="E.g., What If Your Biggest Limitation Is a Thought?"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">Slug (URL path) *</label>
                  <input
                    type="text"
                    value={editingArticle.slug}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    placeholder="what-if-your-biggest-limitation-is-a-thought"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] font-mono focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                  Subtitle (Optional, e.g. "You Don't Know What You Don't Know.")
                </label>
                <input
                  type="text"
                  value={editingArticle.subtitle || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                  placeholder="You Don't Know What You Don't Know."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              {/* Author, Category, Status, Reading Time */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">Author</label>
                  <input
                    type="text"
                    value={editingArticle.author}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                    placeholder="Debbie"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">Category</label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  >
                    <option value="Skills">Skills</option>
                    <option value="University Prep">University Prep</option>
                    <option value="Career Exploration">Career Exploration</option>
                    <option value="Student Development">Student Development</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">Status</label>
                  <select
                    value={editingArticle.status}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as ArticleStatus })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  >
                    <option value="Draft">Draft (Private)</option>
                    <option value="Published">Published (Public)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">Reading Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editingArticle.readingTimeMinutes}
                    onChange={(e) => setEditingArticle({ ...editingArticle, readingTimeMinutes: parseInt(e.target.value) || 5 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>
              </div>

              {/* Tags & Featured Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingArticle.tags ? editingArticle.tags.join(', ') : ''}
                    onChange={(e) => {
                      const tagsArray = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setEditingArticle({ ...editingArticle, tags: tagsArray });
                    }}
                    placeholder="Mindset, Growth, Practical Skills"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5 flex items-center justify-between">
                    <span>Featured Image (Blog Banner)</span>
                    {editingArticle.featuredImage && (
                      <span className="text-[10px] text-[#27523D] font-medium">✓ Image Attached</span>
                    )}
                  </label>

                  {editingArticle.featuredImage ? (
                    <div className="space-y-2">
                      <div className="relative h-28 rounded-xl overflow-hidden border border-[#E5E2D9] bg-[#F7F5EE] group">
                        <img 
                          src={editingArticle.featuredImage} 
                          alt={editingArticle.imageAltText || editingArticle.title} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => setImageModal({ isOpen: true, target: 'featured' })}
                            className="px-2.5 py-1 bg-white text-[#163323] text-xs font-semibold rounded-lg shadow-sm hover:bg-[#F1F6F3] cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const imgUrl = editingArticle.featuredImage || '';
                              const full = imgUrl.startsWith('http')
                                ? imgUrl
                                : `${window.location.origin}${imgUrl}`;
                              navigator.clipboard.writeText(full);
                              onToast('Direct image link copied to clipboard! 🔗');
                            }}
                            className="px-2.5 py-1 bg-[#163323] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#27523D] cursor-pointer"
                          >
                            Copy Link
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingArticle({ ...editingArticle, featuredImage: '' })}
                            className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editingArticle.imageAltText || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, imageAltText: e.target.value })}
                        placeholder="Image alt text (Descriptive text for accessibility & SEO)..."
                        className="w-full text-[11px] p-2 rounded-lg border border-[#E5E2D9] bg-white"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setImageModal({ isOpen: true, target: 'featured' })}
                        className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-[#8FA89B] bg-[#F1F6F3] hover:bg-[#E5EFE9] text-[#163323] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-[#27523D]" />
                        <span>Add Featured Banner Image</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Short Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                  Short Excerpt * (Used in search results and card previews)
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingArticle.excerpt}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  placeholder="A concise, honest summary for students..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              {/* Rich Visual WYSIWYG Editor */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-semibold text-[#1F2421]">
                    Article Content * (Visual Rich Text Editor)
                  </label>
                  <span className="text-[11px] text-[#7B8681]">
                    Write naturally. Use the toolbar for bold, headings, blockquotes, lists, links & images.
                  </span>
                </div>

                <RichTextEditor
                  value={editingArticle.body}
                  onChange={(content) => setEditingArticle({ ...editingArticle, body: content })}
                  onOpenImageModal={() => setImageModal({ isOpen: true, target: 'body' })}
                  onPreview={() => setPreviewArticle(editingArticle)}
                  placeholder="Write your article naturally here... Select text and click B for bold, H2 for heading, or Quote for blockquote."
                />
              </div>

              {/* SEO & Linked Challenge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E5E2D9]">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">SEO Title (Optional)</label>
                  <input
                    type="text"
                    value={editingArticle.seoTitle || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, seoTitle: e.target.value })}
                    placeholder={editingArticle.title || 'Page title for search engines'}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">SEO Meta Description (Optional)</label>
                  <input
                    type="text"
                    value={editingArticle.metaDescription || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, metaDescription: e.target.value })}
                    placeholder={editingArticle.excerpt || 'Brief description for search engines'}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">Link to Bloom Challenge (Optional)</label>
                  <select
                    value={editingArticle.bloomChallengeId || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, bloomChallengeId: e.target.value || undefined })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  >
                    <option value="">No Challenge Linked</option>
                    {challenges.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Audit Dates Indicator */}
              <div className="text-[11px] text-[#7B8681] bg-[#F7F5EE] p-3 rounded-xl border border-[#E5E2D9] flex flex-wrap gap-4">
                <span>Created: <strong>{editingArticle.createdDate || 'Today'}</strong></span>
                <span>Last Updated: <strong>{editingArticle.updatedDate || 'Today'}</strong></span>
                <span>Publish Date: <strong>{editingArticle.status === 'Published' ? (editingArticle.publishDate || 'Today') : 'Draft (Unpublished)'}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  {articles.some(a => a.id === editingArticle.id) && isAdmin && (
                    <button
                      type="button"
                      onClick={() => promptDelete('article', editingArticle.id, editingArticle.title)}
                      className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Article</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreviewArticle(editingArticle)}
                    className="px-4 py-2 text-xs font-semibold text-[#163323] bg-white border border-[#E5E2D9] hover:bg-[#F1F6F3] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsArticleModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#57615C] hover:bg-[#EFECE1] rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveArticleWithStatus('Draft')}
                    className="px-4 py-2 bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl hover:bg-stone-300 transition-colors cursor-pointer"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveArticleWithStatus('Published')}
                    className="px-5 py-2 bg-[#163323] text-white text-xs font-semibold rounded-xl hover:bg-[#27523D] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Publish Article</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMAGE ASSISTANT ================= */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#12281B]/75 backdrop-blur-xs">
          <div 
            className="w-full max-w-2xl bg-[#FCFBF7] rounded-2xl shadow-2xl border border-[#E5E2D9] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-[#E5E2D9] bg-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h4 className="font-editorial text-xl font-bold text-[#163323] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#C49B4B]" />
                  <span>{imageModal.target === 'featured' ? 'Set Featured Blog Banner' : 'Insert Image into Article'}</span>
                </h4>
                <p className="text-xs text-[#7B8681] mt-0.5">
                  Upload your own photo from device or pick from curated free student & study photos
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImageModal({ isOpen: false, target: 'featured' })}
                className="p-1.5 rounded-lg text-[#7B8681] hover:text-[#1F2421] hover:bg-[#F1F6F3] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E5E2D9] bg-[#F7F5EE] px-5 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveImageTab('upload')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeImageTab === 'upload'
                    ? 'bg-white text-[#163323] border-t-2 border-[#163323] shadow-xs'
                    : 'text-[#57615C] hover:text-[#163323]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('library')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeImageTab === 'library'
                    ? 'bg-white text-[#163323] border-t-2 border-[#163323] shadow-xs'
                    : 'text-[#57615C] hover:text-[#163323]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Free Photo Library (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('url')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeImageTab === 'url'
                    ? 'bg-white text-[#163323] border-t-2 border-[#163323] shadow-xs'
                    : 'text-[#57615C] hover:text-[#163323]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Paste Web URL</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Optional Caption Field (shown for all tabs) */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Image Caption / Alt Text (Optional)
                </label>
                <input
                  type="text"
                  value={imageCaptionInput}
                  onChange={(e) => setImageCaptionInput(e.target.value)}
                  placeholder="E.g., Student preparing study notes for exams"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              {/* TAB 1: UPLOAD */}
              {activeImageTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-[#8FA89B] rounded-2xl p-8 text-center bg-[#F1F6F3]/50 hover:bg-[#F1F6F3] transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadFile(e, imageModal.target)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#163323] text-white flex items-center justify-center shadow-xs">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-[#C49B4B]" />
                        ) : (
                          <Upload className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="font-editorial text-lg font-bold text-[#163323]">
                        {isUploading ? 'Uploading and optimizing...' : 'Click to choose image from your phone or PC'}
                      </div>
                      <p className="text-xs text-[#7B8681]">
                        Supports JPG, PNG, WEBP, GIF up to 8MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CURATED LIBRARY */}
              {activeImageTab === 'library' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#57615C]">
                    Click any photo to instantly {imageModal.target === 'opportunity' ? 'set it as your opportunity banner' : imageModal.target === 'featured' ? 'set it as your blog banner' : 'insert it into your article'}:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                    {CURATED_STUDY_IMAGES.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => applySelectedImage(img.url, imageModal.target, imageCaptionInput || img.title)}
                        className="group relative h-32 rounded-xl overflow-hidden border border-[#E5E2D9] cursor-pointer hover:border-[#163323] hover:shadow-md transition-all bg-[#F7F5EE]"
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                          <span className="text-[10px] uppercase font-bold text-[#C49B4B] tracking-wider">
                            {img.category}
                          </span>
                          <span className="text-xs font-semibold leading-tight line-clamp-1">
                            {img.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WEB URL */}
              {activeImageTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Direct Image Web Link (URL) *
                    </label>
                    <input
                      type="url"
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/... or https://..."
                      className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>

                  {customImageUrlInput && (
                    <div className="h-40 rounded-xl overflow-hidden border border-[#E5E2D9] bg-[#F7F5EE]">
                      <img
                        src={customImageUrlInput}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!customImageUrlInput}
                      onClick={() => applySelectedImage(customImageUrlInput, imageModal.target, imageCaptionInput)}
                      className="px-5 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-xl hover:bg-[#27523D] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {imageModal.target === 'opportunity' ? 'Set as Opportunity Banner' : imageModal.target === 'featured' ? 'Set as Featured Banner' : 'Insert into Article'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E5E2D9] bg-[#F7F5EE] flex justify-end">
              <button
                type="button"
                onClick={() => setImageModal({ isOpen: false, target: 'featured' })}
                className="px-4 py-2 text-xs font-medium text-[#57615C] hover:bg-[#EFECE1] rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ARTICLE PREVIEW ================= */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/70 backdrop-blur-xs">
          <div 
            className="w-full max-w-4xl bg-[#FCFBF7] rounded-2xl shadow-2xl border border-[#E5E2D9] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Banner */}
            <div className="p-4 bg-[#FAF2DC] border-b border-[#E5E2D9] flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#163323] text-white">
                  Live Preview
                </span>
                <span className="text-xs text-[#57615C]">
                  Status: <strong>{previewArticle.status}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewArticle.status !== 'Published' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const updated = { 
                        ...previewArticle, 
                        status: 'Published' as ArticleStatus, 
                        publishDate: new Date().toISOString().split('T')[0] 
                      };
                      try {
                        const saved = await articleService.save(updated);
                        setPreviewArticle(null);
                        setIsArticleModalOpen(false);
                        onRefreshData();
                        onToast(`Article "${saved.title}" published live! 🌱 (URL: /blog/${saved.slug})`);
                      } catch (err: any) {
                        onToast(`Failed to publish: ${err.message}`);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#163323] text-white text-xs font-semibold rounded-xl hover:bg-[#27523D] transition-colors cursor-pointer shadow-xs"
                  >
                    Publish Now Live
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewArticle(null)}
                  className="p-1 rounded-lg text-[#7B8681] hover:text-[#1F2421] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Content as Public Readers See It */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#57615C]">
                  <span className="font-semibold text-[#27523D]">{previewArticle.category}</span>
                  <span>·</span>
                  <span>{previewArticle.readingTimeMinutes || 4} min read</span>
                  <span>·</span>
                  <span>Published {previewArticle.publishDate || new Date().toISOString().split('T')[0]}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#7B8681]">
                    <Eye className="w-3.5 h-3.5 text-[#8FA89B]" />
                    <span>{previewArticle.views || 0} views</span>
                  </span>
                </div>

                <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] leading-tight">
                  {previewArticle.title || 'Untitled Article'}
                </h1>

                {previewArticle.subtitle && (
                  <p className="font-editorial text-xl sm:text-2xl text-[#27523D] font-medium tracking-tight -mt-1">
                    {previewArticle.subtitle}
                  </p>
                )}

                {previewArticle.excerpt && (
                  <div className="p-4 bg-[#F1F6F3] border-l-3 border-[#27523D] rounded-r-xl">
                    <p className="text-sm text-[#2D3430] italic leading-relaxed">
                      "{previewArticle.excerpt}"
                    </p>
                  </div>
                )}
              </div>

              {previewArticle.featuredImage && (
                <figure className="rounded-xl overflow-hidden max-h-80 border border-[#E5E2D9]">
                  <img
                    src={previewArticle.featuredImage}
                    alt={previewArticle.imageAltText || previewArticle.title}
                    className="w-full h-full object-cover"
                  />
                  {previewArticle.imageAltText && (
                    <figcaption className="text-center text-xs text-[#7B8681] italic py-1.5 bg-[#FAF8F2] border-t border-[#E5E2D9]">
                      {previewArticle.imageAltText}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Rendered Body with Full Editorial Typography */}
              <div className="pt-4 border-t border-[#E5E2D9]">
                {previewArticle.body ? (
                  <ArticleContentRenderer content={previewArticle.body} />
                ) : (
                  <p className="text-xs text-[#7B8681] italic">Body text will appear here.</p>
                )}
              </div>

              {previewArticle.tags && previewArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#E5E2D9]">
                  {previewArticle.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-lg text-xs text-[#57615C]">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-[#E5E2D9] flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-5 py-2 bg-[#163323] text-white text-xs font-semibold rounded-xl hover:bg-[#27523D] cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteDialog && deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E2D9] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#163323]">
                  Delete {deleteDialog.type.charAt(0).toUpperCase() + deleteDialog.type.slice(1)}?
                </h3>
                <p className="text-xs text-[#57615C]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#57615C] leading-relaxed bg-[#F7F5EE] p-3 rounded-xl border border-[#E5E2D9]">
              Are you sure you want to permanently delete <strong className="text-[#163323]">"{deleteDialog.title}"</strong> from Debloom?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                className="px-4 py-2 text-xs font-medium text-[#57615C] hover:bg-[#F1F6F3] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: OPPORTUNITY EDITOR ================= */}
      {isOppModalOpen && editingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-2xl bg-[#FCFBF7] rounded-xl shadow-2xl border border-[#E5E2D9] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E5E2D9] bg-white flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-[#163323]">
                {editingOpp.id.startsWith('opp-') && !opportunities.find(o => o.id === editingOpp.id) ? 'Add Opportunity' : 'Edit Opportunity'}
              </h3>
              <button onClick={() => setIsOppModalOpen(false)} className="p-1 rounded text-[#7B8681] hover:text-[#1F2421]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOpp} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Opportunity Title *</label>
                  <input
                    required
                    type="text"
                    value={editingOpp.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingOpp({ 
                        ...editingOpp, 
                        title: newTitle,
                        slug: editingOpp.slug ? editingOpp.slug : autoSlug
                      });
                    }}
                    placeholder="E.g., Female Scholars Foundation 2026 University Scholarship"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1F2421]">Public URL Slug *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const s = editingOpp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setEditingOpp({ ...editingOpp, slug: s });
                      }}
                      className="text-[10px] text-[#27523D] hover:underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingOpp.slug || ''}
                    onChange={(e) => setEditingOpp({ ...editingOpp, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="female-scholars-foundation-2026-university-scholarship"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white font-mono text-[#1F2421]"
                  />
                  <span className="text-[10px] text-[#7B8681] mt-0.5 block">
                    URL: /opportunities/{editingOpp.slug || 'slug'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Organizer Institution *</label>
                  <input
                    required
                    type="text"
                    value={editingOpp.organizer}
                    onChange={(e) => setEditingOpp({ ...editingOpp, organizer: e.target.value })}
                    placeholder="E.g., Female Scholars Foundation"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Category</label>
                  <select
                    value={editingOpp.category}
                    onChange={(e) => setEditingOpp({ ...editingOpp, category: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  >
                    <option value="Scholarship">Scholarship</option>
                    <option value="Internship">Internship</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Competition">Competition</option>
                    <option value="Youth Program">Youth Program</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Region</label>
                  <input
                    type="text"
                    value={editingOpp.countryRegion}
                    onChange={(e) => setEditingOpp({ ...editingOpp, countryRegion: e.target.value })}
                    placeholder="E.g., Nigeria, Africa, Global"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Status</label>
                  <select
                    value={editingOpp.status}
                    onChange={(e) => setEditingOpp({ ...editingOpp, status: e.target.value as OpportunityStatus })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  >
                    <option value="Verified/Open">Verified/Open</option>
                    <option value="Closing Soon">Closing Soon</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Featured Image & Alt Text for Opportunity */}
              <div className="space-y-2 p-3 bg-[#F7F5EE] rounded-xl border border-[#E5E2D9]">
                <label className="block text-xs font-semibold text-[#1F2421] flex items-center justify-between">
                  <span>Featured Image (Banner)</span>
                  {editingOpp.featuredImage && (
                    <span className="text-[10px] text-[#27523D] font-medium">✓ Image Attached</span>
                  )}
                </label>

                {editingOpp.featuredImage ? (
                  <div className="space-y-2">
                    <div className="relative h-28 rounded-xl overflow-hidden border border-[#E5E2D9] bg-white group">
                      <img 
                        src={editingOpp.featuredImage} 
                        alt={editingOpp.imageAltText || editingOpp.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={() => setImageModal({ isOpen: true, target: 'opportunity' })}
                          className="px-2.5 py-1 bg-white text-[#163323] text-xs font-semibold rounded-lg shadow-sm hover:bg-[#F1F6F3] cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const imgUrl = editingOpp.featuredImage || '';
                            const full = imgUrl.startsWith('http') ? imgUrl : `${window.location.origin}${imgUrl}`;
                            navigator.clipboard.writeText(full);
                            onToast('Direct image link copied to clipboard! 🔗');
                          }}
                          className="px-2.5 py-1 bg-[#163323] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#27523D] cursor-pointer"
                        >
                          Copy Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingOpp({ ...editingOpp, featuredImage: '' })}
                          className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editingOpp.imageAltText || ''}
                      onChange={(e) => setEditingOpp({ ...editingOpp, imageAltText: e.target.value })}
                      placeholder="Image alt text (Descriptive text for accessibility & SEO)..."
                      className="w-full text-[11px] p-2 rounded-lg border border-[#E5E2D9] bg-white"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setImageModal({ isOpen: true, target: 'opportunity' })}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#8FA89B] bg-white hover:bg-[#F1F6F3] text-[#163323] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#27523D]" />
                    <span>Add Opportunity Banner Image</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingOpp.description}
                  onChange={(e) => setEditingOpp({ ...editingOpp, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Official Website Link *</label>
                  <input
                    required
                    type="url"
                    value={editingOpp.officialWebsite}
                    onChange={(e) => setEditingOpp({ ...editingOpp, officialWebsite: e.target.value, applicationLink: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Deadline</label>
                  <input
                    type="text"
                    value={editingOpp.deadline}
                    onChange={(e) => setEditingOpp({ ...editingOpp, deadline: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Eligibility Criteria</label>
                  <textarea
                    rows={2}
                    value={editingOpp.eligibility}
                    onChange={(e) => setEditingOpp({ ...editingOpp, eligibility: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Cost / Fees</label>
                  <input
                    type="text"
                    value={editingOpp.cost}
                    onChange={(e) => setEditingOpp({ ...editingOpp, cost: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E2D9]">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">SEO Title (Optional)</label>
                  <input
                    type="text"
                    value={editingOpp.seoTitle || ''}
                    onChange={(e) => setEditingOpp({ ...editingOpp, seoTitle: e.target.value })}
                    placeholder={editingOpp.title || 'Page title for search engines'}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">SEO Meta Description (Optional)</label>
                  <input
                    type="text"
                    value={editingOpp.metaDescription || ''}
                    onChange={(e) => setEditingOpp({ ...editingOpp, metaDescription: e.target.value })}
                    placeholder="Short description for search results"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOppModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#57615C] hover:bg-[#EFECE1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D]"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESOURCE EDITOR ================= */}
      {isResModalOpen && editingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-xl bg-[#FCFBF7] rounded-xl shadow-2xl border border-[#E5E2D9] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E5E2D9] bg-white flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-[#163323]">
                {editingRes.id.startsWith('res-') && !resources.find(r => r.id === editingRes.id) ? 'Add Resource' : 'Edit Resource'}
              </h3>
              <button onClick={() => setIsResModalOpen(false)} className="p-1 rounded text-[#7B8681] hover:text-[#1F2421]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRes} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Resource Name *</label>
                <input
                  required
                  type="text"
                  value={editingRes.name}
                  onChange={(e) => setEditingRes({ ...editingRes, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Category</label>
                  <select
                    value={editingRes.category}
                    onChange={(e) => setEditingRes({ ...editingRes, category: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  >
                    <option value="Open Courseware">Open Courseware</option>
                    <option value="Online Learning">Online Learning</option>
                    <option value="Skill Building">Skill Building</option>
                    <option value="Writing & Research">Writing & Research</option>
                    <option value="Student Tools">Student Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Cost Structure</label>
                  <input
                    type="text"
                    value={editingRes.cost}
                    onChange={(e) => setEditingRes({ ...editingRes, cost: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Official Website Link *</label>
                <input
                  required
                  type="url"
                  value={editingRes.officialWebsite}
                  onChange={(e) => setEditingRes({ ...editingRes, officialWebsite: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingRes.description}
                  onChange={(e) => setEditingRes({ ...editingRes, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Notice / Limitations (optional)</label>
                <input
                  type="text"
                  value={editingRes.limitations || ''}
                  onChange={(e) => setEditingRes({ ...editingRes, limitations: e.target.value })}
                  placeholder="E.g., Free self-paced audit, verified cert optional"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#57615C] hover:bg-[#EFECE1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D]"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHALLENGE EDITOR ================= */}
      {isChallengeModalOpen && editingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-2xl bg-[#FCFBF7] rounded-xl shadow-2xl border border-[#E5E2D9] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E5E2D9] bg-white flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-[#163323]">
                {editingChallenge.id.startsWith('chal-') && !challenges.find(c => c.id === editingChallenge.id) ? 'Create Bloom Challenge' : 'Edit Challenge'}
              </h3>
              <button onClick={() => setIsChallengeModalOpen(false)} className="p-1 rounded text-[#7B8681] hover:text-[#1F2421]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChallenge} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">Challenge Title *</label>
                <input
                  required
                  type="text"
                  value={editingChallenge.title}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">What you'll do *</label>
                <textarea
                  required
                  rows={2}
                  value={editingChallenge.whatYoullDo}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, whatYoullDo: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">What you need *</label>
                <input
                  required
                  type="text"
                  value={editingChallenge.whatYouNeed}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, whatYouNeed: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Steps (One per line) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingChallenge.steps.join('\n')}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, steps: e.target.value.split('\n').filter(s => s.trim()) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Expected Output</label>
                  <input
                    type="text"
                    value={editingChallenge.expectedOutput}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, expectedOutput: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">Difficulty</label>
                  <select
                    value={editingChallenge.difficulty}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, difficulty: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">What You Can Learn From It</label>
                <textarea
                  rows={2}
                  value={editingChallenge.whatYouCanLearn}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, whatYouCanLearn: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChallengeModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#57615C] hover:bg-[#EFECE1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D]"
                >
                  Save Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
