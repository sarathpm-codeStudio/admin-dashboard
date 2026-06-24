import * as Yup from 'yup'
import type { CreateAnnouncementFormValues } from '@/features/announcements/components/CreateAnnouncementForm'

export const announcementValidationSchema: Yup.ObjectSchema<CreateAnnouncementFormValues> =
  Yup.object({
    name: Yup.string().trim().required('Announcement name is required.'),
    audience: Yup.string().required('Please select an audience.'),
    courseId: Yup.string()
      .default('')
      .when('audience', {
        is: 'course',
        then: (schema) => schema.required('Please select a course.'),
      }),
    startDate: Yup.string().required('Start date is required.'),
    endDate: Yup.string()
      .required('End date is required.')
      .test(
        'after-start',
        'End date must be after the start date.',
        (value, ctx) => !ctx.parent.startDate || !value || value >= ctx.parent.startDate,
      ),
    message: Yup.string().trim().required('Announcement message is required.'),
  })
