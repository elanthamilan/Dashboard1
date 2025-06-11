import { faker } from '@faker-js/faker';
import { LmsActivity, LmsActivityType } from '../../../types/academics'; // Adjust path if necessary
import { StudentSummary } from '../../../types/hierarchy';
// import { CourseEnrollment } from '../../../types/hierarchy'; // If courses are needed for context

const activityTypes: LmsActivityType[] = [
  'Login', 'ResourceView', 'ResourceDownload', 'ForumPost', 'ForumView',
  'QuizAttempt', 'AssignmentSubmission', 'Login', 'ResourceView', 'ResourceDownload' // Skew a bit
];

export const generateMockLmsActivityData = (
  students: StudentSummary[],
  // courses: CourseEnrollment[], // If course context is needed
  activitiesPerStudentTarget: number = 20, // Avg activities per student in last 30-60 days
  daysToCover: number = 60 // Generate activity over the last 60 days
): LmsActivity[] => {
  const activities: LmsActivity[] = [];
  let activityIdCounter = 1;
  if (!students || students.length === 0) return activities;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysToCover);

  students.forEach(student => {
    const numActivities = faker.number.int({ min: Math.floor(activitiesPerStudentTarget * 0.5), max: Math.ceil(activitiesPerStudentTarget * 1.5) });
    for (let i = 0; i < numActivities; i++) {
      const activityType = faker.helpers.arrayElement(activityTypes);
      // const courseContext = courses.length > 0 ? faker.helpers.arrayElement(courses) : undefined;
      activities.push({
        activityId: `LMS-${String(activityIdCounter++).padStart(6, '0')}`,
        studentId: student.studentId,
        activityType: activityType,
        timestamp: faker.date.between({ from: startDate, to: endDate }).toISOString(),
        // courseId: courseContext?.courseId, // Example: If you have course data available for students
        resourceId: activityType === 'ResourceDownload' || activityType === 'ResourceView' ? `RES-${faker.string.alphanumeric(5)}` : undefined,
        forumId: activityType === 'ForumPost' || activityType === 'ForumView' ? `FORUM-${faker.string.alphanumeric(3)}` : undefined,
        postId: activityType === 'ForumPost' ? `POST-${faker.string.alphanumeric(7)}` : undefined,
        quizId: activityType === 'QuizAttempt' ? `QUIZ-${faker.string.alphanumeric(4)}` : undefined,
        assignmentId: activityType === 'AssignmentSubmission' ? `ASMT-${faker.string.alphanumeric(4)}` : undefined,
        durationMinutes: activityType === 'Login' || activityType === 'ResourceView' ? faker.number.int({min: 5, max: 120}) : undefined,
      });
    }
  });
  return activities;
};
