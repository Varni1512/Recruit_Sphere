import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AptitudeConfigModalProps {
  form: UseFormReturn<any>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AptitudeConfigModal = ({ form, open, onOpenChange }: AptitudeConfigModalProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "aptitudeQuestions",
  })

  const handleAddQuestion = () => {
    append({
      question: "",
      questionType: "mcq",
      options: ["", "", "", ""],
      answer: "",
      marks: 1
    })
  }

  // Calculate total marks to show user
  const totalMarks = (form.watch("aptitudeQuestions") || []).reduce((sum: number, q: any) => sum + (q.marks || 1), 0)
  
  // Find required marks from pipeline
  const pipeline = form.watch("hiringPipeline")
  const aptitudeRound = pipeline?.find((r: any) => r.roundName === "Aptitude" || r.roundName === "Apptitude Round")
  const requiredMarks = aptitudeRound?.totalScore || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/30">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl">Configure Aptitude Exam</DialogTitle>
              <DialogDescription>
                Build your AI-proctored aptitude questions. 
              </DialogDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${totalMarks === requiredMarks ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              Total Marks: {totalMarks} / {requiredMarks}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-6">
            <div className="grid gap-2 w-full md:w-1/2">
              <Label>Exam Duration (Minutes)</Label>
              <Input 
                type="number" 
                {...form.register("examDuration", { valueAsNumber: true })} 
                placeholder="e.g., 30"
              />
              <p className="text-xs text-muted-foreground">Time limit for the candidate to complete the exam.</p>
            </div>

            <Separator />

            <div className="grid gap-4">
              {fields.map((field: any, index: number) => {
                const qType = form.watch(`aptitudeQuestions.${index}.questionType`)

                return (
                  <div key={field.id} className="p-4 border rounded-xl bg-card shadow-sm grid gap-4 relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-semibold text-muted-foreground text-sm">Q{index + 1}</span>
                      <div className="grid gap-2 flex-1">
                        <Label>Question</Label>
                        <Textarea 
                          placeholder="Enter the question text..."
                          className="min-h-[80px]"
                          {...form.register(`aptitudeQuestions.${index}.question`)}
                        />
                      </div>
                      <div className="grid gap-2 w-1/4">
                        <Label>Type</Label>
                        <Select
                          value={qType}
                          onValueChange={(val) => {
                            form.setValue(`aptitudeQuestions.${index}.questionType`, val)
                            if (val === 'text') {
                              form.setValue(`aptitudeQuestions.${index}.options`, [])
                              form.setValue(`aptitudeQuestions.${index}.answer`, "")
                            } else {
                              form.setValue(`aptitudeQuestions.${index}.options`, ["", "", "", ""])
                              form.setValue(`aptitudeQuestions.${index}.answer`, "")
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Single Choice (MCQ)</SelectItem>
                            <SelectItem value="text">Fill in the Blank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(qType === 'mcq' || qType === 'msq') && (
                      <div className="grid grid-cols-2 gap-4 mt-2 pl-8">
                        {[0, 1, 2, 3].map((optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4">{String.fromCharCode(65 + optIndex)}.</span>
                            <Input 
                              placeholder={`Option ${optIndex + 1}`}
                              className="h-8"
                              {...form.register(`aptitudeQuestions.${index}.options.${optIndex}`)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 pl-8">
                      <div className="grid gap-2 flex-1">
                        <Label className="text-primary">Correct Answer</Label>
                        {qType === 'mcq' ? (
                          <Select
                            value={form.watch(`aptitudeQuestions.${index}.answer`) || ""}
                            onValueChange={(val) => form.setValue(`aptitudeQuestions.${index}.answer`, val)}
                          >
                            <SelectTrigger className="h-9 border-primary/30 focus:ring-primary/20">
                              <SelectValue placeholder="Select correct option" />
                            </SelectTrigger>
                            <SelectContent>
                              {[0, 1, 2, 3].map((optIndex) => {
                                const optValue = form.watch(`aptitudeQuestions.${index}.options.${optIndex}`)
                                return (
                                  <SelectItem key={optIndex} value={optValue || `Option ${optIndex + 1}`}>
                                    {String.fromCharCode(65 + optIndex)}: {optValue || `Option ${optIndex + 1}`}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            placeholder="Enter the exact correct answer"
                            className="h-9 border-primary/30"
                            {...form.register(`aptitudeQuestions.${index}.answer`)}
                          />
                        )}
                      </div>
                      <div className="grid gap-2 w-32">
                        <Label>Marks</Label>
                        <Input 
                          type="number" 
                          className="h-9"
                          {...form.register(`aptitudeQuestions.${index}.marks`, { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                  </div>
                )
              })}

              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-primary transition-colors"
                onClick={handleAddQuestion}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Aptitude Question
              </Button>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t bg-muted/30 shrink-0 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Done Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
