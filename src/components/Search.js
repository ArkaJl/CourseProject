async function Search({query}) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=geojson&addressdetails=1&layer=address&limit=5`);

    return await response.json();
}
export default Search;
