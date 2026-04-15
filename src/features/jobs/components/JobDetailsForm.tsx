import { UseFormReturn } from "react-hook-form"
import { CreateJobInput } from "@/shared/schemas/jobSchema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface JobDetailsFormProps {
  form: UseFormReturn<any>
}

export const JobDetailsForm = ({ form }: JobDetailsFormProps) => {
  const { register, setValue, watch, formState: { errors } } = form

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
          <Label htmlFor="title">Job Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Senior Product Designer" 
            {...register("title")} 
          />
          {errors.title && <span className="text-xs text-destructive">{errors.title.message as any}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={(val) => setValue("department", val)} value={watch("department")}>
                  <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
              </Select>
              {errors.department && <span className="text-xs text-destructive">{errors.department.message as any}</span>}
          </div>
          <div className="grid gap-2">
              <Label htmlFor="type">Employment Type</Label>
              <Select onValueChange={(val) => setValue("type", val)} value={watch("type")}>
                  <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
              </Select>
              {errors.type && <span className="text-xs text-destructive">{errors.type.message as any}</span>}
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
              <Label htmlFor="location-type">Location Type</Label>
              <Select onValueChange={(val) => setValue("locationType", val)} value={watch("locationType")}>
                  <SelectTrigger id="location-type">
                      <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
              </Select>
              {errors.locationType && <span className="text-xs text-destructive">{errors.locationType.message as any}</span>}
          </div>
          <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. New York, NY" {...register("location")} />
              {errors.location && <span className="text-xs text-destructive">{errors.location.message as any}</span>}
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select onValueChange={(val) => setValue("experience", val)} value={watch("experience")}>
                  <SelectTrigger id="experience">
                      <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Entry Level">Entry Level</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Director/Executive">Director/Executive</SelectItem>
                  </SelectContent>
              </Select>
              {errors.experience && <span className="text-xs text-destructive">{errors.experience.message as any}</span>}
          </div>
          <div className="grid gap-2">
              <Label htmlFor="salary">Estimated Salary</Label>
              <Input id="salary" placeholder="e.g. $80,000 - $100,000" {...register("salary")} />
              {errors.salary && <span className="text-xs text-destructive">{errors.salary.message as any}</span>}
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
              <Label htmlFor="app-days">Application Window (Days)</Label>
              <div className="flex items-center gap-2">
                  <Input id="app-days" type="number" {...register("applicationCloseDays", { valueAsNumber: true })} />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">days to apply</span>
              </div>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="hiring-days">Hiring Window (Days)</Label>
              <div className="flex items-center gap-2">
                  <Input id="hiring-days" type="number" {...register("hiringDeadlineDays", { valueAsNumber: true })} />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">total days to hire</span>
              </div>
          </div>
      </div>

      <Separator className="my-2" />

      <div className="grid gap-2">
          <Label htmlFor="description">Job Description</Label>
          <div className="border rounded-md overflow-hidden bg-background">
              <MDEditor
                  value={watch("description")}
                  onChange={(val) => setValue("description", val || '')}
                  height={300}
                  preview="edit"
                  className="w-full"
              />
          </div>
          {errors.description && <span className="text-xs text-destructive">{errors.description.message as any}</span>}
      </div>
    </div>
  )
}
