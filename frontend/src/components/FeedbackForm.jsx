import { useState } from 'react'

const defaultForm = {
  student_name: '',
  hall_ticket: '',
  department: 'CSE',
  year: 1,
  category: 'Faculty',
  rating: 5,
  feedback_message: '',
}

const departments = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MBA', 'MCA', 'AIML']
const categories = ['Faculty', 'Labs', 'Hostel', 'WiFi', 'Placements', 'Canteen', 'Transport', 'Library', 'Campus']

export default function FeedbackForm({ onSubmit }) {
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState('idle')

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
    <form className="panel form-grid glass neon" onSubmit={handleSubmit}>
      <div className="section-head">
        <h2>Submit Student Feedback</h2>
        <p>Capture real college feedback across academic, hostel, transport, and campus services.</p>
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
              <option key={department}>{department}</option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select value={form.year} onChange={(e) => update('year', e.target.value)}>
            {[1, 2, 3, 4].map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </label>
        <label>
          Feedback Category
          <select value={form.category} onChange={(e) => update('category', e.target.value)}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Rating
          <select value={form.rating} onChange={(e) => update('rating', e.target.value)}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating}>{rating}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Feedback Message
        <textarea rows="5" value={form.feedback_message} onChange={(e) => update('feedback_message', e.target.value)} placeholder="Faculty teaching is excellent." required />
      </label>
      <div className="form-footer">
        <button className="primary-btn" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting...' : 'Send Feedback'}
        </button>
        <span className={`form-status ${status}`}>{status === 'success' ? 'Submitted successfully' : status === 'error' ? 'Submission failed' : 'Ready'}</span>
      </div>
    </form>
  )
}
