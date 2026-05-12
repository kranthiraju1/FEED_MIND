export default function LiveFeed({ feedbacks }) {
  return (
    <section className="panel live-feed-panel glass neon">
      <div className="section-head">
        <h3>Recent Feedback Feed</h3>
        <p>Latest student comments with sentiment and faculty context.</p>
      </div>
      <div className="feed-list">
        {feedbacks.length === 0 ? (
          <div className="empty-state">No feedback yet. Add a submission to light up the stream.</div>
        ) : (
          feedbacks.map((item) => (
            <article className="feed-item glass" key={item.feedback_id}>
              <div className="feed-row">
                <strong>{item.student_name}</strong>
                <span>{item.department} • {item.section} • {item.faculty_name}</span>
              </div>
              <div className="feed-labels">
                <span className="pill light">{item.subject}</span>
                <span className="pill light">Reported {item.reported_emotion || 'Neutral'}</span>
              </div>
              <p>{item.feedback_message}</p>
              <div className="feed-meta">
                <span className={`sentiment ${item.sentiment_label ?? 'neutral'}`}>{item.sentiment_label ?? 'pending'}</span>
                <span>{item.emotion ?? 'pending'}</span>
                <span>Rating {item.rating}/5</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
