import React, { useEffect, useState } from "react"

const Contact = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

 
  useEffect(() => {
    document.title = "Contact & Support | Taskey"
  }, [])

  const handlesubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name || !email || !message)
      return setError("All fields are required.")

    if (!/\S+@\S+\.\S+/.test(email))
      return setError("Please enter a valid email address.")
        if(!message) return setError("Message cannot be empty.")

      try {

        setLoading(true)

        await new Promise((resolve) => setTimeout(resolve, 2000))

        console.log("contact form submitted", { name, email, message })

        setSuccess("Your message has been sent successfully!")
        setName("")
        setEmail("")
        setMessage("")
        
      } catch (err) {
        setError("An error occurred while sending your message. Please try again later.")
      } finally {
        setLoading(false)
      }
    
    }
   
    

  return (
    <main
      className=" max-w-4xl mx-auto px-4 sm:px-6  py-20"
      style={{ color: "var(--text)" }}
    >
      {/* Header */}
      <header className="mb-16 text-center fade-up">
        <h1
          className="text-4xl font-semibold mb-3"
          style={{ color: "var(--heading)" }}
        >
          Contact & Support
        </h1>
        <p className="opacity-80 max-w-xl mx-auto">
          Need help, have feedback, or want to report an issue?
          We’d love to hear from you.
        </p>
      </header>

         {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm mb-3">{success}</p>
        )}

      {/* Contact Options */}
      <div className="grid md:grid-cols-2 gap-12">

        {/* Contact Form */}
        <form onSubmit={handlesubmit}
          className="p-8 rounded-xl border space-y-5 m-4"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} label="Your Name" />

          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} label="Your Email" />

          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} label="Message" />

          <button
             className="px-6 py-3 rounded-lg border transition hover:opacity-800 cursor-pointer"
            style={{ borderColor: "var(--border)" }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Support Info */}
        <div className="space-y-8">
          <div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--heading)" }}
            >
              Email Support
            </h3>
            <p className="opacity-80">
              support@taskey.app
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--heading)" }}
            >
              GitHub Issues
            </h3>
            <p className="opacity-80 mb-2">
              Found a bug or have a feature request?
            </p>
            <a
              href="https://github.com/your-repo/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Open an Issue on GitHub
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}

/* Form components */
const Input = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="text-sm opacity-80 block mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-md border outline-none"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
    />
  </div>
)

const Textarea = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm opacity-80 block mb-1">{label}</label>
    <textarea
      rows="4"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-md border outline-none"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
    />
  </div>
)

export default Contact


// import React, { useEffect, useState } from "react"

// const Contact = () => {
//   const [name, setName] = useState("")
//   const [email, setEmail] = useState("")
//   const [message, setMessage] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")

//   useEffect(() => {
//     document.title = "Contact & Support | Taskey"
//   }, [])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")
//     setSuccess("")

//     if (!name || !email || !message)
//       return setError("All fields are required.")

//     if (!/\S+@\S+\.\S+/.test(email))
//       return setError("Please enter a valid email address.")

//     try {
//       setLoading(true)

//       await new Promise((resolve) => setTimeout(resolve, 2000))

//       console.log("contact form submitted", { name, email, message })

//       setSuccess("Your message has been sent successfully!")
//       setName("")
//       setEmail("")
//       setMessage("")
//     } catch {
//       setError("An error occurred while sending your message.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <main
//       className="max-w-4xl mx-auto px-4 sm:px-6 py-20"
//       style={{ color: "var(--text)" }}
//     >
//       {/* Header */}
//       <header className="mb-16 text-center fade-up">
//         <h1
//           className="text-4xl font-semibold mb-3"
//           style={{ color: "var(--heading)" }}
//         >
//           Contact & Support
//         </h1>
//         <p className="opacity-80 max-w-xl mx-auto">
//           Need help, have feedback, or want to report an issue?
//           We’d love to hear from you.
//         </p>
//       </header>

//       {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
//       {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

//       <div className="grid md:grid-cols-2 gap-12">
//         {/* Contact Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="p-8 rounded-xl border space-y-5"
//           style={{
//             backgroundColor: "var(--card)",
//             borderColor: "var(--border)",
//           }}
//         >
//           <Input
//             label="Your Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />

//           <Input
//             type="email"
//             label="Your Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />

//           <Textarea
//             label="Message"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />

//           <button
//             className="px-6 py-3 rounded-lg border transition hover:opacity-80"
//             style={{ borderColor: "var(--border)" }}
//             disabled={loading}
//           >
//             {loading ? "Sending..." : "Send Message"}
//           </button>
//         </form>

//         {/* Support Info */}
//         <div className="space-y-8">
//           <div>
//             <h3
//               className="text-lg font-medium mb-2"
//               style={{ color: "var(--heading)" }}
//             >
//               Email Support
//             </h3>
//             <p className="opacity-80">support@taskey.app</p>
//           </div>

//           <div>
//             <h3
//               className="text-lg font-medium mb-2"
//               style={{ color: "var(--heading)" }}
//             >
//               GitHub Issues
//             </h3>
//             <p className="opacity-80 mb-2">
//               Found a bug or have a feature request?
//             </p>
//             <a
//               href="https://github.com/your-repo/issues"
//               target="_blank"
//               rel="noreferrer"
//               className="hover:underline"
//             >
//               Open an Issue on GitHub
//             </a>
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }

// /* Reusable Inputs */
// const Input = ({ label, type = "text", value, onChange }) => (
//   <div>
//     <label className="text-sm opacity-80 block mb-1">{label}</label>
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       className="w-full px-4 py-2 rounded-md border outline-none"
//       style={{
//         backgroundColor: "var(--bg)",
//         borderColor: "var(--border)",
//         color: "var(--text)",
//       }}
//     />
//   </div>
// )

// const Textarea = ({ label, value, onChange }) => (
//   <div>
//     <label className="text-sm opacity-80 block mb-1">{label}</label>
//     <textarea
//       rows="4"
//       value={value}
//       onChange={onChange}
//       className="w-full px-4 py-2 rounded-md border outline-none"
//       style={{
//         backgroundColor: "var(--bg)",
//         borderColor: "var(--border)",
//         color: "var(--text)",
//       }}
//     />
//   </div>
// )

// export default Contact
