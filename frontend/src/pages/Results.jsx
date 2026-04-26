import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, AlertTriangle, FileDown, Plus, Info, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const audit = location.state?.audit;
    const reportRef = useRef();

    if (!audit) {
        return (
            <div className="pt-32 text-center">
                <h2 className="text-2xl font-bold">No audit results found.</h2>
                <button onClick={() => navigate('/upload')} className="btn-primary mt-4">Start New Audit</button>
            </div>
        );
    }

    const severityConfig = {
        CRITICAL: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-6 h-6" /> },
        HIGH: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: <AlertTriangle className="w-6 h-6" /> },
        MEDIUM: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <Info className="w-6 h-6" /> },
        LOW: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle2 className="w-6 h-6" /> },
    };

    const config = severityConfig[audit.severity] || severityConfig.LOW;

    const downloadPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`FairLens_Report_${audit.filename.split('.')[0]}.pdf`);
    };

    return (
        <div className="pt-24 min-h-screen bg-gray-50 pb-20 px-6">
            <div className="max-w-6xl mx-auto" ref={reportRef}>
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`card mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-l-8 ${config.border.replace('border-', 'border-l-')}`}
                >
                    <div className="flex items-center space-x-6">
                        <div className={`${config.bg} ${config.color} p-4 rounded-2xl`}>
                            {config.icon}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`text-xs font-bold tracking-wider px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                                    {audit.severity}
                                </span>
                                {Object.entries(audit.stats).map(([col, data]) => data.biased && (
                                    <span key={col} className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                                        {col.toUpperCase()} BIAS
                                    </span>
                                ))}
                                <span className="text-gray-300 mx-1">•</span>
                                <span className="text-xs text-gray-500">{audit.filename}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold font-outfit text-gray-900">
                                {audit.severity === 'LOW' ? 'No significant bias detected' : 'Action recommended for bias detection'}
                            </h2>
                        </div>
                    </div>
                    <div className="text-right hidden md:block mt-4 md:mt-0">
                        <div className="text-3xl font-bold text-gray-900">{audit.total_records}</div>
                        <div className="text-sm font-medium text-gray-500 uppercase">Total Records</div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Stats Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <h3 className="text-xl font-bold font-outfit mb-2">What the numbers say</h3>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Disparate Impact Ratio per group. Anything under 80% fails the EEOC four-fifths rule and indicates potential discrimination.
                        </p>

                        <div className="space-y-10">
                            {Object.entries(audit.stats).map(([col, data]) => (
                                <div key={col}>
                                    <h4 className="text-sm font-bold text-indigo uppercase tracking-widest mb-6">{col} Analysis</h4>
                                    <div className="space-y-6">
                                        {Object.entries(data.groups).map(([group, stats]) => {
                                            const isRef = group === data.reference_group;
                                            const impact = isRef ? 1.0 : (data.disparate_impact[group] || 1.0);
                                            const isFailing = impact < 0.8;

                                            return (
                                                <div key={group} className="space-y-2">
                                                    <div className="flex justify-between text-sm font-semibold">
                                                        <span className="text-gray-700">{group} {isRef && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full ml-1 text-gray-500">REF</span>}</span>
                                                        <span className="text-gray-900">{Math.round(stats.rate * 100)}% • {stats.selected}/{stats.count}</span>
                                                    </div>
                                                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${stats.rate * 100}%` }}
                                                            transition={{ duration: 1, delay: 0.5 }}
                                                            className={`absolute top-0 left-0 h-full rounded-full ${isFailing ? 'bg-red-500' : 'bg-indigo'}`}
                                                        />
                                                    </div>
                                                    {!isRef && (
                                                        <div className={`text-[11px] font-bold ${isFailing ? 'text-red-600' : 'text-gray-500'}`}>
                                                            Impact Ratio: {Math.round(impact * 100)}% {isFailing ? '— FAILS 80% RULE' : '— PASS'}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="card border-2 border-indigo-100 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Sparkles className="w-24 h-24 text-indigo" />
                            </div>
                            <h3 className="text-xl font-bold font-outfit mb-6 flex items-center space-x-2 text-indigo">
                                <Sparkles className="w-5 h-5" />
                                <span>What this means</span>
                            </h3>
                            <p className="text-gray-800 leading-relaxed text-lg font-medium">
                                {audit.explanation}
                            </p>
                            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center space-x-3">
                                <div className="bg-indigo-50 p-1.5 rounded-lg">
                                    <ShieldCheck className="w-4 h-4 text-indigo" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by Gemini 2.5 Flash</span>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="card">
                            <h3 className="text-xl font-bold font-outfit mb-6">Fix-It Recommendations</h3>
                            <div className="space-y-4">
                                {audit.recommendations.map((rec, i) => (
                                    <div key={i} className="flex space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="bg-white text-indigo w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed font-medium pt-1">
                                            {rec}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-12 flex justify-between items-center border-t border-gray-200 pt-8">
                    <button
                        onClick={() => navigate('/upload')}
                        className="flex items-center space-x-2 text-gray-500 hover:text-indigo font-bold transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Audit</span>
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="btn-primary flex items-center space-x-2 bg-gray-900 hover:bg-black"
                    >
                        <FileDown className="w-5 h-5" />
                        <span>Download Report</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal icon component helper
const ShieldCheck = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);

export default Results;
