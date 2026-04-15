import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/shared/schemas/authSchema"
import { loginAction, registerCandidateAction } from "@/app/actions/authActions"
import { useRouter } from "next/navigation"

export const useAuth = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  })

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "candidate"
    }
  })

  const handleLogin = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await loginAction(data)
      if (res.success) {
        router.push(res.user.role === 'recruiter' ? '/' : '/candidate/dashboard')
      } else {
        setError(res.error)
      }
    } catch (err: any) {
      setError("An unexpected error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await registerCandidateAction(data)
      if (res.success) {
        router.push(res.user.role === 'recruiter' ? '/' : '/candidate/dashboard')
      } else {
        setError(res.error)
      }
    } catch (err: any) {
      setError("An unexpected error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    loginForm,
    registerForm,
    handleLogin: loginForm.handleSubmit(handleLogin),
    handleRegister: registerForm.handleSubmit(handleRegister),
  }
}
