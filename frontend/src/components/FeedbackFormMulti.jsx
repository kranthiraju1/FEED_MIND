import { useState } from 'react'
import { api } from '../services/api'

// Faculty data structure
const facultyData = {
  CSE: {
    '1st Year': {
      'A': [
        { name: 'Ravi Kumar', subject: 'Mathematics' },
        { name: 'Suma Singh', subject: 'Physics' },
        { name: 'Kiran Patel', subject: 'English' }
      ],
      'B': [
        { name: 'Arun Sharma', subject: 'Chemistry' },
        { name: 'Priya Nair', subject: 'Biology' },
        { name: 'Vikram Das', subject: 'History' }
      ]
    },
    '2nd Year': {
      'A': [
        { name: 'Neha Gupta', subject: 'Data Structures' },
        { name: 'Rajesh Kumar', subject: 'Algorithms' },
        { name: 'Anjali Verma', subject: 'Database' }
      ],
      'B': [
        { name: 'Sanjay Patel', subject: 'Web Development' },
        { name: 'Meera Singh', subject: 'Python' },
        { name: 'Arjun Kumar', subject: 'Java' }
      ]
    },
    '3rd Year': {
      'A': [
        { name: 'Deepak Sharma', subject: 'Machine Learning' },
        { name: 'Pooja Yadav', subject: 'AI' },
        { name: 'Rohan Gupta', subject: 'Cloud Computing' }
      ],
      'B': [
        { name: 'Sangeeta Das', subject: 'Cybersecurity' },
        { name: 'Aditya Singh', subject: 'DevOps' },
        { name: 'Ritika Nair', subject: 'Blockchain' }
      ]
    }
  },
  ECE: {
    '1st Year': {
      'A': [
        { name: 'Suresh Kumar', subject: 'Circuit Theory' },
        { name: 'Divya Sharma', subject: 'Electronics' }
      ],
      'B': [
        { name: 'Harsh Patel', subject: 'Signals' },
        { name: 'Ananya Singh', subject: 'Systems' }
      ]
    },
    '2nd Year': {
      'A': [
        { name: 'Bhavesh Kumar', subject: 'Digital Design' },
        { name: 'Swati Nair', subject: 'Microprocessors' }
      ],
      'B': [
        { name: 'Mohan Das', subject: 'Communication' },
        { name: 'Neetu Verma', subject: 'Control Systems' }
      ]
    }
  },
  ME: {
    '1st Year': {
      'A': [
        { name: 'Rajesh Nair', subject: 'Mechanics' },
        { name: 'Kalpana Singh', subject: 'Thermodynamics' }
      ],
      'B': [
        { name: 'Vinay Kumar', subject: 'Engineering Drawing' },
        { name: 'Divya Gupta', subject: 'Fluid Mechanics' }
      ]
    }
  }
}

// Lab data structure
const labData = {
  CSE: ['Java Lab', 'Python Lab', 'DBMS Lab', 'Web Development Lab', 'AI/ML Lab'],
  ECE: ['VLSI Lab', 'Embedded Systems Lab', 'Digital Design Lab', 'Communication Lab'],
  ME: ['CAD Lab', 'Thermal Lab', 'Workshop Lab', 'Material Testing Lab']
}

// Lab assistants by department
const labAssistants = {
  CSE: ['Raj Patel', 'Sneha Sharma', 'Arun Kumar', 'Priya Singh'],
  ECE: ['Vikram Nair', 'Anjali Das', 'Rohan Verma'],
  ME: ['Suresh Kumar', 'Meera Patel', 'Arjun Singh']
}

// Hostel blocks
const hostelBlocks = ['A Block', 'B Block', 'C Block', 'D Block']
const hostelTypes = ['Boys Hostel', 'Girls Hostel']

// Bus routes and numbers
const busRoutes = [
  { route: 'Route 1: City Center to Campus', buses: ['Bus 101', 'Bus 102', 'Bus 103'] },
  { route: 'Route 2: Suburbs to Campus', buses: ['Bus 201', 'Bus 202'] },
  { route: 'Route 3: Airport to Campus', buses: ['Bus 301'] }
]

const busDrivers = ['Ramesh Kumar', 'Suresh Singh', 'Arun Patel', 'Vikram Das']

// Library sections
const librarySections = ['Reading Hall', 'Digital Library', 'Book Section', 'Reference Section', 'Periodicals']

// Infrastructure areas
const infrastructureAreas = ['Classrooms', 'Campus Cleanliness', 'Washrooms', 'Drinking Water', 'WiFi', 'Parking', 'Canteen', 'Auditorium', 'Sports Facilities']

