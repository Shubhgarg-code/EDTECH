import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Progress } from '../models/Progress.js';
import { getOrCreateSettings } from '../controllers/cmsController.js';

export const seedDatabase = async () => {
  try {
    // 1. Ensure SiteSettings document is initialized
    await getOrCreateSettings();

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already populated. Skipping user/course seeding.');
      return;
    }

    console.log('🌱 Initializing Mathematics Academy accounts & foundation...');

    // 2. Create Administrator Account
    const adminUser = await User.create({
      name: 'Academy Administrator',
      email: 'admin@mathacademy.in',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210',
      bio: 'Administrator at Mathematics Academy.'
    });

    // 3. Create Sample Student Account
    const studentUser = await User.create({
      name: 'Rohan Sharma',
      email: 'student@mathacademy.in',
      password: 'Student@123',
      role: 'student',
      phone: '+91 91234 56789',
      bio: 'Enrolled student studying mathematics.'
    });

    // 4. Create Initial Starter Course (mathematics syllabus)
    const starterCourse = await Course.create({
      title: 'Foundation Mathematics — Class 11 & 12',
      slug: 'foundation-mathematics-class-11-12',
      tagline: 'A comprehensive mathematics programme covering core topics from Class 11 and 12 syllabi.',
      description: 'Build a strong mathematical foundation with structured lessons covering sets, relations, trigonometry, calculus fundamentals, coordinate geometry, and probability. Designed for students preparing for board examinations and competitive entrance tests.',
      category: 'Mathematics',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      promoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      price: 4999,
      discountPrice: 3499,
      duration: '12 Weeks',
      batchName: 'Batch 2026',
      startDate: 'Self-paced with weekly milestones',
      schedule: 'Flexible learning schedule',
      features: [
        'Structured modules covering Algebra, Trigonometry, Calculus, and Coordinate Geometry',
        'Downloadable PDF notes and formula sheets for every chapter',
        'End-of-chapter practice problems and assignments',
        'Certificate of completion upon finishing all lessons'
      ],
      prerequisites: [
        'Basic familiarity with Class 10 level mathematics',
        'Willingness to practise problems regularly and complete assignments'
      ],
      instructor: {
        name: 'Aman Mishra',
        title: 'IIT Delhi Alumnus | Former Oracle | 5+ Years Experience',
        avatar: '',
        bio: 'IIT Delhi alumnus and former Oracle professional with 5 years of mathematics teaching experience focused on building conceptual intuition and problem-solving rigor.'
      },
      isPublished: true,
      totalEnrolled: 1,
      modules: [
        {
          title: 'Module 1: Sets, Relations & Functions',
          description: 'Introduction to set theory, types of relations, functions, domain, co-domain, and range.',
          order: 1,
          lectures: [
            {
              title: '1. Introduction to Sets & Set Operations',
              description: 'Understanding sets, subsets, union, intersection, complement, and Venn diagrams.',
              videoSource: 'external',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              duration: '18:30',
              durationSeconds: 1110,
              isFreePreview: true,
              notesSource: 'text',
              notesContent: `# Module 1: Sets & Set Operations

### Key Concepts
1. **Set**: A well-defined collection of distinct objects.
2. **Subset**: A ⊆ B if every element of A is also an element of B.
3. **Operations**: Union (A ∪ B), Intersection (A ∩ B), Complement (A'), Difference (A − B).
4. **Venn Diagrams**: Visual representations of set relationships.

### Important Formulae
- n(A ∪ B) = n(A) + n(B) − n(A ∩ B)
- De Morgan's Laws: (A ∪ B)' = A' ∩ B' and (A ∩ B)' = A' ∪ B'`,
              order: 1,
              resources: [
                { title: 'NCERT Sets Chapter PDF', url: 'https://ncert.nic.in', type: 'link', source: 'external' }
              ]
            },
            {
              title: '2. Relations & Types of Functions',
              description: 'Cartesian products, types of relations (reflexive, symmetric, transitive), one-one, onto, and bijective functions.',
              videoSource: 'external',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              duration: '24:15',
              durationSeconds: 1455,
              isFreePreview: true,
              notesSource: 'text',
              notesContent: `# Relations & Functions

- **Relation**: A subset of the Cartesian product A × B.
- **Types of Relations**: Reflexive, Symmetric, Transitive, Equivalence.
- **Function**: A special relation where every element in the domain maps to exactly one element in the co-domain.
- **Types of Functions**:
  - One-one (Injective): f(a₁) = f(a₂) ⟹ a₁ = a₂
  - Onto (Surjective): Range = Co-domain
  - Bijective: Both one-one and onto`,
              order: 2,
              resources: []
            }
          ]
        },
        {
          title: 'Module 2: Trigonometric Functions',
          description: 'Angles, trigonometric ratios, identities, graphs, and equations.',
          order: 2,
          lectures: [
            {
              title: '3. Trigonometric Ratios & Identities',
              description: 'Fundamental trigonometric ratios, Pythagorean identities, compound angle formulas, and their applications.',
              videoSource: 'external',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              duration: '28:10',
              durationSeconds: 1690,
              isFreePreview: false,
              notesSource: 'text',
              notesContent: `# Trigonometric Identities

### Fundamental Identities
- sin²θ + cos²θ = 1
- 1 + tan²θ = sec²θ
- 1 + cot²θ = csc²θ

### Compound Angle Formulas
- sin(A + B) = sinA cosB + cosA sinB
- cos(A + B) = cosA cosB − sinA sinB`,
              order: 1
            }
          ]
        }
      ],
      assignments: [
        {
          title: 'Assignment 1: Sets, Relations & Functions Problem Set',
          description: 'Solve problems on set operations, Venn diagrams, types of relations, and function classification. Show complete working for each problem.',
          moduleTitle: 'Module 1',
          dueDate: 'Flexible',
          maxMarks: 100
        }
      ]
    });

    // 5. Enroll Student in starter course
    studentUser.enrolledCourses.push({
      course: starterCourse._id,
      enrolledAt: new Date(),
      orderId: 'initial_enrollment'
    });
    await studentUser.save();

    // 6. Initialize initial progress
    await Progress.create({
      user: studentUser._id,
      course: starterCourse._id,
      completedLectures: [starterCourse.modules[0].lectures[0]._id],
      currentLectureId: starterCourse.modules[0].lectures[0]._id,
      percentage: 33,
      lastWatchTimeSeconds: 120
    });

    console.log('✅ Foundation initialized successfully.');
    console.log('🔑 Credentials:');
    console.log('   Admin:   admin@mathacademy.in / Admin@123');
    console.log('   Student: student@mathacademy.in / Student@123');
  } catch (error) {
    console.error('Error seeding foundation:', error);
  }
};
