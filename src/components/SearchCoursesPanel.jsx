import {useState} from "react";
import SearchPage from "./searchPage.jsx";

function SearchCoursesPanel() {
    const [term, setTerm] = useState('');

    const handleSubmitSearch = (evt) =>{
        evt.preventDefault();
        console.log(term);
        console.log(SearchPage(term));
    }

    return <div>
        <form onSubmit={handleSubmitSearch} className="card ">
            <h2>Поиск курсов</h2>
            <input type="text" id="searchInput" onChange={(e) => {
                setTerm(e.target.value)
            }}/>
            <button className="button" type="submit">🎶 Поиск! 🎶</button>
        </form>
    </div>

}

export default SearchCoursesPanel;
