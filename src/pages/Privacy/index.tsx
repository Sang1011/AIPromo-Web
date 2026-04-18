import { useNavigate } from 'react-router-dom';

export default function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-dark text-slate-300 px-6 py-10 flex justify-center relative">
            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-primary hover:text-purple-400 transition-colors"
                aria-label="Back to home"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                <span className="text-sm font-medium">Back</span>
            </button>

            <div className="max-w-4xl w-full space-y-6 text-sm leading-relaxed">

                <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>

                <p className="text-text-muted">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
                    <p className="text-slate-300">
                        AIPromo ("we", "our", or "us") respects your privacy and is committed
                        to protecting your personal data. This Privacy Policy explains how we
                        collect, use, and safeguard your information when using our platform.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        <li>Account information (name, email, phone number)</li>
                        <li>Event and ticket data (check-in status, QR code)</li>
                        <li>Device information (device name, OS, IP address)</li>
                        <li>Authentication data (Google login, tokens)</li>
                    </ul>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">3. How We Use Information</h2>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        <li>Provide and operate the AIPromo platform</li>
                        <li>Handle ticket validation and event check-in</li>
                        <li>Improve performance and user experience</li>
                        <li>Ensure security and prevent fraud</li>
                    </ul>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">4. Data Sharing</h2>
                    <p className="text-slate-300">
                        We do not sell personal data. Information may be shared with event
                        organizers or trusted services only when necessary to operate the platform.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">5. Data Security</h2>
                    <p className="text-slate-300">
                        We apply appropriate technical measures to protect your data against
                        unauthorized access, loss, or misuse.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">6. Your Rights</h2>
                    <p className="text-slate-300">
                        You can request access, update, or deletion of your personal data
                        by contacting us.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">7. Contact</h2>
                    <p className="text-slate-300">
                        If you have any questions about this Privacy Policy, contact us at:
                    </p>
                    <p className="text-primary font-medium">aipromoplatform@gmail.com</p>
                </section>

            </div>
        </div>
    );
}