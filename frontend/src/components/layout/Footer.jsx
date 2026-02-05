"use client";
import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t py-8 mt-auto" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
            <div className="max-w-7xl mx-auto px-4 text-center opacity-70">
                <p>&copy; {new Date().getFullYear()} Taskey. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
