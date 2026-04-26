import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuditHistory, getAuditDetails } from '../api';
import { Calendar, FileText, ChevronRight, Loader2, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getAuditHistory();
                setAudits(data.audits);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleRowClick = async (id) => {
        try {
            const audit = await getAuditDetails(id);
            navigate('/results', { state: { audit } });
        } catch (error) {
            alert("Error loading audit details");
        }
    };

    const severityStyles = {
        CRITICAL: 'bg-red-100 text-red-700',
        HIGH: 'bg-orange-100 text-orange-700',
        MEDIUM: 'bg-yellow-100 text-yellow-700',
        LOW: 'bg-green-100 text-green-700',
    };

    return (
        <div className="pt-24 min-h-screen bg-gray-50 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold font-outfit">Audit History</h2>
                        <p className="text-gray-500 mt-1">Review your past datasets and bias reports.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/upload')}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <span>New Audit</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-indigo animate-spin mb-4" />
                        <span className="text-gray-500 font-medium">Loading history...</span>
                    </div>
                ) : audits.length === 0 ? (
                    <div className="card text-center py-20 bg-white border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart2 className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold font-outfit text-gray-900">No audits yet</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Start your first bias audit to see your history here.</p>
                        <button 
                            onClick={() => navigate('/upload')}
                            className="mt-6 text-indigo font-bold hover:underline"
                        >
                            Start your first audit →
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">File</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Records</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                                        <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {audits.map((audit) => (
                                        <motion.tr 
                                            key={audit.audit_id}
                                            whileHover={{ backgroundColor: '#f9fafb' }}
                                            onClick={() => handleRowClick(audit.audit_id)}
                                            className="cursor-pointer group"
                                        >
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="bg-indigo-50 p-2 rounded-lg mr-4 group-hover:bg-indigo-100 transition-colors">
                                                        <FileText className="w-5 h-5 text-indigo" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{audit.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {new Date(audit.timestamp).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-700">{audit.total_records}</span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${severityStyles[audit.severity]}`}>
                                                    {audit.severity}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right whitespace-nowrap">
                                                <ChevronRight className="w-5 h-5 text-gray-300 inline group-hover:text-indigo group-hover:translate-x-1 transition-all" />
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
