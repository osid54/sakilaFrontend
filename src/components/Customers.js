import { useState, useEffect } from 'react';
import axios from 'axios';
import "./Styles.css";

function Cust() {
    const [customers, setCust] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [searchFilter, setSearchFilter] = useState('FIRST');
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage, setCustomersPerPage] = useState(10); // Default to 10

    useEffect(() => {
        axios.get('http://localhost:5000/customers')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setCust(response.data);
                } else {
                    console.error("Expected an array but got:", response.data);
                }
            })
            .catch(error => {
                console.error("There was an error fetching customers:", error);
            });
    }, []);

    const filteredCust = customers.filter((cust) => {
        if (!cust[searchFilter]) return false;

        if (searchFilter === "ID") {
            return cust.ID.toString().includes(filterText);
        }

        return cust[searchFilter].toString().toLowerCase().includes(filterText.toLowerCase());
    });

    const indexOfLastCust = currentPage * customersPerPage;
    const indexOfFirstCust = indexOfLastCust - customersPerPage;
    const currentCustomers = filteredCust.slice(indexOfFirstCust, indexOfLastCust);
    const totalPages = Math.ceil(filteredCust.length / customersPerPage);

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
                    customersPerPage={customersPerPage}
                    setCustomersPerPage={setCustomersPerPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
            <CustTable customers={currentCustomers} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
function SearchBar({ filterText, searchFilter, onFilterTextChange, onSearchFilterChange, setCurrentPage }) {
    return (
        <form>
            <input
                type="text"
                value={filterText}
                placeholder={`Search customers...`}
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
                <option value="FIRST">First Name</option>
                <option value="LAST">Last Name</option>
                <option value="EMAIL">Email</option>
            </select>
        </form>
    );
}
function PaginationControls({ customersPerPage, setCustomersPerPage, setCurrentPage }) {
    return (
        <div>
            <label> Customers per page: </label>
            <select
                value={customersPerPage}
                onChange={(e) => {
                    setCustomersPerPage(Number(e.target.value));
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
function CustTable({ customers }) {
    return (
        <table border="1" cellSpacing="0" cellPadding="10">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((cust) => (
                    <CustRow cust={cust} key={cust.ID} />
                ))}
            </tbody>
        </table>
    );
}
function CustRow({ cust }) {
    return (
        <tr>
            <td>{cust.ID}</td>
            <td>{cust.FIRST}</td>
            <td>{cust.LAST}</td>
            <td>{cust.EMAIL}</td>
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



export default Cust;
