export const routesV1 = {
  version: 'v1',
  school: {
    base: '/schools',
    findExamsBySchool: '/:schoolId/exams',
  },
  exam: {
    base: '/exams',
  },
  course: {
    base: '/courses',
    findModulesByCourseId: '/:courseId/modules',
  },
  module: {
    base: '/modules',
  },
  lessonText: {
    base: '/lessons/text',
  },
  lessonVideo: {
    base: '/lessons/video',
  },
  quiz: {
    base: '/lessons/quiz',
  },
  question: {
    base: '/questions',
    create: '/questions',
  },
  choice: {
    base: '/choices',
    create: '/choices',
  },
};
