import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: 'Mathematics Academy'
    },
    hero: {
      badge: {
        type: String,
        default: 'Mathematics Academy'
      },
      heading: {
        type: String,
        default: 'Structured Mathematics Education for Every Learner'
      },
      subheading: {
        type: String,
        default: 'Concept-driven courses, structured curriculum, and guided problem-solving designed for students at every level.'
      },
      primaryCtaText: {
        type: String,
        default: 'Explore Courses'
      },
      primaryCtaLink: {
        type: String,
        default: '/courses'
      },
      secondaryCtaText: {
        type: String,
        default: 'About the Academy'
      },
      secondaryCtaLink: {
        type: String,
        default: '/about'
      },
      heroImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
      }
    },
    about: {
      heading: {
        type: String,
        default: 'About Mathematics Academy'
      },
      description: {
        type: String,
        default: 'Mathematics Academy was founded with the mission to deliver structured, high-quality mathematics education. We focus on conceptual understanding, logical reasoning, and disciplined problem-solving.'
      },
      mission: {
        type: String,
        default: 'To provide accessible, high-standard mathematics courses taught with clarity, depth, and real academic relevance.'
      },
      vision: {
        type: String,
        default: 'Building an educational environment where students develop deep mathematical understanding and confidence.'
      },
      features: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          icon: { type: String, default: 'CheckCircle2' }
        }
      ],
      aboutImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80'
      }
    },
    contact: {
      email: {
        type: String,
        default: 'amanmishra7211@gmail.com'
      },
      phone: {
        type: String,
        default: '+91 85957 42861'
      },
      address: {
        type: String,
        default: ''
      },
      workingHours: {
        type: String,
        default: ''
      },
      supportNotice: {
        type: String,
        default: 'Our academic support team usually responds within 24 business hours.'
      }
    },
    footer: {
      aboutText: {
        type: String,
        default: 'Mathematics Academy is committed to delivering structured, concept-driven mathematics education for students at every level.'
      },
      copyrightText: {
        type: String,
        default: '© 2026 Mathematics Academy. All rights reserved.'
      },
      socialLinks: [
        {
          platform: { type: String },
          url: { type: String }
        }
      ]
    },
    sectionsVisibility: {
      showHero: { type: Boolean, default: true },
      showFeaturedCourses: { type: Boolean, default: true },
      showAbout: { type: Boolean, default: true },
      showCategories: { type: Boolean, default: true },
      showFaq: { type: Boolean, default: true },
      showContact: { type: Boolean, default: true },
      showAnnouncements: { type: Boolean, default: true }
    },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        order: { type: Number, default: 0 }
      }
    ],
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        badge: { type: String, default: 'Notice' },
        link: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    categories: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
