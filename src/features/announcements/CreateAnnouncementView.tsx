import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { useNavigate, useParams } from 'react-router-dom'
import { announcementApi } from '@/api/announcement/announcement.api'
import { CreateAnnouncementForm, type CreateAnnouncementFormValues } from '@/features/announcements/components/CreateAnnouncementForm'
import { CreateAnnouncementHeader } from '@/features/announcements/components/CreateAnnouncementHeader'
import { CreateAnnouncementSidebar } from '@/features/announcements/components/CreateAnnouncementSidebar'
import {
  useCreateAnnouncement,
  useGetAnnouncement,
  useUpdateAnnouncement,
} from '@/features/announcements/hooks/useAnnouncement'
import { mapAnnouncementRowToFormValues } from '@/features/announcements/utils/announcementForm'
import { announcementValidationSchema } from '@/features/announcements/utils/announcementSchema'
import { mapFormValuesToCreatePayload } from '@/features/announcements/utils/mapFormValuesToCreatePayload'
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

  const {
    data: announcement,
    isLoading: isLoadingAnnouncement,
    isError: isAnnouncementError,
  } = useGetAnnouncement(isEdit ? announcementId : undefined)

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const createAnnouncement = useCreateAnnouncement()
  const updateAnnouncement = useUpdateAnnouncement()

  // Show the existing banner once the announcement loads (until a new file is picked).
  useEffect(() => {
    if (announcement?.image_url && !bannerFile) {
      setBannerPreview(announcement.image_url)
    }
  }, [announcement?.image_url, bannerFile])

  useEffect(() => {
    if (isEdit && !announcementId) {
      toast.error('Announcement not found.', { title: 'Not found' })
      navigate('/announcements', { replace: true })
    }
  }, [announcementId, isEdit, navigate, toast])

  useEffect(() => {
    if (isAnnouncementError) {
      toast.error('Could not load this announcement.', { title: 'Load failed' })
      navigate('/announcements', { replace: true })
    }
  }, [isAnnouncementError, navigate, toast])

  const submitAnnouncement = async (
    formValues: CreateAnnouncementFormValues,
    isDraft: boolean,
  ) => {
    let imageUrl: string | null = announcement?.image_url ?? null

    if (bannerFile) {
      imageUrl = await announcementApi.uploadAnnouncementBanner(bannerFile)
    }

    const payload = mapFormValuesToCreatePayload(formValues, { isDraft, imageUrl })

    if (isEdit && announcementId) {
      await updateAnnouncement.mutateAsync({ id: announcementId, payload })
    } else {
      await createAnnouncement.mutateAsync(payload)
    }
  }

  const formik = useFormik<CreateAnnouncementFormValues>({
    initialValues: announcement ? mapAnnouncementRowToFormValues(announcement) : defaultValues,
    enableReinitialize: true,
    validationSchema: announcementValidationSchema,
    onSubmit: async (formValues, helpers) => {
      try {
        await submitAnnouncement(formValues, false)
        toast.success(
          isEdit ? 'Announcement updated successfully.' : 'Announcement published successfully.',
          { title: isEdit ? 'Updated' : 'Published' },
        )
        navigate('/announcements')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Could not publish announcement. Please try again.'
        toast.error(message, { title: 'Publish failed' })
      } finally {
        helpers.setSubmitting(false)
      }
    },
  })

  const handleBannerChange = (file: File | null, previewUrl: string | null) => {
    setBannerFile(file)
    setBannerPreview((prev) => {
      if (prev && prev !== announcement?.image_url) URL.revokeObjectURL(prev)
      return previewUrl ?? announcement?.image_url ?? null
    })
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      await submitAnnouncement(formik.values, true)
      toast.success(
        isEdit ? 'Announcement updated and saved as draft.' : 'Announcement saved as draft.',
        { title: 'Draft saved' },
      )
      navigate('/announcements')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save draft. Please try again.'
      toast.error(message, { title: 'Save failed' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isEdit && isLoadingAnnouncement) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center py-20 text-sm text-nav">
        Loading announcement...
      </div>
    )
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto pb-8"
    >
      <CreateAnnouncementHeader
        mode={mode}
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
        disabled={formik.isSubmitting}
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <CreateAnnouncementForm formik={formik} />
        </div>
        <CreateAnnouncementSidebar
          mode={mode}
          bannerPreview={bannerPreview}
          onBannerChange={handleBannerChange}
          onPublish={formik.submitForm}
          isPublishing={formik.isSubmitting}
        />
      </div>
    </form>
  )
}
