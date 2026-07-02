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
      company: "",
      department: "",
      type: "",
      locationType: "",
      location: "",
      experience: "",
      salary: "",
      description: "",
      atsKeywords: [],
      atsCriteriaScore: 75,
      examDuration: 30,
      aptitudeQuestions: [],
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

    const { title, description, hiringPipeline, aptitudeQuestions } = form.getValues()

    const invalidRound = hiringPipeline?.find((r: any) => r.selected && r.passingScore > r.totalScore)
    if (invalidRound) {
      alert(`Error in ${invalidRound.roundName} round: Passing score (${invalidRound.passingScore}) cannot be greater than Total score (${invalidRound.totalScore}).`)
      return
    }

    const aptitudeRound = hiringPipeline?.find((r: any) => r.roundName === "Aptitude" || r.roundName === "Apptitude Round")
    if (aptitudeRound?.selected) {
      const sumOfMarks = (aptitudeQuestions || []).reduce((sum: number, q: any) => sum + (q.marks || 1), 0)
      if (sumOfMarks !== aptitudeRound.totalScore) {
        alert(`Total marks in Aptitude Questions (${sumOfMarks}) must equal the Aptitude Round Total Score (${aptitudeRound.totalScore}). Please adjust the question marks or the round score.`)
        return
      }
    }

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
      hiringPipeline: selectedPipeline,
      aptitudeQuestions: form.getValues().aptitudeQuestions || []
    }

    setIsSaving(true)
    console.log("SUBMISSION DATA:", submissionData)
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
