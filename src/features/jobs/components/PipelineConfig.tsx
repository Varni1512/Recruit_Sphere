import { Control, useFieldArray, UseFormReturn } from "react-hook-form"
import { CreateJobInput } from "@/shared/schemas/jobSchema"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

interface PipelineConfigProps {
  form: UseFormReturn<any>
}

export const PipelineConfig = ({ form }: PipelineConfigProps) => {
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "hiringPipeline",
  })

  // We need to keep track of "selection" separately if we want to toggle them in the UI
  // But in RHF, we can just filter them on submit. 
  // For now, I'll follow the existing UI logic where they are all there but some are "selected".
  // Actually, the original code had a list and toggled them.
  
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-1">
        <Label className="text-lg font-bold">Hiring Pipeline</Label>
        <p className="text-sm text-muted-foreground">Select the rounds for this job and set the qualifying scores.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field: any, index: number) => {
          const isSelected = form.watch(`hiringPipeline.${index}.selected`);
          
          return (
            <div 
              key={field.id} 
              className={`p-4 rounded-xl border transition-all shadow-sm ${
                isSelected 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-muted/50 border-border opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`round-${index}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        form.setValue(`hiringPipeline.${index}.selected`, !!checked);
                      }}
                    />
                    <Label 
                      htmlFor={`round-${index}`}
                      className={`font-semibold cursor-pointer ${!isSelected && "text-muted-foreground"}`}
                    >
                      {field.roundName}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Total Score</Label>
                  <Input 
                    type="number" 
                    className="h-8 text-sm"
                    disabled={!isSelected}
                    {...form.register(`hiringPipeline.${index}.totalScore`, { valueAsNumber: true })} 
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Passing Score</Label>
                  <Input 
                    type="number" 
                    className="h-8 text-sm text-primary font-medium"
                    disabled={!isSelected}
                    {...form.register(`hiringPipeline.${index}.passingScore`, { valueAsNumber: true })} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
