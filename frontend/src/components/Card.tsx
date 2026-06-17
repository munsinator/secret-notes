import '../styles/Card.css';
import { Input } from './Input';

export function Card({ title }: { title: string }){
  return (
    <>
    <div className="card">  
      <p style={{position: 'absolute', top: '-28px', left: '10px', fontWeight: 600}}>{title}</p>
      <Input></Input>
      </div>
    </>
  )
}