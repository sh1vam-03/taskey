export default function Spinner({ size = "md", className = "" }) {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    }

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`${sizes[size]} border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin`}
            ></div>
            <span className="sr-only">Loading...</span>
        </div>
    )
}