const departments = Object.keys(facultyData)
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const sections = ['A', 'B', 'C']

export default function FeedbackFormMulti() {
  // Category state
  const [category, setCategory] = useState('')
  
  // Common fields
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  
  // Faculty feedback
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [section, setSection] = useState('')
  const [facultyName, setFacultyName] = useState('')
  const [subject, setSubject] = useState('')
  const [teachingQuality, setTeachingQuality] = useState(5)
  const [behavior, setBehavior] = useState(5)
  const [communication, setCommunication] = useState(5)
  
  // Lab feedback
  const [labName, setLabName] = useState('')
  const [labAssistant, setLabAssistant] = useState('')
  const [equipmentCondition, setEquipmentCondition] = useState(5)
  const [internetQuality, setInternetQuality] = useState(5)
  const [cleanliness, setCleanliness] = useState(5)
  
  // Hostel feedback
  const [hostelType, setHostelType] = useState('')
  const [block, setBlock] = useState('')
  const [foodQuality, setFoodQuality] = useState(5)
  const [waterFacility, setWaterFacility] = useState(5)
  const [roomCleanliness, setRoomCleanliness] = useState(5)
  const [washroom, setWashroom] = useState(5)
  const [warden, setWarden] = useState(5)
  const [security, setSecurity] = useState(5)
  const [wifi, setWifi] = useState(5)
  
  // Transport feedback
  const [route, setRoute] = useState('')
  const [busNumber, setBusNumber] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverBehavior, setDriverBehavior] = useState(5)
  const [safetyConcern, setSafetyConcern] = useState(5)
  const [busCleanliness, setBusCleanliness] = useState(5)
  const [punctuality, setPunctuality] = useState(5)
  const [seating, setSeating] = useState(5)
  
  // Library feedback
  const [libSection, setLibSection] = useState('')
  const [bookAvailability, setBookAvailability] = useState(5)
  const [environment, setEnvironment] = useState(5)
  const [silence, setSilence] = useState(5)
  const [librarianBehavior, setLibrarianBehavior] = useState(5)
  const [seatingArrangement, setSeatingArrangement] = useState(5)
  const [libWifi, setLibWifi] = useState(5)
  
  // Infrastructure feedback
  const [infraArea, setInfraArea] = useState('')
  const [maintenance, setMaintenance] = useState(5)
  const [infraCleanliness, setInfraCleanliness] = useState(5)
  const [safety, setSafety] = useState(5)
  const [accessibility, setAccessibility] = useState(5)
  
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorDetails, setErrorDetails] = useState('')
  
  // Get available faculty for selected department/year/section
  const getAvailableFaculty = () => {
    if (category === 'Faculty' && department && year && section) {
      return facultyData[department]?.[year]?.[section] || []
    }
    return []
  }
  
  // Get available labs for selected department
  const getAvailableLabs = () => {
    if (category === 'Labs' && department) {
      return labData[department] || []
    }
    return []
  }
  
  // Get available buses for selected route
  const getAvailableBuses = () => {
    const routeObj = busRoutes.find(r => r.route === route)
    return routeObj?.buses || []
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    
    try {
      const feedbackData = {
        student_name: 'Anonymous',
        hall_ticket: 'Anonymous',
        department: department || 'General',
        year: Number(year) || 1,
        section: section || 'A',
        faculty_name: facultyName || category || 'General',
        subject: subject || category || 'General',
        category,
        rating,
        emotion: 'Neutral',
        feedback_message: feedbackMessage,
      }
      
      await api.submitFeedback(feedbackData)
      setStatus('✓ Feedback submitted successfully!')
      
      // Reset form
      setCategory('')
      setFeedbackMessage('')
      setRating(5)
      setIsAnonymous(false)
      
      setTimeout(() => setStatus(''), 5000)
    } catch (error) {
      const message = error?.message || 'Failed to submit feedback.'
      setStatus(`✗ Error submitting feedback: ${message}`)
      setErrorDetails(message)
      console.error('Feedback submit error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const ratingOptions = [1, 2, 3, 4, 5]
  
  return (
    <div className="feedback-form glass neon">
      <form onSubmit={handleSubmit} className="panel feedback-panel">
        {/* Header */}
        <div className="section-head">
          <h3>📝 Submit Your Feedback</h3>
          <p>Help us improve by sharing your valuable feedback</p>
        </div>
        
        {/* Category Selection */}
        <div className="form-grid full-width">
          <label>
            Feedback Category *
            <select value={category} onChange={(e) => {
              setCategory(e.target.value)
              setDepartment('')
              setYear('')
              setSection('')
              setFacultyName('')
            }} required>
              <option value="">Select Category...</option>
              <option value="Faculty">🏫 Faculty</option>
              <option value="Labs">🔬 Labs</option>
              <option value="Hostel">🏠 Hostel</option>
              <option value="Transport">🚌 Transport</option>
              <option value="Library">📚 Library</option>
              <option value="Infrastructure">🏗️ Infrastructure</option>
            </select>
          </label>
        </div>
        
        {/* FACULTY FEEDBACK */}
        {category === 'Faculty' && (
          <div className="grid-2">
            <label>
              Department *
              <select value={department} onChange={(e) => {
                setDepartment(e.target.value)
                setYear('')
                setSection('')
                setFacultyName('')
              }} required>
                <option value="">Select Department...</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </label>
            
            <label>
              Year *
              <select value={year} onChange={(e) => {
                setYear(e.target.value)
                setSection('')
                setFacultyName('')
              }} required>
                <option value="">Select Year...</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
            
            <label>
              Section *
              <select value={section} onChange={(e) => {
                setSection(e.target.value)
                setFacultyName('')
              }} required>
                <option value="">Select Section...</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </label>
            
            <label>
              Faculty Name *
              <select value={facultyName} onChange={(e) => {
                const fac = getAvailableFaculty().find(f => f.name === e.target.value)
                setFacultyName(e.target.value)
                setSubject(fac?.subject || '')
              }} required>
                <option value="">Select Faculty...</option>
                {getAvailableFaculty().map(fac => (
                  <option key={fac.name} value={fac.name}>
                    {fac.name} - {fac.subject}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* FACULTY ADDITIONAL FIELDS */}
        {category === 'Faculty' && facultyName && (
          <div className="grid-2">
            <label>
              Subject
              <input type="text" value={subject} readOnly />
            </label>
            <label>
              Teaching Quality (1-5)
              <select value={teachingQuality} onChange={(e) => setTeachingQuality(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            <label>
              Faculty Behavior (1-5)
              <select value={behavior} onChange={(e) => setBehavior(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            <label>
              Communication (1-5)
              <select value={communication} onChange={(e) => setCommunication(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* LAB FEEDBACK */}
        {category === 'Labs' && (
          <div className="grid-2">
            <label>
              Department *
              <select value={department} onChange={(e) => {
                setDepartment(e.target.value)
                setLabName('')
              }} required>
                <option value="">Select Department...</option>
                {Object.keys(labData).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </label>
            
            <label>
              Lab Name *
              <select value={labName} onChange={(e) => setLabName(e.target.value)} required>
                <option value="">Select Lab...</option>
                {getAvailableLabs().map(lab => (
                  <option key={lab} value={lab}>{lab}</option>
                ))}
              </select>
            </label>
            
            <label>
              Lab Assistant *
              <select value={labAssistant} onChange={(e) => setLabAssistant(e.target.value)} required>
                <option value="">Select Assistant...</option>
                {labAssistants[department]?.map(asst => (
                  <option key={asst} value={asst}>{asst}</option>
                )) || []}
              </select>
            </label>
            
            <label>
              Equipment Condition (1-5)
              <select value={equipmentCondition} onChange={(e) => setEquipmentCondition(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Internet/WiFi Quality (1-5)
              <select value={internetQuality} onChange={(e) => setInternetQuality(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Lab Cleanliness (1-5)
              <select value={cleanliness} onChange={(e) => setCleanliness(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* HOSTEL FEEDBACK */}
        {category === 'Hostel' && (
          <div className="grid-2">
            <label>
              Hostel Type *
              <select value={hostelType} onChange={(e) => setHostelType(e.target.value)} required>
                <option value="">Select Type...</option>
                {hostelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            
            <label>
              Block *
              <select value={block} onChange={(e) => setBlock(e.target.value)} required>
                <option value="">Select Block...</option>
                {hostelBlocks.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
            
            <label>
              Food Quality (1-5)
              <select value={foodQuality} onChange={(e) => setFoodQuality(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Water Facility (1-5)
              <select value={waterFacility} onChange={(e) => setWaterFacility(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Room Cleanliness (1-5)
              <select value={roomCleanliness} onChange={(e) => setRoomCleanliness(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Washroom Maintenance (1-5)
              <select value={washroom} onChange={(e) => setWashroom(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Warden Behavior (1-5)
              <select value={warden} onChange={(e) => setWarden(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Security (1-5)
              <select value={security} onChange={(e) => setSecurity(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              WiFi Facility (1-5)
              <select value={wifi} onChange={(e) => setWifi(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* TRANSPORT FEEDBACK */}
        {category === 'Transport' && (
          <div className="grid-2">
            <label>
              Route *
              <select value={route} onChange={(e) => {
                setRoute(e.target.value)
                setBusNumber('')
              }} required>
                <option value="">Select Route...</option>
                {busRoutes.map(r => (
                  <option key={r.route} value={r.route}>{r.route}</option>
                ))}
              </select>
            </label>
            
            <label>
              Bus Number *
              <select value={busNumber} onChange={(e) => setBusNumber(e.target.value)} required>
                <option value="">Select Bus...</option>
                {getAvailableBuses().map(bus => (
                  <option key={bus} value={bus}>{bus}</option>
                ))}
              </select>
            </label>
            
            <label>
              Driver Name *
              <select value={driverName} onChange={(e) => setDriverName(e.target.value)} required>
                <option value="">Select Driver...</option>
                {busDrivers.map(driver => (
                  <option key={driver} value={driver}>{driver}</option>
                ))}
              </select>
            </label>
            
            <label>
              Driver Behavior (1-5)
              <select value={driverBehavior} onChange={(e) => setDriverBehavior(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Driving Safety (1-5)
              <select value={safetyConcern} onChange={(e) => setSafetyConcern(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Bus Cleanliness (1-5)
              <select value={busCleanliness} onChange={(e) => setBusCleanliness(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Timing Punctuality (1-5)
              <select value={punctuality} onChange={(e) => setPunctuality(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Seating Comfort (1-5)
              <select value={seating} onChange={(e) => setSeating(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* LIBRARY FEEDBACK */}
        {category === 'Library' && (
          <div className="grid-2">
            <label>
              Library Section *
              <select value={libSection} onChange={(e) => setLibSection(e.target.value)} required>
                <option value="">Select Section...</option>
                {librarySections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </label>
            
            <label>
              Book Availability (1-5)
              <select value={bookAvailability} onChange={(e) => setBookAvailability(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Environment (1-5)
              <select value={environment} onChange={(e) => setEnvironment(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Silence/Discipline (1-5)
              <select value={silence} onChange={(e) => setSilence(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Librarian Behavior (1-5)
              <select value={librarianBehavior} onChange={(e) => setLibrarianBehavior(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Seating Arrangement (1-5)
              <select value={seatingArrangement} onChange={(e) => setSeatingArrangement(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Internet Facility (1-5)
              <select value={libWifi} onChange={(e) => setLibWifi(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* INFRASTRUCTURE FEEDBACK */}
        {category === 'Infrastructure' && (
          <div className="grid-2">
            <label>
              Infrastructure Area *
              <select value={infraArea} onChange={(e) => setInfraArea(e.target.value)} required>
                <option value="">Select Area...</option>
                {infrastructureAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            
            <label>
              Maintenance Quality (1-5)
              <select value={maintenance} onChange={(e) => setMaintenance(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Cleanliness (1-5)
              <select value={infraCleanliness} onChange={(e) => setInfraCleanliness(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Safety (1-5)
              <select value={safety} onChange={(e) => setSafety(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
            
            <label>
              Accessibility (1-5)
              <select value={accessibility} onChange={(e) => setAccessibility(Number(e.target.value))}>
                {ratingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} {'⭐'.repeat(opt)}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* COMMON FIELDS */}
        {category && (
          <>
            <div className="grid-2">
              <label>
                Overall Rating *
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
                  {ratingOptions.map(opt => (
                    <option key={opt} value={opt}>{opt} ⭐</option>
                  ))}
                </select>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span>Submit Anonymously</span>
              </label>
            </div>
            
            <label className="full-width">
              Feedback Message *
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Share your detailed feedback and suggestions..."
                required
              />
            </label>
            
            <div className="form-footer">
              {status && (
                <div className={`form-status ${status.includes('Error') || status.includes('✗') ? 'error' : 'success'}`}>
                  {status}
                  {errorDetails && <div className="error-details">{errorDetails}</div>}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !category || !feedbackMessage}
                className="primary-btn"
                style={{ opacity: loading || !category || !feedbackMessage ? 0.5 : 1 }}
              >
                {loading ? 'Submitting...' : '✓ Submit Feedback'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
