import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, MessageSquareText, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: "Real Legal Math",
            description: "Uses the EEOC four-fifths rule, the same standard used in US courts for detecting disparate impact.",
            icon: <BarChart3 className="w-6 h-6 text-indigo" />,
        },
        {
            title: "Plain English",
            description: "Gemini explains bias in language your CEO and legal team can understand. No statistics degree required.",
            icon: <MessageSquareText className="w-6 h-6 text-indigo" />,
        },
        {
            title: "Fix-It Plan",
            description: "3 specific actionable steps to reduce bias before your next audit. Practical solutions, not just problems.",
            icon: <ShieldCheck className="w-6 h-6 text-indigo" />,
        }
    ];

    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold font-outfit text-gray-900 leading-tight">
                        Find out if your decisions are <br />
                        <span className="gradient-text">biased — in 30 seconds</span>
                    </h1>
                    <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Upload any decision dataset. FairLens detects discrimination using real legal statistics,
                        then explains it in plain English.
                    </p>
                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={() => navigate('/upload')}
                            className="btn-primary text-lg px-8 py-4 flex items-center space-x-3"
                        >
                            <span>Start Free Audit</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-50 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="card bg-white"
                            >
                                <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold font-outfit mb-4">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-500 font-medium mb-4 md:mb-0">
                        Works for Hiring • Loans • Healthcare
                    </div>
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                            <span className="text-sm font-semibold text-indigo">Powered by Alden Team - Gemini AI</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium italic">History is private to this browser & device</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
