import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BankForm = () => {
    const { code } = useParams(); // Get the code from the URL
    const [selectedBank, setSelectedBank] = useState('');
    const [accountInfo, setAccountInfo] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isLinkValid, setIsLinkValid] = useState(true);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingbank, setLoadingBank] = useState(true); // Loading state for bank list

    // Fetch bank list once on initial load
    useEffect(() => {
        const validateLink = async () => {
            try {
                const res = await fetch('http://localhost:9100/api/banks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: code, mycode: "yea" }),
                });

                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await res.json();
                if (data.status) {

                    setBanks(data.data.bank_list); // Store bank list
                    setIsLinkValid(true);
                } else {
                    setIsLinkValid(false);
                    setErrorMessage('Invalid link');
                }
            } catch (error) {
                console.error('Error:', error);
                setErrorMessage('Failed to fetch bank list. Please try again later.');
                setIsLinkValid(false);
            } finally {
                setLoading(false); // Set loading to false after fetch
            }
        };

        validateLink();
    }, []);

    useEffect(() => {
        const validateBankAccount = async () => {
            if (selectedBank && accountInfo.length === 10) {
                console.log(selectedBank.name)
                try {
                    const res = await fetch('http://localhost:9100/api/bank_validate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ bank: selectedBank.code, name:selectedBank.name, accountnumber: accountInfo, code:code }),
                    });
                    

                    const data = await res.json();

                    if (data.status) {
                        setSuccessMessage(data.data.account_name || 'Validation successful.');
                        setIsValid(true);
                        setLoadingBank(false)
                    } else {
                        setIsValid(false);
                        setErrorMessage(data.message || 'Validation failed. Please check your input.');
                        setSuccessMessage(false);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    setErrorMessage('An error occurred while validating.');
                }
            }
        };

        if (accountInfo.length === 10) {
            validateBankAccount();
        }
    }, [accountInfo, selectedBank]); // Run only when accountInfo or selectedBank changes

    // Handle submit function to send data to /submit_bank
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoadingBank(true)
            const res = await fetch('http://localhost:9100/api/submit_bank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code, bank: selectedBank, accountnumber: accountInfo }),
            });

            const data = await res.json();

            if (data.status) {
                setLoadingBank(true)
                alert('Submission successful!');
                setTimeout(() => {
                    window.close();
                    if (!window.closed) {
                        alert('Please close this window to return to your previous task.');
                        window.close(); // Attempt to close the window
                    }
                }, 3000);
            } else {
                setLoadingBank(false)
                alert('Submission failed: ' + (data.message || 'Please try again.'));
            }
        } catch (error) {
            setLoadingBank(false)
            console.error('Error:', error);
            alert('An error occurred during submission. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100">
                <div className="alert alert-info">Loading banks, please wait...</div>
            </div>
        );
    }

    if (!isLinkValid) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100">
                <div className="alert alert-danger">Invalid link</div>
            </div>
        );
    }

    return (
        <div
            className="d-flex align-items-center bank-form-background justify-content-center vh-100"
            style={{
                backgroundImage: `url('https://ik.imagekit.io/f4tqegkse/logo/banker.jpg?updatedAt=1730033863936')`, // Replace with your image URL
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="card" style={{ width: '25rem', maxHeight: '90vh', overflow: 'auto' }}>
                <div className="card-body">
                    <h5 className="card-title">Bank Validation</h5>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="bank-select">Select your bank:</label>
                            <select
                                className="form-control"
                                id="bank-select"
                                value={selectedBank.code || ''} // adjust to maintain controlled input
                                onChange={(e) => {
                                    const selectedBankData = JSON.parse(e.target.options[e.target.selectedIndex].dataset.bank);
                                    setSelectedBank(selectedBankData); // set full bank object in state
                                }}
                                required
                            >
                                <option value="">--Select Bank--</option>
                                {banks.map(bank => (
                                    <option key={bank.code} value={bank.code} data-bank={JSON.stringify(bank)}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>

                        </div>
                        <div className="form-group">
                            <label htmlFor="account-info">Account Info:</label>
                            <input
                                type="number"
                                className="form-control"
                                id="account-info"
                                value={accountInfo}
                                onChange={(e) => setAccountInfo(e.target.value)}
                                minLength={10}
                                required
                            />
                        </div>
                        {successMessage && (
                            <div>
                                <div className="alert alert-success">{successMessage}</div>
                                <button type="submit" className="btn btn-primary" disabled={loadingbank}>Submit</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BankForm;
