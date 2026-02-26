export const contactFormSchema = {
    validate: (values) => {
        const errors = {}

        if (!values.name || values.name.length < 2) {
            errors.name = "Name is required (min 2 chars)"
        }

        if (!values.email || !values.email.includes("@")) {
            errors.email = "Valid email is required"
        }

        if (!values.message || values.message.length < 10) {
            errors.message = "Message must be at least 10 characters"
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }
}
