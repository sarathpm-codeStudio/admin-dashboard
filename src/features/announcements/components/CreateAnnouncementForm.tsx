import { Card, cardPaddingClass } from '@/components/ui/Card'
import { DateRangeField } from '@/components/ui/DateRangeField'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { Select } from '@/components/ui/Select'
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
  values: CreateAnnouncementFormValues
  onChange: (patch: Partial<CreateAnnouncementFormValues>) => void
}

export function CreateAnnouncementForm({ values, onChange }: CreateAnnouncementFormProps) {
  const showCourseSelect = values.audience === 'course'
  const { data: courses = [], isLoading: isCoursesLoading } = useGetCourseSelectOptions(showCourseSelect)

  const handleAudienceChange = (audience: string) => {
    onChange({
      audience,
      courseId: audience === 'course' ? values.courseId : '',
    })
  }

  return (
    <Card className={cardPaddingClass}>
      <div className="space-y-6">
        <FormField label="Announcement Name" htmlFor="announcement-name">
          <Input
            id="announcement-name"
            placeholder="e.g., Mid-Term Symposium Update 2024"
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </FormField>

        <FormField label="Audience Selection" htmlFor="announcement-audience">
          <Select
            id="announcement-audience"
            value={values.audience}
            onChange={(e) => handleAudienceChange(e.target.value)}
          >
            <option value="">Select audience...</option>
            <option value="all">All Users</option>
            <option value="students">Students</option>
            <option value="faculty">Faculty</option>
            <option value="course">Specific Course</option>
          </Select>
        </FormField>

        {showCourseSelect && (
          <FormField label="Select Course" htmlFor="announcement-course">
            <Select
              id="announcement-course"
              value={values.courseId}
              onChange={(e) => onChange({ courseId: e.target.value })}
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

        <FormField label="Time Period">
          <DateRangeField
            from={values.startDate}
            to={values.endDate}
            onChange={(startDate, endDate) => onChange({ startDate, endDate })}
          />
        </FormField>

        <FormField label="Announcement Message">
          <RichTextEditor
            value={values.message}
            onChange={(message) => onChange({ message })}
            placeholder="Write your announcement message..."
            aria-label="Announcement message"
          />
        </FormField>
      </div>
    </Card>
  )
}
