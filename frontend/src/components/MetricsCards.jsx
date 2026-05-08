const cards = [
  { key: 'total', label: 'Total Feedback' },
  { key: 'positive', label: 'Positive' },
  { key: 'negative', label: 'Negative' },
  { key: 'neutral', label: 'Neutral' },
]

export default function MetricsCards({ summary }) {
  return (
    <section className="metrics-grid">
      {cards.map((card) => (
        <article key={card.key} className="metric-card glass">
          <span>{card.label}</span>
          <strong>{summary?.[card.key] ?? 0}</strong>
        </article>
      ))}
    </section>
  )
}
