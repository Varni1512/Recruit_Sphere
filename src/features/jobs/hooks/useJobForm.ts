import { createJobSchema, CreateJobInput } from "@/shared/schemas/jobSchema"
import { useState } from "react"
import { createJob } from "@/app/actions/jobActions"
import { useRouter } from "next/navigation"
import { extractKeywordsFromText } from "@/lib/atsUtils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
        { roundName: "Aptitude", totalScore: 100, passingScore: 70, selected: true },
        { roundName: "Coding", totalScore: 100, passingScore: 70, selected: true },
        { roundName: "AI Interview", totalScore: 100, passingScore: 70, selected: true },
        { roundName: "Technical Interview", totalScore: 100, passingScore: 70, selected: true },
        { roundName: "Final Interview", totalScore: 100, passingScore: 70, selected: true },
      ],
    },
  })

  const handlePreSave = async () => {
    // Trigger validation for all fields
    const isValid = await form.trigger()
    
    if (!isValid) {
      const errorMessages = Object.entries(form.formState.errors)
        .map(([field, error]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
          return `${fieldName}: ${error?.message}`
        })
        .join("\n")
      
      alert(`Please fix the following errors before saving:\n\n${errorMessages}`)
      return
    }

    const { title, description } = form.getValues()
    const extracted = extractKeywordsFromText(description || title)
    form.setValue("atsKeywords", extracted)
    setShowATSModal(true)
  }

  const onSubmit = async (data: CreateJobInput) => {
    // Filter out rounds that are not selected
    const selectedPipeline = data.hiringPipeline.filter(round => round.selected)
    
    if (selectedPipeline.length === 0) {
      alert("Please select at least one round for the hiring pipeline.")
      return
    }

    const submissionData = {
      ...data,
      hiringPipeline: selectedPipeline
    }

    setIsSaving(true)
    try {
      const result = await createJob(submissionData)
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
