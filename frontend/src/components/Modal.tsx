import { useState } from "react";
import "../styles/Modal.css";
import { Input } from "./Input";

type ModalProps = {
    noteText?: string;
    onClose: () => void;
};

export function Modal({ noteText, onClose }: ModalProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <button className="modal-close-btn" onClick={onClose}>×</button>

                <div className={`note-content ${isUnlocked ? "unlocked" : ""}`}>
                    {noteText || "This note is empty."}
                </div>

                {!isUnlocked && (
                    <Input text="Enter the decryption key ..." onClick={() => setIsUnlocked(true)} />
                )}
            </div>
        </div>
    );
}