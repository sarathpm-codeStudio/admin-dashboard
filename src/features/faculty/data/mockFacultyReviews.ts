export type RatingDistributionRow = {
  stars: 5 | 4 | 3 | 2 | 1
  studentCount: number
}

export type FacultyReviewRecord = {
  id: string
  studentName: string
  initials: string
  avatarClassName: string
  courseLabel: string
  dateLabel: string
  rating: number
  body: string
  lowRatingAlert?: boolean
  replyRequired?: boolean
  /** Left accent bar; red overrides when lowRatingAlert is set */
  sideAccent?: 'navy'
}

export type FacultyReviewSummary = {
  averageRating: number
  totalReviews: number
  distribution: RatingDistributionRow[]
}

const johnSmithReviewSummary: FacultyReviewSummary = {
  averageRating: 4.6,
  totalReviews: 98,
  distribution: [
    { stars: 5, studentCount: 72 },
    { stars: 4, studentCount: 18 },
    { stars: 3, studentCount: 5 },
    { stars: 2, studentCount: 2 },
    { stars: 1, studentCount: 1 },
  ],
}

const johnSmithReviews: FacultyReviewRecord[] = [
  {
    id: 'r1',
    studentName: 'Emily Martinez',
    initials: 'EM',
    avatarClassName: 'bg-[#DFE0FF] text-[#000B60]',
    courseLabel: 'CS401: Advanced Data Structures',
    dateLabel: 'Nov 14, 2023',
    rating: 5,
    sideAccent: 'navy',
    body: "Professor Smith is incredibly knowledgeable and makes complex topics accessible. His office hours were extremely helpful during the final project. The course load is heavy but the learning outcomes are definitely worth the effort. Best CS elective I've taken so far.",
  },
  {
    id: 'r2',
    studentName: 'James Wilson',
    initials: 'JW',
    avatarClassName: 'bg-slate-200 text-slate-600',
    courseLabel: 'CS101: Introduction to Java',
    dateLabel: 'Oct 28, 2023',
    rating: 5,
    body: 'Solid teaching style. Sometimes moves a bit fast through the fundamental logic, but is always willing to repeat concepts if asked. The homework assignments are well-structured and directly related to the lecture material.',
  },
  {
    id: 'r3',
    studentName: 'Sarah Kim',
    initials: 'SK',
    avatarClassName: 'bg-red-100 text-red-700',
    courseLabel: 'CS401: Advanced Data Structures',
    dateLabel: 'Oct 12, 2023',
    rating: 3,
    body: 'The exam difficulty was significantly higher than the practice materials provided. I felt unprepared despite attending all lectures. Feedback on the midterm took three weeks to return, which made it hard to adjust for the final.',
    lowRatingAlert: true,
    replyRequired: true,
  },
  {
    id: 'r4',
    studentName: 'Alex Turner',
    initials: 'AT',
    avatarClassName: 'bg-blue-100 text-blue-700',
    courseLabel: 'CS401: Advanced Data Structures',
    dateLabel: 'Oct 5, 2024',
    rating: 5,
    body: 'One of the best instructors on the platform. Practical examples made theory easy to retain.',
  },
  {
    id: 'r5',
    studentName: 'Priya Nair',
    initials: 'PN',
    avatarClassName: 'bg-emerald-100 text-emerald-700',
    courseLabel: 'FIN302: Corporate Finance',
    dateLabel: 'Oct 2, 2024',
    rating: 4,
    body: 'Clear slides and well-organized weekly milestones. The capstone project guidance was very thorough.',
  },
  {
    id: 'r6',
    studentName: 'Michael Chen',
    initials: 'MC',
    avatarClassName: 'bg-amber-100 text-amber-800',
    courseLabel: 'CS401: Advanced Data Structures',
    dateLabel: 'Sep 28, 2024',
    rating: 5,
    body: 'Engaging lectures and fair grading rubrics. Highly recommend for anyone preparing for technical interviews.',
  },
]

export const FACULTY_REVIEWS_PAGE_SIZE = 3

export function getFacultyReviewSummary(_facultyId: string): FacultyReviewSummary {
  return johnSmithReviewSummary
}

export function getFacultyReviews(_facultyId: string): FacultyReviewRecord[] {
  return johnSmithReviews
}
