import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Styles.css";

const Landing = () => {
    const [films5, setFilms5Data] = useState([]);
    const [actors5, setActors5Data] = useState([]);
    const [actorFilms, setActorFilms] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedType, setSelectedType] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/top5films")
            .then(response => {
                setFilms5Data(response.data);
                return axios.get("http://localhost:5000/top5actors");
            })
            .then(response => {
                setActors5Data(response.data);
            })
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    const handleRowClick = (data, type) => {
        setSelectedRow(data);
        setSelectedType(type);
        if (type === "actor") {
            setActorFilms([]);
            axios.get(`http://localhost:5000/actor5films?id=${data.ID}`)
                .then(response => {
                    setActorFilms(response.data);
                })
                .catch(error => console.error("Error fetching data:", error));
        }
    };

    const closePopup = () => {
        setSelectedRow(null);
        setSelectedType("");
    };

    return (
        <div className="landing-container">
            <h1>Welcome to Sakila Films</h1>

            <div className="tables-container">
                <div className="table-box">
                    <h2>Top 5 Films</h2>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Film Title</th>
                                <th># Rentals</th>
                            </tr>
                        </thead>
                        <tbody>
                            {films5.map((film) => (
                                <tr key={film.ID} onClick={() => handleRowClick(film, "film")}>
                                    <td>
                                        <button>{film.TITLE}</button>
                                    </td>
                                    <td>{film.RENTALS}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-box">
                    <h2>Top 5 Actors</h2>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Actor Name</th>
                                <th># Films</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actors5.map((actor) => (
                                <tr key={actor.ID} onClick={() => handleRowClick(actor, "actor")}>
                                    <td>
                                        <button>{actor.FIRST} {actor.LAST}</button>
                                    </td>
                                    <td>{actor.FILMCOUNT}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRow && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{selectedType === "film" ? "Film Details" : "Actor Details"}</h2>

                        {selectedType === "film" && (
                            <>
                                <p><strong>Title:</strong> {selectedRow.TITLE}</p>
                                <p><strong>Description:</strong> {selectedRow.DESC}</p>
                                <p><strong>Actors:</strong> {selectedRow.ACTORS}</p>
                                <p><strong>Genre:</strong> {selectedRow.GENRE}</p>
                                <p><strong>Length:</strong> {selectedRow.LENGTH} minutes</p>
                                <p><strong>Rating:</strong> {selectedRow.RATING}</p>
                                <p><strong>Rentals:</strong> {selectedRow.RENTALS}</p>
                            </>
                        )}

                        {selectedType === "actor" && (
                            <>
                                <p><strong>First Name:</strong> {selectedRow.FIRST}</p>
                                <p><strong>Last Name:</strong> {selectedRow.LAST}</p>
                                <p><strong>Number of Films:</strong> {selectedRow.FILMCOUNT}</p>
                                <p><strong>Top 5 Rented Films:</strong> {actorFilms.map(film => Object.values(film).join(", ")).join(", ")}</p>
                            </>
                        )}

                        <button onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;
