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

  const form = useForm({
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
      codingExamDuration: 60,
      codingQuestionsPerCandidate: 2,
      codingQuestions: [],
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

    const { title, description, hiringPipeline, aptitudeQuestions, codingQuestions } = form.getValues()

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

    const codingRound = hiringPipeline?.find((r: any) => r.roundName === "Coding" || r.roundName === "Coding Round")
    if (codingRound?.selected) {
      if (!codingQuestions || codingQuestions.length === 0) {
        alert("Please add at least one coding question if the Coding Round is selected.")
        return
      }
      const codingQuestionsPerCandidate = form.getValues().codingQuestionsPerCandidate || codingQuestions.length
      
      if (codingQuestionsPerCandidate < codingQuestions.length) {
        // Random subset mode: Each question must have exactly (totalScore / N) marks
        const expectedMarksPerQuestion = codingRound.totalScore / codingQuestionsPerCandidate
        const hasInvalidMarks = codingQuestions.some((q: any) => (q.marks || 0) !== expectedMarksPerQuestion)
        
        if (hasInvalidMarks) {
          alert(`Since you are randomly assigning ${codingQuestionsPerCandidate} questions per candidate out of a pool of ${codingQuestions.length}, EVERY question must be worth exactly ${expectedMarksPerQuestion} marks to ensure candidates are graded out of the Total Score (${codingRound.totalScore}). Please adjust the question marks.`)
          return
        }
      } else {
        // All questions assigned mode: Sum of all questions must equal total score
        const sumOfCodingMarks = (codingQuestions || []).reduce((sum: number, q: any) => sum + (q.marks || 0), 0)
        if (sumOfCodingMarks !== codingRound.totalScore) {
          alert(`Total marks in Coding Questions (${sumOfCodingMarks}) must equal the Coding Round Total Score (${codingRound.totalScore}).`)
          return
        }
      }
    }

    const extracted = extractKeywordsFromText(description || title)
    form.setValue("atsKeywords", extracted)
    setShowATSModal(true)
  }

  const onSubmit = async (data: any) => {
    // Filter out rounds that are not selected
    const selectedPipeline = data.hiringPipeline.filter((round: any) => round.selected)
    
    if (selectedPipeline.length === 0) {
      alert("Please select at least one round for the hiring pipeline.")
      return
    }

    const submissionData = {
      ...data,
      hiringPipeline: selectedPipeline,
      aptitudeQuestions: form.getValues().aptitudeQuestions || [],
      codingQuestions: form.getValues().codingQuestions || [],
      codingQuestionsPerCandidate: form.getValues().codingQuestionsPerCandidate || 2
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
