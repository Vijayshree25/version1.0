export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">
                        Last updated: December 2024
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Privacy Matters</h2>
                        <p className="text-slate-600 mb-4">
                            At Ovira AI, we understand that health data is deeply personal. We are committed to
                            protecting your privacy and giving you full control over your information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Data We Collect</h2>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Account Information</strong>: Email address for authentication</li>
                            <li><strong>Profile Data</strong>: Age range, known health conditions (optional)</li>
                            <li><strong>Health Logs</strong>: Symptom data you choose to log (flow, pain, mood, etc.)</li>
                            <li><strong>Chat History</strong>: Conversations with our AI assistant (not stored permanently)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">How We Use Your Data</h2>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>To provide personalized health insights and predictions</li>
                            <li>To generate health reports for you and your healthcare provider</li>
                            <li>To improve our AI&apos;s ability to provide helpful responses</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Data Security</h2>
                        <p className="text-slate-600 mb-4">
                            Your data is stored securely using Firebase, with encryption at rest and in transit.
                            Access is protected by Firebase Authentication and strict security rules ensuring
                            only you can access your data.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Rights</h2>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Export</strong>: Download all your data at any time from Profile settings</li>
                            <li><strong>Delete</strong>: Permanently delete your account and all associated data</li>
                            <li><strong>Control</strong>: Choose what health conditions to share (or not share)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Third-Party Services</h2>
                        <p className="text-slate-600 mb-4">
                            We use Google services (Firebase, Gemini AI) to power our platform. Your data is
                            processed according to Google&apos;s privacy standards. We do not sell your data to
                            any third parties.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact Us</h2>
                        <p className="text-slate-600">
                            If you have questions about this privacy policy, please contact us at
                            privacy@ovira.ai
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
