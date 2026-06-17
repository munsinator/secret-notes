import '../styles/SearchInput.css';

export function SearchInput(){
    return (
        <div className="search">
            <input className='link-input' type="text" placeholder="Enter the link to access your notes ..."></input>
            <button className='submit'>➤</button>
        </div>
        
    )
}