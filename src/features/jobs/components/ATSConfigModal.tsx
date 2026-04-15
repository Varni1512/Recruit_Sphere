import { UseFormReturn } from "react-hook-form"
import { CreateJobInput } from "@/shared/schemas/jobSchema"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, X } from "lucide-react"
import { useState } from "react"

interface ATSConfigModalProps {
  form: UseFormReturn<CreateJobInput>
  open: boolean
  onOpenChange: (open: boolean) => void
  isSaving: boolean
  onConfirm: () => void
}

export const ATSConfigModal = ({ 
  form, 
  open, 
  onOpenChange, 
  isSaving, 
  onConfirm 
}: ATSConfigModalProps) => {
  const [newKeyword, setNewKeyword] = useState("")
  const keywords = form.watch("atsKeywords")

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      form.setValue("atsKeywords", [...keywords, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    form.setValue("atsKeywords", keywords.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Configure ATS Scoring</DialogTitle>
                <DialogDescription>
                    We automatically extracted priority keywords from your description. The system will use these to scan incoming candidate resumes.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Extracted Keywords</Label>
                    <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-muted/50 min-h-[80px] content-start">
                        {keywords.length === 0 ? <p className="text-sm text-muted-foreground">No keywords extracted.</p> : null}
                        {keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1 pr-1.5 py-1">
                                {keyword}
                                <button 
                                    onClick={() => removeKeyword(i)}
                                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Add custom keyword..." 
                            value={newKeyword} 
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addKeyword()
                                }
                            }}
                        />
                        <Button type="button" onClick={addKeyword} variant="secondary">Add</Button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="criteriaScore">Minimum Shortlisting Score (%)</Label>
                    <Input 
                        id="criteriaScore" 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...form.register("atsCriteriaScore", { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground text-balance">Candidates with a resume match score equal or above this will bypass the Applied stage and immediately enter the Shortlisted stage.</p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={onConfirm} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Posting..." : "Confirm & Post Job"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
