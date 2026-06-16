import '../styles/Card.css';
import { SearchInput } from './SearchInput';

export function Card() {
  return (
    <div className="card">
        <p style={{position: 'absolute', top: '-28px', left: '10px', fontWeight: 600}}>🔒 Note Vault</p>
        <SearchInput></SearchInput>
    </div>
  )
}
