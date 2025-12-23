export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">
                        Last updated: December 2024
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Acceptance of Terms</h2>
                        <p className="text-slate-600 mb-4">
                            By accessing or using Ovira AI, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <h2 className="text-xl font-semibold text-amber-900 mb-4">⚕️ Medical Disclaimer</h2>
                        <p className="text-amber-800 mb-4">
                            <strong>Ovira AI is not a medical service.</strong> The information provided by our
                            platform, including AI-generated insights, health risk indicators, and chat responses,
                            is for informational and educational purposes only.
                        </p>
                        <ul className="list-disc pl-6 text-amber-800 space-y-2">
                            <li>We do not provide medical diagnoses</li>
                            <li>We do not prescribe medications or treatments</li>
                            <li>Our AI analysis should not replace professional medical advice</li>
                            <li>Always consult a qualified healthcare provider for medical concerns</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Use of Service</h2>
                        <p className="text-slate-600 mb-4">
                            Ovira AI is designed to help you track and understand your health patterns. You agree to:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Provide accurate information to the best of your knowledge</li>
                            <li>Use the service for personal, non-commercial purposes</li>
                            <li>Not attempt to reverse-engineer or misuse the platform</li>
                            <li>Keep your account credentials secure</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Health Data</h2>
                        <p className="text-slate-600 mb-4">
                            You retain ownership of all health data you enter into Ovira AI. We process this data
                            solely to provide our services. See our Privacy Policy for details on data handling.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">AI-Generated Content</h2>
                        <p className="text-slate-600 mb-4">
                            Our AI assistant and health analyzer use machine learning to provide insights.
                            While we strive for accuracy:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>AI responses may not always be accurate or complete</li>
                            <li>Patterns detected are statistical observations, not diagnoses</li>
                            <li>You should verify important health information with professionals</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>
                        <p className="text-slate-600 mb-4">
                            Ovira AI and its creators are not liable for any health outcomes based on information
                            provided by our platform. You use this service at your own risk and should always
                            seek professional medical advice for health decisions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>
                        <p className="text-slate-600 mb-4">
                            We may update these terms from time to time. Continued use of the service after
                            changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact</h2>
                        <p className="text-slate-600">
                            For questions about these terms, contact us at legal@ovira.ai
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
