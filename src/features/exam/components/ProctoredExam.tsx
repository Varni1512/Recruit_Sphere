"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { submitExam } from "@/app/actions/examActions"
import { useRouter } from "next/navigation"

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

interface Question {
  question: string;
  questionType: string;
  options: string[];
  marks: number;
}

interface ProctoredExamProps {
  jobId: string;
  applicationId: string;
  questions: Question[];
  durationMinutes: number;
  proctoringLogs: any[];
  onComplete: () => void;
}

export const ProctoredExam = ({ jobId, applicationId, questions, durationMinutes, proctoringLogs, onComplete }: ProctoredExamProps) => {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState<(Question & { originalIndex: number })[]>([])

  useEffect(() => {
    const shuffled = shuffleArray(questions.map((q, i) => ({ ...q, originalIndex: i })));
    shuffled.forEach(q => {
      if (q.options && q.options.length > 0) {
        q.options = shuffleArray(q.options.filter(Boolean));
      }
    });
    setShuffledQuestions(shuffled);
  }, [questions])

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Expose a method to the parent to force submit (e.g., from proctoring violation)
  // Since we are using standard state, the parent can just pass a prop or we can handle it here.
  // Actually, parent will call `submitExam` directly if a fatal violation occurs.

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    const result = await submitExam(applicationId, jobId, answers, proctoringLogs)
    setIsSubmitting(false)
    if (result.success) {
      onComplete()
    } else {
      alert("Failed to submit exam: " + result.error)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="grid gap-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md py-4 border-b flex justify-between items-center px-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold">Aptitude Questions</h2>
        <div className={`text-lg font-mono px-4 py-1.5 rounded-lg border shadow-inner ${timeLeft < 300 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-card text-foreground border-border'}`}>
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2 font-sans">Time Left</span>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid gap-8 pb-24">
        {shuffledQuestions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Preparing your exam...</div>
        ) : shuffledQuestions.map((q, displayIndex) => (
          <Card key={q.originalIndex} className="shadow-sm border-muted/60">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg leading-relaxed flex">
                <span className="text-primary mr-3 select-none">Q{displayIndex + 1}.</span>
                <span className="flex-1">{q.question}</span>
                <span className="text-sm text-muted-foreground font-normal ml-4 whitespace-nowrap bg-muted px-2 py-1 rounded-md h-fit">
                  {q.marks} Marks
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {q.questionType === 'mcq' ? (
                <RadioGroup 
                  value={answers[q.originalIndex] || ""} 
                  onValueChange={(val) => setAnswers(prev => ({ ...prev, [q.originalIndex]: val }))}
                  className="grid gap-3"
                >
                  {q.options.map((opt, i) => opt && (
                    <div key={i} className="flex items-center space-x-3 border p-4 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer group">
                      <RadioGroupItem value={opt} id={`q${q.originalIndex}-opt${i}`} />
                      <Label htmlFor={`q${q.originalIndex}-opt${i}`} className="flex-1 cursor-pointer text-base group-hover:text-primary transition-colors">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="grid gap-2">
                  <Label className="text-sm text-muted-foreground mb-1">Your Answer</Label>
                  <Input 
                    placeholder="Type your answer here..."
                    className="h-12 text-base"
                    value={answers[q.originalIndex] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.originalIndex]: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 lg:left-0 right-0 lg:right-96 p-4 bg-background/80 backdrop-blur-md border-t flex justify-end z-30">
        <Button size="lg" onClick={handleFinalSubmit} disabled={isSubmitting} className="min-w-[200px] shadow-lg">
          {isSubmitting ? "Submitting..." : "Submit Exam"}
        </Button>
      </div>
    </div>
  )
}
