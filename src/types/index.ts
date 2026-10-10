export type ArticleStatus = 'Draft' | 'Review' | 'Published' | 'Archived';

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  authorRole?: string;
  category: 'Skills' | 'University Prep' | 'Career Exploration' | 'Student Development' | 'General';
  tags: string[];
  featuredImage?: string;
  imageAltText?: string;
  createdDate?: string;
  publishDate: string;
  updatedDate?: string;
  readingTimeMinutes: number;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  status: ArticleStatus;
  bloomChallengeId?: string;
  views?: number;
}

export type OpportunityStatus = 
  | 'Draft' 
  | 'Pending Verification' 
  | 'Verified/Open' 
  | 'Closing Soon' 
  | 'Closed' 
  | 'Archived';

export interface Opportunity {
  id: string;
  title: string;
  slug?: string;
  organizer: string;
  description: string;
  category: 'Scholarship' | 'Fellowship' | 'Internship' | 'Competition' | 'Youth Program' | 'Bootcamp';
  eligibility: string;
  ageRequirement?: string;
  countryRegion: string;
  deadline: string;
  cost: string; // e.g. "Free", "Fully Funded", "Tuition Free"
  benefits: string;
  requirements: string;
  officialWebsite: string;
  applicationLink: string;
  lastVerifiedDate: string;
  status: OpportunityStatus;
  clicks?: number;
  featuredImage?: string;
  imageAltText?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface Resource {
  id: string;
  name: string;
  slug?: string;
  description: string;
  category: 'Online Learning' | 'Student Tools' | 'Skill Building' | 'Writing & Research' | 'Financial Literacy' | 'Open Courseware';
  intendedAudience: string;
  cost: 'Free' | 'Freemium' | 'Paid';
  countryAvailability: string;
  requirements?: string;
  officialWebsite: string;
  limitations?: string;
  lastVerifiedDate: string;
  notes?: string;
  status: 'Draft' | 'Published' | 'Archived';
  clicks?: number;
}

export interface BloomChallenge {
  id: string;
  title: string;
  slug?: string;
  whatYoullDo: string;
  whatYouNeed: string;
  steps: string[];
  expectedOutput: string;
  howToSubmit: string;
  optionalExtension?: string;
  whatYouCanLearn: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Active' | 'Draft' | 'Archived';
  relatedArticleSlug?: string;
  submissionsCount?: number;
  prompt?: string;
  estimatedTimeMinutes?: number;
}

export type SubmissionType = 
  | 'Opportunity' 
  | 'Resource' 
  | 'Correction' 
  | 'Bloom Challenge entry' 
  | 'Article idea' 
  | 'Question' 
  | 'Success story';

export interface UserSubmission {
  id: string;
  type: SubmissionType;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Reviewed';
  submitterName?: string;
  submitterContact?: string;
  payload: Record<string, any>;
  adminNotes?: string;
}

export interface ContentReport {
  id: string;
  targetType: 'opportunity' | 'resource' | 'article';
  targetId: string;
  targetTitle: string;
  whatNeedsCorrection: string;
  whatIsCurrentlyWrong: string;
  suggestedCorrection: string;
  supportingSource?: string;
  submitterContact?: string;
  reportedAt: string;
  status: 'Open' | 'Reviewed' | 'Resolved' | 'Rejected';
  adminNotes?: string;
}

export interface Writer {
  id: string;
  name: string;
  shortBio: string;
  role: 'Admin' | 'Writer' | 'Contributor';
  email: string;
  publishedArticlesCount: number;
  status: 'Active' | 'Pending Review';
  joinedDate: string;
}

export interface BloomOfTheWeek {
  awarded: boolean;
  studentName?: string;
  challengeTitle?: string;
  outputDescription?: string;
  submissionLink?: string;
  dateAwarded?: string;
  reflection?: string;
}

export interface AnalyticsEvent {
  id: string;
  type: 'article_view' | 'opportunity_view' | 'opportunity_click' | 'resource_click' | 'challenge_submit' | 'telegram_click' | 'search_query';
  detail: string;
  timestamp: string;
}

export interface SiteSettings {
  telegramUrl: string;
  telegramChannelName: string;
  contactEmail: string;
  allowPublicSubmissions: boolean;
  announcementNotice?: string;
}

export type UserRole = 'public' | 'writer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'writer';
  token?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source?: string;
  status?: 'active' | 'unsubscribed';
  updatedAt?: string;
}
