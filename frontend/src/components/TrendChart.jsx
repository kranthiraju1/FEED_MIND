import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

export default function TrendChart({ aggregate }) {
  const series = aggregate?.series ?? []

  return (
    <section className="panel chart-panel glass neon">
      <div className="section-head">
        <h3>Sentiment Trend</h3>
        <p>Rolling hourly sentiment movement from live feedback ingestion.</p>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(8, 15, 28, 0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                color: '#e5eefb',
                boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Line type="monotone" dataKey="positive" stroke="#5eead4" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="negative" stroke="#f472b6" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="neutral" stroke="#c084fc" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
