import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const colors = ['#5eead4', '#f472b6', '#c084fc']

export default function DistributionChart({ distribution }) {
  const data = [
    { name: 'Positive', value: distribution?.positive ?? 0 },
    { name: 'Negative', value: distribution?.negative ?? 0 },
    { name: 'Neutral', value: distribution?.neutral ?? 0 },
  ]

  return (
    <section className="panel chart-panel glass neon">
      <div className="section-head">
        <h3>Sentiment Distribution</h3>
        <p>Current sentiment mix across all analyzed feedback.</p>
      </div>
      <div className="chart-wrap pie-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
