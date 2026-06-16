import '../styles/SearchInput.css';

export function SearchInput(){
    return (
        <div className="search">
            <input type="text" placeholder="Enter the link to access your notes ..." style={{height: '2em', width: '90%', borderRadius:'5px'}}></input>
            <button style={{backgroundColor:'#1F845A' , color: 'white', borderRadius: '5px'}}>➤</button>
        </div>
        
    )
}