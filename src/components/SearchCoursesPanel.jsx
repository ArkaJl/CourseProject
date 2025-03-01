import {useState} from "react";
import Search from "./Search.js";

function SearchCoursesPanel() {
    const [term, setTerm] = useState('');

    const handleSubmitSearch = (evt) =>{
        evt.preventDefault();
        console.log(term);
        console.log(Search(term));
    }

    return <div>
        <form onSubmit={handleSubmitSearch}>
            <h2>Searching: </h2>
            <input type="text" id="searchInput" onChange={(e) => {
                setTerm(e.target.value)
            }}/>
            <button type="submit">Search</button>
        </form>
    </div>

}

export default SearchCoursesPanel;
