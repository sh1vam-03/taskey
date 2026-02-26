import { useEffect, useState } from "react"

export default function useTheme() {
    const [theme, setTheme] = useState("light")

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "light"
        setTheme(storedTheme)
        document.documentElement.setAttribute("data-theme", storedTheme)
    }, [])

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    return [theme, setTheme]
}
