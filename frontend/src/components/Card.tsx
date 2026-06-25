import '../styles/Card.css';

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
    <div className="card">  
      <p style={{position: 'absolute', top: '-28px', left: '10px', fontWeight: 600}}>{title}</p>
      {children}
      </div>
    </>
  )
}