import { useState } from "react"
import { contactFormSchema } from "./contactForm.schema"
import { submitContactForm } from "./contactForm.actions"

export const useContactForm = () => {
    const [values, setValues] = useState({ name: "", email: "", message: "" })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setValues(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})
        setResult(null)

        const validation = contactFormSchema.validate(values)
        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        setIsSubmitting(true)
        try {
            const response = await submitContactForm(values)
            setResult({ type: "success", message: response.message })
            setValues({ name: "", email: "", message: "" })
        } catch (err) {
            setResult({ type: "error", message: "Failed to send message" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        values,
        errors,
        isSubmitting,
        result,
        handleChange,
        handleSubmit
    }
}
