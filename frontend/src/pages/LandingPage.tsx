import { useState } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import '../styles/LandingPage.css';
import { Modal } from '../components/Modal';

export function LandingPage() {
    const [showModal, setShowModal] = useState(false);

    function onAddNote() {
        setShowModal(true);
    }

    return (
        <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1em'}}>  
            <Card title="🔒 Note Vault">
                <Input text="Enter the link to access your notes ..."></Input>
            </Card>
            <button title="Add note" className='add-note-btn' onClick={onAddNote}>+</button>
        

        {   showModal && (
            <Modal onClose={() => setShowModal(false)}/>
        )}
        </section>
    )
}