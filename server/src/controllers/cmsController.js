import { SiteSettings } from '../models/SiteSettings.js';
import { ContactMessage } from '../models/ContactMessage.js';

// Helper to get or create initial settings
export const getOrCreateSettings = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({
      brandName: 'Mathematics Academy',
      hero: {
        badge: 'Mathematics Academy',
        heading: 'Structured Mathematics Education for Every Learner',
        subheading: 'Concept-driven courses, structured curriculum, and guided problem-solving designed for students at every level.',
        primaryCtaText: 'Explore Courses',
        primaryCtaLink: '/courses',
        secondaryCtaText: 'About the Academy',
        secondaryCtaLink: '/about',
        heroImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
      },
      about: {
        heading: 'About Mathematics Academy',
        description: 'Mathematics Academy was founded with the mission to deliver structured, high-quality mathematics education. We focus on conceptual understanding, logical reasoning, and disciplined problem-solving.',
        mission: 'To provide accessible, high-standard mathematics courses taught with clarity, depth, and real academic relevance.',
        vision: 'Building an educational environment where students develop deep mathematical understanding and confidence.',
        features: [
          {
            title: 'Concept-First Approach',
            description: 'Every topic begins with building fundamental intuition before moving to formulas, theorems, and problem sets.',
            icon: 'CheckCircle2'
          },
          {
            title: 'Structured Problem Solving',
            description: 'Coursework centres around methodical problem-solving techniques rather than rote memorisation.',
            icon: 'Target'
          },
          {
            title: 'Progressive Curriculum',
            description: 'Modular curriculum designed so students can methodically advance from foundations to advanced topics.',
            icon: 'Layers'
          }
        ],
        aboutImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80'
      },
      contact: {
        email: 'amanmishra7211@gmail.com',
        phone: '+91 85957 42861',
        address: '',
        workingHours: '',
        supportNotice: 'Our academic support team usually responds within 24 business hours.'
      },
      footer: {
        aboutText: 'Mathematics Academy is committed to delivering structured, concept-driven mathematics education for students at every level.',
        copyrightText: '© 2026 Mathematics Academy. All rights reserved.',
        socialLinks: [
          { platform: 'YouTube', url: 'https://youtube.com' },
          { platform: 'Instagram', url: 'https://instagram.com' },
          { platform: 'LinkedIn', url: 'https://linkedin.com' },
          { platform: 'Twitter / X', url: 'https://twitter.com' }
        ]
      },
      sectionsVisibility: {
        showHero: true,
        showFeaturedCourses: true,
        showAbout: true,
        showCategories: true,
        showFaq: true,
        showContact: true,
        showAnnouncements: true
      },
      faqs: [
        {
          question: 'What is the format of the courses?',
          answer: 'Courses consist of structured video lessons, downloadable PDF notes, practice problems, and assignments reviewed by instructors.',
          order: 1
        },
        {
          question: 'Are there any prerequisites required before enrolling?',
          answer: 'Prerequisites vary per course. Foundation-level courses start from basics, while advanced courses list explicit prerequisites on their detail pages.',
          order: 2
        },
        {
          question: 'Can I access the course material on mobile devices?',
          answer: 'Yes, the learning platform is fully responsive and compatible with desktop, tablet, and smartphone browsers.',
          order: 3
        }
      ],
      announcements: [],
      categories: [
        'Algebra',
        'Calculus',
        'Geometry',
        'Trigonometry',
        'Statistics'
      ]
    });
  }
  return settings;
};

// Public: Get site settings
export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update site settings
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await getOrCreateSettings();

    const {
      brandName,
      hero,
      about,
      contact,
      footer,
      sectionsVisibility,
      categories
    } = req.body;

    if (brandName !== undefined) settings.brandName = brandName;
    if (hero) settings.hero = { ...settings.hero.toObject(), ...hero };
    if (about) settings.about = { ...settings.about.toObject(), ...about };
    if (contact) settings.contact = { ...settings.contact.toObject(), ...contact };
    if (footer) settings.footer = { ...settings.footer.toObject(), ...footer };
    if (sectionsVisibility) {
      settings.sectionsVisibility = { ...settings.sectionsVisibility.toObject(), ...sectionsVisibility };
    }
    if (categories) settings.categories = categories;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Website CMS settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Admin: FAQs CRUD
export const addFaq = async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required.' });
    }

    const settings = await getOrCreateSettings();
    settings.faqs.push({
      question,
      answer,
      order: settings.faqs.length + 1
    });

    await settings.save();

    res.status(201).json({
      success: true,
      message: 'FAQ added successfully',
      faqs: settings.faqs
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const { faqId } = req.params;
    const { question, answer, order } = req.body;

    const settings = await getOrCreateSettings();
    const faq = settings.faqs.id(faqId);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found.' });
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (order !== undefined) faq.order = order;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      faqs: settings.faqs
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    const { faqId } = req.params;
    const settings = await getOrCreateSettings();

    settings.faqs = settings.faqs.filter((f) => f._id.toString() !== faqId);
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'FAQ removed successfully',
      faqs: settings.faqs
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Announcements CRUD
export const addAnnouncement = async (req, res, next) => {
  try {
    const { title, content, badge, link } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const settings = await getOrCreateSettings();
    settings.announcements.unshift({
      title,
      content,
      badge: badge || 'Notice',
      link: link || '',
      isActive: true,
      createdAt: new Date()
    });

    await settings.save();

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      announcements: settings.announcements
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const settings = await getOrCreateSettings();

    settings.announcements = settings.announcements.filter((a) => a._id.toString() !== announcementId);
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
      announcements: settings.announcements
    });
  } catch (error) {
    next(error);
  }
};

// Public: Submit contact inquiry
export const submitContactMessage = async (req, res, next) => {
  try {
    const { email, phone, subject, message } = req.body;
    const name = req.body.name || req.body.fullName;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, subject, and message.'
      });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received. Our team will get back to you shortly.',
      inquiryId: newMessage._id
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all contact messages
export const getAllContactMessages = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const messages = await ContactMessage.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update contact message status
export const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { status, adminNotes } = req.body;

    const message = await ContactMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (status) message.status = status;
    if (adminNotes !== undefined) message.adminNotes = adminNotes;

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message status updated',
      messageData: message
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete contact message
export const deleteContactMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    await ContactMessage.findByIdAndDelete(messageId);
    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    next(error);
  }
};
