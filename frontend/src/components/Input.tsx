import '../styles/Input.css';

export function Input({ text, onClick, className }: { text: string; onClick?: () => void; className?: string }) {
    return (
        <div className="input-container">
            <input className={`${className} link-input`} type="text" placeholder={text}></input>
            <button className='submit' onClick={onClick}>➤</button>
        </div>
        
    )
}