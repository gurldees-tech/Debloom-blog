import { 
  Article, 
  Opportunity, 
  Resource, 
  BloomChallenge, 
  BloomOfTheWeek, 
  SiteSettings, 
  Writer,
  UserSubmission,
  ContentReport
} from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  telegramUrl: 'https://t.me/DebloomHQ',
  telegramChannelName: '@DebloomHQ',
  contactEmail: 'hello@debloom.org',
  allowPublicSubmissions: true,
  announcementNotice: '',
};

export const INITIAL_BLOOM_OF_THE_WEEK: BloomOfTheWeek = {
  awarded: false,
};

export const INITIAL_WRITERS: Writer[] = [
  {
    id: 'writer-debbie',
    name: 'Debbie',
    shortBio: 'Founder of Debloom.',
    role: 'Admin',
    email: 'debbietalestime@gmail.com',
    publishedArticlesCount: 0,
    status: 'Active',
    joinedDate: '2026-01-10',
  }
];

// Content is maintained directly by the admin through the Debloom CMS.
// No fabricated, demo, or placeholder articles are pre-seeded.
export const INITIAL_ARTICLES: Article[] = [];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [];

export const INITIAL_RESOURCES: Resource[] = [];

export const INITIAL_CHALLENGES: BloomChallenge[] = [];

export const INITIAL_SUBMISSIONS: UserSubmission[] = [];

export const INITIAL_REPORTS: ContentReport[] = [];
