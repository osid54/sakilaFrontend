import { useState, useEffect } from 'react';
import axios from 'axios';
import "./Styles.css";

function Cust() {
    const [customers, setCust] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [searchFilter, setSearchFilter] = useState('FIRST');
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage, setCustomersPerPage] = useState(10);

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
            <ManageButton />
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

const ManageButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [customerID, setCustomerID] = useState("");
    const [customerData, setCustomerData] = useState({ first_name: "", last_name: "", email: "" });
    const [message, setMessage] = useState("");
    const [custExists, setCustExists] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const toggleOverlay = () => {
        setIsOpen(!isOpen);
        resetForm();
    };

    const resetForm = () => {
        setCustomerID("");
        setCustomerData({ first_name: "", last_name: "", email: "" });
        setMessage("");
        setCustExists(false);
        setIsAdding(false);
    };

    const handleSearchCustomer = () => {
        if (!customerID || isNaN(customerID)) {
            setMessage("Please enter a valid customer ID.");
            return;
        }

        axios.get(`http://localhost:5000/customers/${customerID}`)
            .then(response => {
                if (response.data && !response.data.error) {
                    setCustExists(true);
                    setIsAdding(false);
                    setCustomerData({
                        first_name: response.data.FIRST,
                        last_name: response.data.LAST,
                        email: response.data.EMAIL,
                    });
                    setMessage("Customer found.");
                } else {
                    setMessage("No customer found.");
                    setCustExists(false);
                }
            })
            .catch(() => {
                setMessage("Error fetching customer.");
                setCustExists(false);
            });
    };

    const handleAddCustomerClick = () => {
        resetForm();
        setIsAdding(true);
        setMessage("Enter details to add a new customer.");
    };

    const handleEditCustomer = () => {
        if (!customerData.first_name || !customerData.last_name || !customerData.email) {
            setMessage("Please fill in all fields.");
            return;
        }

        if (custExists) {
            axios.patch(`http://localhost:5000/customers/${customerID}`, customerData)
                .then(() => setMessage("Customer updated successfully."))
                .catch(() => setMessage("Failed to update customer."));
        } else if (isAdding) {
            axios.post(`http://localhost:5000/customers`, customerData)
                .then(() => {
                    resetForm();
                    setMessage("Customer added successfully.");
                })
                .catch(() => setMessage("Failed to add customer."));
        }
    };

    const handleDeleteCustomer = () => {
        if (!customerID) return;
        axios.delete(`http://localhost:5000/customers/${customerID}`)
            .then(() => {
                resetForm();
                setMessage("Customer deleted successfully.");
            })
            .catch(() => setMessage("Error deleting customer."));
    };

    return (
        <>
            <button className="floating-btn" onClick={toggleOverlay}>
                Manage Customers
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Manage Customers</h2>

                        <input
                            type="text"
                            placeholder="Enter Customer ID"
                            value={customerID}
                            onChange={(e) => setCustomerID(e.target.value)}
                        />
                        <button onClick={handleSearchCustomer}>Search</button>
                        <button onClick={handleAddCustomerClick}>Add</button>

                        <div>
                            {message && <>{message}</>}
                        </div>

                        {(custExists || isAdding) && (
                            <>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={customerData.first_name}
                                        onChange={(e) => setCustomerData({ ...customerData, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={customerData.last_name}
                                        onChange={(e) => setCustomerData({ ...customerData, last_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={customerData.email}
                                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                    />
                                </div>
                                <button onClick={handleEditCustomer}>
                                    {custExists ? "Update" : "Save"}
                                </button>
                                {custExists && <button onClick={handleDeleteCustomer}>Delete</button>}
                                <ManageRentals customerID={customerID} />
                            </>
                        )}

                        <div>
                            <button onClick={toggleOverlay}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ManageRentals = ({ customerID }) => {
    const [isRentalPopupOpen, setIsRentalPopupOpen] = useState(false);
    const [rentalHistory, setRentalHistory] = useState([]);

    const toggleRentalPopup = () => {
        setIsRentalPopupOpen(!isRentalPopupOpen);
        if (!isRentalPopupOpen) {
            fetchRentalHistory();
        }
    };

    const fetchRentalHistory = () => {
        if (!customerID) return;
        axios.get(`http://localhost:5000/customers/${customerID}/rentals`)
            .then(response => {
                setRentalHistory(response.data);
            })
            .catch(() => {
                setRentalHistory([]);
            });
    };

    const handleReturnRental = (rentalId) => {
        axios.patch(`http://localhost:5000/rentals/${rentalId}/return`)
            .then(() => {
                fetchRentalHistory();
            })
            .catch(() => {
                alert("Error marking rental as returned.");
            });
    };

    return (
        <>
            <button onClick={toggleRentalPopup}>Rentals</button>

            {isRentalPopupOpen && (
                <div className="modal-overlay">
                    <div className="modalRent">
                        <h2>Rental History</h2>
                        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ position: "sticky", top: "0", zIndex: "2" }}>
                                    <tr>
                                        <th>Rental ID</th>
                                        <th>Rental Date</th>
                                        <th>Return Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentalHistory.map((rental) => (
                                        <tr key={rental.rental_id}>
                                            <td>{rental.rental_id}</td>
                                            <td>{rental.rental_date}</td>
                                            <td>
                                                {rental.return_date || (
                                                    <button onClick={() => handleReturnRental(rental.rental_id)}>
                                                        Mark as Returned
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={toggleRentalPopup}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};



export default Cust;
