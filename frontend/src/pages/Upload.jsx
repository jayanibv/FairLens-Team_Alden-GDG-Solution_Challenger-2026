import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, CheckCircle2, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runAudit, getSampleUrl } from '../api';
import axios from 'axios';

const Upload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [decisionCol, setDecisionCol] = useState("");
    const [demographicCols, setDemographicCols] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const loadingMessages = [
        "Scanning for disparities...",
        "Calculating impact ratios...",
        "Asking Gemini to explain..."
    ];

    const handleFile = (selectedFile) => {
        if (!selectedFile || !selectedFile.name.endsWith('.csv')) {
            alert("Please upload a CSV file.");
            return;
        }
        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n').map(row => row.split(','));
            const headerRow = rows[0].map(h => h.trim());
            setHeaders(headerRow);
            setPreview(rows.slice(1, 6));
            
            // Auto-select decision if common names found
            const dec = headerRow.find(h => ['selected', 'hired', 'approved', 'decision', 'result'].includes(h.toLowerCase()));
            if (dec) setDecisionCol(dec);
            
            // Auto-select demographics
            const demos = headerRow.filter(h => ['gender', 'age', 'race', 'ethnicity'].includes(h.toLowerCase()));
            setDemographicCols(demos);
        };
        reader.readAsText(selectedFile);
    };

    const onDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };

    const handleSample = async (type) => {
        setLoading(true);
        setLoadingMessage("Loading sample data...");
        try {
            const response = await axios.get(getSampleUrl(type), { responseType: 'blob' });
            const sampleFile = new File([response.data], `${type}_sample.csv`, { type: 'text/csv' });
            handleFile(sampleFile);
        } catch (error) {
            console.error("Error loading sample:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!file || !decisionCol || demographicCols.length === 0) {
            alert("Please select a file, a decision column, and at least one demographic column.");
            return;
        }

        setLoading(true);
        let msgIndex = 0;
        const interval = setInterval(() => {
            setLoadingMessage(loadingMessages[msgIndex]);
            msgIndex = (msgIndex + 1) % loadingMessages.length;
        }, 800);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('decision_column', decisionCol);
            formData.append('demographic_columns', demographicCols.join(','));

            const result = await runAudit(formData);
            
            // Delay a bit to show loading messages as requested
            setTimeout(() => {
                clearInterval(interval);
                navigate('/results', { state: { audit: result } });
            }, 2500);
            
        } catch (error) {
            clearInterval(interval);
            setLoading(false);
            alert(error.response?.data?.message || "An error occurred during audit.");
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="p-10">
                        <h2 className="text-3xl font-bold font-outfit mb-8 text-center">New Bias Audit</h2>
                        
                        {/* Dropzone */}
                        <div 
                            onDrop={onDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => document.getElementById('file-upload').click()}
                            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo hover:bg-indigo-50/30'}`}
                        >
                            <input 
                                type="file" 
                                id="file-upload" 
                                className="hidden" 
                                accept=".csv"
                                onChange={(e) => handleFile(e.target.files[0])}
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 p-4 rounded-full mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">{file.name}</span>
                                    <span className="text-green-600 font-medium mt-1">File selected successfully</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="bg-indigo-50 p-4 rounded-full mb-4 text-indigo">
                                        <UploadIcon className="w-10 h-10" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">Drop your CSV here</span>
                                    <span className="text-gray-500 mt-1">or click to browse from your computer</span>
                                </div>
                            )}
                        </div>

                        {/* Sample Buttons */}
                        {!file && (
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <span className="text-gray-400 w-full text-center text-sm mb-2">No data? Try one of ours:</span>
                                {['Hiring', 'Loan', 'Medical'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handleSample(type.toLowerCase())}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-indigo hover:text-indigo transition-all"
                                    >
                                        Try {type} Data
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Preview and Selectors */}
                        <AnimatePresence>
                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-10"
                                >
                                    <h3 className="text-lg font-bold font-outfit mb-4">Dataset Preview</h3>
                                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {headers.map((h, i) => (
                                                        <th key={i} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {preview.map((row, i) => (
                                                    <tr key={i}>
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-10 grid md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Which column is the decision?</label>
                                            <select 
                                                value={decisionCol}
                                                onChange={(e) => setDecisionCol(e.target.value)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo outline-none"
                                            >
                                                <option value="">Select column</option>
                                                {headers.map((h, i) => (
                                                    <option key={i} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Which columns are demographic?</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {headers.filter(h => h !== decisionCol).map((h, i) => (
                                                    <label key={i} className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer transition-all ${demographicCols.includes(h) ? 'border-indigo bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={demographicCols.includes(h)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setDemographicCols([...demographicCols, h]);
                                                                else setDemographicCols(demographicCols.filter(c => c !== h));
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <span className={`text-sm font-medium ${demographicCols.includes(h) ? 'text-indigo' : 'text-gray-600'}`}>{h}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary w-full mt-12 py-4 flex items-center justify-center space-x-3 text-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <span>{loadingMessage}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5 fill-current" />
                                                <span>Run Bias Audit</span>
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Upload;
