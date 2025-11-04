/**
 * Privacy Policy - Demo Version
 * For portfolio/demonstration projects
 */

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "November 4, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 max-w-4xl"
      >
        {/* Demo Notice Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-500 mb-2">Demo/Portfolio Project Notice</h3>
            <p className="text-sm text-foreground/80">
              GreenLean is a demonstration project built to showcase technical capabilities. This
              platform is not currently operating as a commercial service. If you are interested in
              acquiring or licensing this project, please contact{" "}
              <a href="mailto:support@greenlean.fit" className="text-primary hover:underline">
                support@greenlean.fit
              </a>
            </p>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. About This Demo</h2>
            <p className="mb-4">
              GreenLean is a portfolio demonstration project created by a software developer to
              showcase modern web development capabilities including AI integration, responsive
              design, and full-stack architecture. This privacy policy outlines how data would be
              handled in a production environment.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> While functional, this platform is primarily for
              demonstration purposes. Any data you enter may be used for testing and demonstration.
              Do not enter sensitive personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              2. Information Collection (Demo Environment)
            </h2>
            <p className="mb-4">In this demonstration environment, the platform may collect:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong>Account Information:</strong> Email address and password (securely hashed)
              </li>
              <li>
                <strong>Profile Data:</strong> Information you provide in the health quiz (age,
                goals, preferences)
              </li>
              <li>
                <strong>Usage Data:</strong> How you interact with the platform features
              </li>
              <li>
                <strong>Technical Data:</strong> Browser type, IP address, device information
              </li>
            </ul>
            <p className="text-yellow-600 dark:text-yellow-500 font-medium">
              ⚠️ Demo Notice: Do not enter real health data or sensitive personal information. Use
              placeholder or fictional data for testing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How Data is Used</h2>
            <p className="mb-4">Data in this demo is used to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                Demonstrate the platform's AI-powered meal planning and workout generation features
              </li>
              <li>Showcase personalization algorithms and user experience</li>
              <li>Test and improve the technical implementation</li>
              <li>Demonstrate to potential buyers or employers the platform's capabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Third-Party Services</h2>
            <p className="mb-4">This demo integrates with the following services:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong>Supabase:</strong> Database and authentication services
              </li>
              <li>
                <strong>AI Providers:</strong> OpenAI, Anthropic, Google, and Meta APIs for
                generating personalized content
              </li>
              <li>
                <strong>Vercel:</strong> Hosting and analytics
              </li>
              <li>
                <strong>Payment Processors:</strong> (If demo payments are enabled - currently in
                test mode only)
              </li>
            </ul>
            <p className="mb-4">
              When you use features that involve these services, your data may be processed by them
              according to their respective privacy policies. In a production environment, proper
              data processing agreements would be in place.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Security</h2>
            <p className="mb-4">Even in demo mode, we implement security best practices:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Passwords are hashed using industry-standard algorithms</li>
              <li>Data transmission is encrypted via HTTPS</li>
              <li>Database access is restricted and authenticated</li>
              <li>No payment information is stored (test mode only)</li>
            </ul>
            <p>
              However, as this is a demonstration project, we recommend not using real personal or
              sensitive information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access your data stored in the demo</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your data</li>
              <li>Opt-out of any analytics or tracking (via cookie preferences)</li>
            </ul>
            <p>
              To exercise these rights, contact{" "}
              <a href="mailto:support@greenlean.fit" className="text-primary hover:underline">
                support@greenlean.fit
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Data Retention</h2>
            <p>
              As a demo project, data may be periodically cleared for testing purposes. We do not
              guarantee long-term data retention. If this project transitions to a commercial
              product, proper data retention policies would be implemented based on legal
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Cookies and Tracking</h2>
            <p className="mb-4">This demo uses:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong>Essential cookies:</strong> For authentication and core functionality
              </li>
              <li>
                <strong>Analytics cookies:</strong> To understand usage patterns (Vercel Analytics,
                with your consent)
              </li>
            </ul>
            <p>
              You can manage cookie preferences through the cookie consent banner or your browser
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. International Users</h2>
            <p>
              This demo is hosted on servers that may be located in various regions. By using this
              demo, you acknowledge that your data may be transferred and processed internationally.
              In a production environment, proper international data transfer mechanisms would be
              implemented.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Children's Privacy</h2>
            <p>
              This demo is not intended for users under 18 years of age. We do not knowingly collect
              information from minors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              11. Changes to This Policy
            </h2>
            <p>
              This privacy policy may be updated as the demo evolves or if the project transitions
              to a commercial product. Significant changes will be communicated through the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              12. Production Considerations
            </h2>
            <p className="mb-4">
              If this project is acquired or licensed for commercial use, the following would need
              to be implemented:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Comprehensive legal review of privacy practices</li>
              <li>GDPR, CCPA, and other regional compliance measures</li>
              <li>Data Processing Agreements with third-party services</li>
              <li>Proper business entity registration and legal documentation</li>
              <li>Professional liability insurance considerations</li>
              <li>HIPAA compliance assessment (if handling health data in US)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Contact Information</h2>
            <p className="mb-4">For questions about this demo project or privacy practices:</p>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="mb-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:support@greenlean.fit" className="text-primary hover:underline">
                  support@greenlean.fit
                </a>
              </p>
              <p className="mb-2">
                <strong>Project Status:</strong> Demo/Portfolio
              </p>
              <p className="text-sm text-muted-foreground">
                Response time may vary as this is a personal project
              </p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="text-sm text-foreground/80 mb-4">
                <strong>Disclaimer:</strong> This privacy policy is designed for a demonstration
                project. Any organization that acquires or operates this platform commercially
                should engage legal counsel to draft appropriate privacy policies that comply with
                all applicable laws and regulations in their jurisdiction.
              </p>
              <p className="text-sm text-foreground/80">
                By using this demo, you acknowledge that this is a portfolio project and agree to
                use test/fictional data rather than real personal information.
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
