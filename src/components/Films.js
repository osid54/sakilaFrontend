import { useState, useEffect } from 'react';
import axios from 'axios';
import "./Styles.css";

function Films() {
    const [films, setFilms] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [searchFilter, setSearchFilter] = useState('TITLE');
    const [currentPage, setCurrentPage] = useState(1);
    const [filmsPerPage, setFilmsPerPage] = useState(10);

    useEffect(() => {
        axios.get('http://localhost:5000/films')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setFilms(response.data);
                } else {
                    console.error("Expected an array but got:", response.data);
                }
            })
            .catch(error => {
                console.error("There was an error fetching films:", error);
            });
    }, []);

    const filteredFilms = films.filter((film) => {
        if (!film[searchFilter]) return false;

        if (searchFilter === "ID") {
            return film.ID.toString().includes(filterText);
        }

        return film[searchFilter].toString().toLowerCase().includes(filterText.toLowerCase());
    });

    const indexOfLastFilm = currentPage * filmsPerPage;
    const indexOfFirstFilm = indexOfLastFilm - filmsPerPage;
    const currentFilms = filteredFilms.slice(indexOfFirstFilm, indexOfLastFilm);
    const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);

    return (
        <div>
            <div className="extras-container">
                <SearchBar
                    filterText={filterText}
                    searchFilter={searchFilter}
                    onFilterTextChange={setFilterText}
                    onSearchFilterChange={setSearchFilter}
                    setCurrentPage={setCurrentPage}
                />
                <PaginationControls
                    filmsPerPage={filmsPerPage}
                    setFilmsPerPage={setFilmsPerPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
            <FilmTable films={currentFilms} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <RentButton/>
        </div>
    );
}
function SearchBar({ filterText, searchFilter, onFilterTextChange, onSearchFilterChange, setCurrentPage }) {
    return (
            <form>
                <input
                    type="text"
                    value={filterText}
                    placeholder={`Search films...`}
                    onChange={(e) => {
                        onFilterTextChange(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                {" Filter by: "}
                <select onChange={(e) => {
                    onSearchFilterChange(e.target.value);
                    setCurrentPage(1);
                }} value={searchFilter}>
                    <option value="ID">ID</option>
                    <option value="TITLE">Title</option>
                    <option value="GENRE">Genre</option>
                    <option value="DESC">Description</option>
                    <option value="ACTORS">Actor</option>
                </select>
            </form>
    );
}
function PaginationControls({ filmsPerPage, setFilmsPerPage, setCurrentPage }) {
    return (
            <div>
                <label> Films per page: </label>
                <select
                value={filmsPerPage}
                    onChange={(e) => {
                        setFilmsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
    );
}
function FilmTable({ films }) {
    return (
        <table border="1" cellSpacing="0" cellPadding="10">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Length</th>
                    <th>Rating</th>
                    <th>Actors</th>
                </tr>
            </thead>
            <tbody>
                {films.map((film) => (
                    <FilmRow film={film} key={film.ID} />
                ))}
            </tbody>
        </table>
    );
}
function FilmRow({ film }) {
    return (
        <tr>
            <td>{film.ID}</td>
            <td>{film.TITLE}</td>
            <td>{film.GENRE}</td>
            <td>{film.DESC}</td>
            <td>{film.PRICE}</td>
            <td>{film.LENGTH}</td>
            <td>{film.RATING}</td>
            <td>{film.ACTORS}</td>
        </tr>
    );
}
function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="extras-container">
            <div>
                <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                    Prev
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

const RentButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [filmID, setFilmID] = useState("");
    const [customerID, setCustomerID] = useState("");
    const [message, setMessage] = useState("");

    const toggleOverlay = () => {
        setIsOpen(!isOpen);
        resetForm();
    };

    const resetForm = () => {
        setFilmID("");
        setCustomerID("");
        setMessage("");
    };

    const handleRentFilm = () => {
        if (!filmID || !customerID) {
            setMessage("Please enter both Film ID and Customer ID.");
            return;
        }

        axios.post("http://localhost:5000/rent", { film_id: filmID, customer_id: customerID })
            .then(response => setMessage(response.data.message))
            .catch(error => {
                if (error.response) {
                    setMessage(error.response.data.error);
                } else {
                    setMessage("Failed to process rental.");
                }
            });
    };


    return (
        <>
            <button className="floating-btn" onClick={toggleOverlay}>
                Rent a Film
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Rent a Film</h2>

                        <div>
                            <input
                                type="number"
                                placeholder="Enter Film ID"
                                value={filmID}
                                onChange={(e) => setFilmID(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                placeholder="Enter Customer ID"
                                value={customerID}
                                onChange={(e) => setCustomerID(e.target.value)}
                            />
                        </div>
                        {message && <p>{message}</p>}
                        <div>
                            <button onClick={handleRentFilm}>Confirm Rental</button>
                        </div>
                        <button onClick={toggleOverlay}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Films;
