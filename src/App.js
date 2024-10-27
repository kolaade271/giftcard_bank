// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BankForm from './BankForm';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:code" element={<BankForm />} />
            </Routes>
        </Router>
    );
};

export default App;
