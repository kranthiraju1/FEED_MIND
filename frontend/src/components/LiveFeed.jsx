export default function LiveFeed({ feedbacks }) {
  return (
    <section className="panel live-feed-panel glass">
      <div className="section-head">
        <h3>Recent Feedback Feed</h3>
        <p>Latest student submissions with inferred sentiment and emotion.</p>
      </div>
      <div className="feed-list">
        {feedbacks.length === 0 ? (
          <div className="empty-state">No feedback yet. Submit a review to populate the feed.</div>
        ) : (
          feedbacks.map((item) => (
            <article className="feed-item glass" key={item.feedback_id}>
              <div className="feed-row">
                <strong>{item.student_name}</strong>
                <span>{item.department} • Year {item.year}</span>
              </div>
              <p>{item.feedback_message}</p>
              <div className="feed-meta">
                <span className={`sentiment ${item.sentiment_label ?? 'neutral'}`}>{item.sentiment_label ?? 'pending'}</span>
                <span>{item.emotion ?? 'neutral'}</span>
                <span>Rating {item.rating}/5</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
