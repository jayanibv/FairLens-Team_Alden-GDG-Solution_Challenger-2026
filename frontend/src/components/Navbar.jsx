import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Plus } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 border-b border-gray-100">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="bg-indigo p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold font-outfit text-gray-900">
                        Fair<span className="text-indigo">Lens</span>
                    </span>
                </Link>
                
                <div className="flex items-center space-x-6">
                    <Link to="/history" className="text-gray-600 hover:text-indigo font-medium transition-colors">
                        Audit History
                    </Link>
                    <button 
                        onClick={() => navigate('/upload')}
                        className="btn-primary flex items-center space-x-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Audit</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
