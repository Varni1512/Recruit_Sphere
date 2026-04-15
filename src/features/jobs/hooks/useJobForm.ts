import { createJobSchema, CreateJobInput } from "@/shared/schemas/jobSchema"
import { useState } from "react"
import { createJob } from "@/app/actions/jobActions"
import { useRouter } from "next/navigation"
import { extractKeywordsFromText } from "@/lib/atsUtils"

export const useJobForm = () => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showATSModal, setShowATSModal] = useState(false)

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      department: "",
      type: "",
      locationType: "",
      location: "",
      experience: "",
      salary: "",
      description: "",
      atsKeywords: [],
      atsCriteriaScore: 75,
      applicationCloseDays: 3,
      hiringDeadlineDays: 15,
      hiringPipeline: [
        { roundName: "Aptitude", totalScore: 100, passingScore: 70 },
        { roundName: "Coding", totalScore: 100, passingScore: 70 },
        { roundName: "AI Interview", totalScore: 100, passingScore: 70 },
        { roundName: "Technical Interview", totalScore: 100, passingScore: 70 },
        { roundName: "Final Interview", totalScore: 100, passingScore: 70 },
      ],
    },
  })

  const handlePreSave = () => {
    const { title, description, department, type, locationType, location, experience, salary } = form.getValues()
    
    if (!title || !department || !type || !locationType || !location || !experience || !salary) {
      alert("Please fill in all required fields.")
      return
    }

    const extracted = extractKeywordsFromText(description || title)
    form.setValue("atsKeywords", extracted)
    setShowATSModal(true)
  }

  const onSubmit = async (data: CreateJobInput) => {
    setIsSaving(true)
    try {
      const result = await createJob(data)
      if (result.success) {
        router.push('/jobs')
      } else {
        alert("Failed to create job: " + result.error)
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setIsSaving(false)
      setShowATSModal(false)
    }
  }

  return {
    form,
    isSaving,
    showATSModal,
    setShowATSModal,
    handlePreSave,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
