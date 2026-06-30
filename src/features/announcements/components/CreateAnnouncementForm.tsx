import type { FormikProps } from 'formik'
import { Card, cardPaddingClass } from '@/components/ui/Card'
import { DateRangeField } from '@/components/ui/DateRangeField'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useGetCourseSelectOptions } from '@/features/courses/hooks/useCourseManagement'

export type CreateAnnouncementFormValues = {
  name: string
  audience: string
  courseId: string
  startDate: string
  endDate: string
  message: string
}

type CreateAnnouncementFormProps = {
  formik: FormikProps<CreateAnnouncementFormValues>
}

export function CreateAnnouncementForm({ formik }: CreateAnnouncementFormProps) {
  const { values, errors, touched, setFieldValue, setFieldTouched, handleBlur } = formik

  const showCourseSelect = values.audience === 'course'
  const { data: courses = [], isLoading: isCoursesLoading } = useGetCourseSelectOptions(showCourseSelect)

  const errorFor = (field: keyof CreateAnnouncementFormValues) =>
    touched[field] && errors[field] ? errors[field] : undefined

  const todayDateString = new Date().toISOString().slice(0, 10)

  const handleAudienceChange = (audience: string) => {
    setFieldValue('audience', audience)
    if (audience !== 'course') {
      setFieldValue('courseId', '')
    }
  }

  return (
    <Card className={cardPaddingClass}>
      <div className="space-y-6">
        <FormField label="Announcement Name" htmlFor="announcement-name" error={errorFor('name')}>
          <Input
            id="announcement-name"
            name="name"
            placeholder="e.g., Mid-Term Symposium Update 2024"
            value={values.name}
            onChange={(e) => setFieldValue('name', e.target.value)}
            onBlur={handleBlur}
          />
        </FormField>

        <FormField
          label="Audience Selection"
          htmlFor="announcement-audience"
          error={errorFor('audience')}
        >
          <Select
            id="announcement-audience"
            name="audience"
            value={values.audience}
            onChange={(e) => handleAudienceChange(e.target.value)}
            onBlur={handleBlur}
          >
            <option value="">Select audience...</option>
            <option value="all">All Users</option>
            <option value="students">Students</option>
            <option value="faculty">Faculty</option>
            <option value="course">Specific Course</option>
          </Select>
        </FormField>

        {showCourseSelect && (
          <FormField
            label="Select Course"
            htmlFor="announcement-course"
            error={errorFor('courseId')}
          >
            <Select
              id="announcement-course"
              name="courseId"
              value={values.courseId}
              onChange={(e) => setFieldValue('courseId', e.target.value)}
              onBlur={handleBlur}
              disabled={isCoursesLoading}
            >
              <option value="">
                {isCoursesLoading ? 'Loading courses...' : 'Choose a course...'}
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Time Period" error={errorFor('startDate') ?? errorFor('endDate')}>
          <DateRangeField
            from={values.startDate}
            to={values.endDate}
            min={todayDateString}
            onChange={(startDate, endDate) => {
              setFieldValue('startDate', startDate)
              setFieldValue('endDate', endDate)
              setFieldTouched('startDate', true, false)
              setFieldTouched('endDate', true, false)
            }}
          />
        </FormField>

        <FormField label="Announcement Message" htmlFor="announcement-message" error={errorFor('message')}>
          <Textarea
            id="announcement-message"
            name="message"
            value={values.message}
            onChange={(e) => setFieldValue('message', e.target.value)}
            onBlur={handleBlur}
            placeholder="Write your announcement message..."
            aria-label="Announcement message"
          />
        </FormField>
      </div>
    </Card>
  )
}
