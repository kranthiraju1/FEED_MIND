import { useEffect, useMemo, useState } from 'react'

const facultyData = {
  CSE: {
    1: {
      A: [
        { name: 'Ravi', subject: 'Mathematics' },
        { name: 'Suma', subject: 'Physics' },
      ],
      B: [
        { name: 'Kiran', subject: 'English' },
        { name: 'Nisha', subject: 'Programming' },
      ],
    },
    2: {
      A: [
        { name: 'Ria', subject: 'Data Structures' },
        { name: 'Vikram', subject: 'Algorithms' },
      ],
      B: [
        { name: 'Shreya', subject: 'Database Systems' },
      ],
    },
  },
  ECE: {
    1: {
      A: [
        { name: 'Priya', subject: 'Electronics' },
        { name: 'Amit', subject: 'Signals' },
      ],
      B: [
        { name: 'Meera', subject: 'Networks' },
      ],
    },
  },
  MBA: {
    1: {
      A: [
        { name: 'Aisha', subject: 'Marketing' },
      ],
      B: [
        { name: 'Rahul', subject: 'Strategy' },
      ],
    },
  },
}

const departments = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MBA', 'MCA', 'AIML']
const categories = ['Faculty', 'Labs', 'Hostel', 'WiFi', 'Placements', 'Canteen', 'Transport', 'Library', 'Campus']
const emotions = ['Joy', 'Anger', 'Sadness', 'Fear', 'Surprise', 'Neutral']
const sections = ['A', 'B', 'C']

const defaultForm = {
  student_name: '',
  hall_ticket: '',
  department: 'CSE',
  year: 1,
  section: 'A',
  faculty_name: 'Ravi',
  subject: 'Mathematics',
  category: 'Faculty',
  rating: 5,
  emotion: 'Neutral',
  feedback_message: '',
}

export default function FeedbackForm({ onSubmit }) {
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState('idle')

  const facultyOptions = useMemo(
    () => facultyData[form.department]?.[form.year]?.[form.section] ?? [],
    [form.department, form.year, form.section],
  )

  useEffect(() => {
    if (facultyOptions.length && !facultyOptions.some((option) => option.name === form.faculty_name)) {
      const next = facultyOptions[0]
      setForm((current) => ({ ...current, faculty_name: next.name, subject: next.subject }))
    }
  }, [facultyOptions, form.faculty_name])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    try {
      await onSubmit({
        ...form,
        year: Number(form.year),
        rating: Number(form.rating),
      })
      setForm(defaultForm)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="panel form-grid glass neon feedback-form" onSubmit={handleSubmit}>
      <div className="section-head">
        <h2>Student Feedback Submission</h2>
        <p>Share student experience instantly with a modern glass form and AI-ready metadata.</p>
      </div>
      <div className="grid-2">
        <label>
          Student Name
          <input value={form.student_name} onChange={(e) => update('student_name', e.target.value)} required />
        </label>
        <label>
          Hall Ticket Number
          <input value={form.hall_ticket} onChange={(e) => update('hall_ticket', e.target.value)} required />
        </label>
        <label>
          Department
          <select value={form.department} onChange={(e) => update('department', e.target.value)}>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select value={form.year} onChange={(e) => update('year', Number(e.target.value))}>
            {[1, 2, 3, 4].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
        <label>
          Section
          <select value={form.section} onChange={(e) => update('section', e.target.value)}>
            {sections.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </label>
        <label>
          Faculty
          <select value={form.faculty_name} onChange={(e) => update('faculty_name', e.target.value)}>
            {facultyOptions.length ? (
              facultyOptions.map((faculty) => (
                <option key={faculty.name} value={faculty.name}>{`${faculty.name} - ${faculty.subject}`}</option>
              ))
            ) : (
              <option value="">No faculty available</option>
            )}
          </select>
        </label>
        <label>
          Subject
          <input value={form.subject} onChange={(e) => update('subject', e.target.value)} required />
        </label>
        <label>
          Emotion
          <select value={form.emotion} onChange={(e) => update('emotion', e.target.value)}>
            {emotions.map((emotion) => (
              <option key={emotion} value={emotion}>{emotion}</option>
            ))}
          </select>
        </label>
        <label>
          Feedback Category
          <select value={form.category} onChange={(e) => update('category', e.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Rating
          <select value={form.rating} onChange={(e) => update('rating', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="full-width">
        Feedback Message
        <textarea
          rows="5"
          value={form.feedback_message}
          onChange={(e) => update('feedback_message', e.target.value)}
          placeholder="Example: Faculty guided the project session very well and clarified all doubts."
          required
        />
      </label>
      <div className="form-footer">
        <button className="primary-btn" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
        </button>
        <span className={`form-status ${status}`}>{status === 'success' ? 'Submitted successfully' : status === 'error' ? 'Submission failed' : 'Ready to send'}</span>
      </div>
    </form>
  )
}
