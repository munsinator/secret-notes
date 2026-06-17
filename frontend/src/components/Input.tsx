import '../styles/Input.css';

function submitLink(){
    console.log("Link submitted");  
}

export function Input(){
    return (
        <div className="input-container">
            <input className='link-input' type="text" placeholder="Enter the link to access your notes ..."></input>
            <button className='submit' onClick={submitLink}>➤</button>
        </div>
        
    )
}