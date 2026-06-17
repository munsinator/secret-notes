import { Card } from '../components/Card';
import '../styles/LandingPage.css';

function onAddNote() {
    console.log('Add Note button clicked');
}

export function LandingPage() {
    return (
        <section>  
            <div className="add-note">
                <button className='add-note-btn' onClick={onAddNote}>+</button>
                <span style={{ fontWeight: '600' }}>Add Note</span>
            </div>   
            <Card title="🔒 Note Vault"></Card>
        </section>
    )
}