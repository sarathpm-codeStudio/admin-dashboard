import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CreateAnnouncementForm, type CreateAnnouncementFormValues } from '@/features/announcements/components/CreateAnnouncementForm'
import { CreateAnnouncementHeader } from '@/features/announcements/components/CreateAnnouncementHeader'
import { CreateAnnouncementSidebar } from '@/features/announcements/components/CreateAnnouncementSidebar'
import {
  announcementToFormValues,
  getAnnouncementById,
} from '@/features/announcements/utils/announcementForm'
import { useToast } from '@/hooks/useToast'

const defaultValues: CreateAnnouncementFormValues = {
  name: '',
  audience: '',
  courseId: '',
  startDate: '',
  endDate: '',
  message: '',
}

type CreateAnnouncementViewProps = {
  mode?: 'create' | 'edit'
}

export function CreateAnnouncementView({ mode = 'create' }: CreateAnnouncementViewProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const { announcementId } = useParams<{ announcementId?: string }>()
  const isEdit = mode === 'edit'
  const announcement = isEdit && announcementId ? getAnnouncementById(announcementId) : undefined

  const [values, setValues] = useState<CreateAnnouncementFormValues>(() =>
    announcement ? announcementToFormValues(announcement) : defaultValues,
  )
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    if (!announcementId || !announcement) {
      toast.error('Announcement not found.', { title: 'Not found' })
      navigate('/announcements', { replace: true })
    }
  }, [announcement, announcementId, isEdit, navigate, toast])

  const handleBannerChange = (_file: File | null, previewUrl: string | null) => {
    setBannerPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return previewUrl
    })
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 400))
      toast.success(
        isEdit ? 'Announcement updated and saved as draft.' : 'Announcement saved as draft.',
        { title: 'Draft saved' },
      )
      navigate('/announcements')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!values.name.trim()) {
      toast.error('Please enter an announcement name.', { title: 'Missing details' })
      return
    }
    if (!values.audience) {
      toast.error('Please select an audience.', { title: 'Missing details' })
      return
    }
    if (values.audience === 'course' && !values.courseId) {
      toast.error('Please select a course.', { title: 'Missing details' })
      return
    }

    setIsPublishing(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 400))
      toast.success(
        isEdit ? 'Announcement updated successfully.' : 'Announcement published successfully.',
        { title: isEdit ? 'Updated' : 'Published' },
      )
      navigate('/announcements')
    } finally {
      setIsPublishing(false)
    }
  }

  if (isEdit && (!announcementId || !announcement)) {
    return null
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto pb-8">
      <CreateAnnouncementHeader
        mode={mode}
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
        disabled={isPublishing}
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <CreateAnnouncementForm
            values={values}
            onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          />
        </div>
        <CreateAnnouncementSidebar
          bannerPreview={bannerPreview}
          onBannerChange={handleBannerChange}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      </div>
    </div>
  )
}

