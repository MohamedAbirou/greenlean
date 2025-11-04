/**
 * Terms of Service - Demo Version
 * For portfolio/demonstration projects
 */

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function TermsOfService() {
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
              platform is not currently operating as a commercial service. By using this demo, you
              agree to use test data only. For business inquiries, contact{" "}
              <a href="mailto:support@greenlean.fit" className="text-primary hover:underline">
                support@greenlean.fit
              </a>
            </p>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              1. Demo Project Agreement
            </h2>
            <p className="mb-4">By accessing GreenLean, you acknowledge and agree that:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                This is a <strong>demonstration/portfolio project</strong> built to showcase
                technical capabilities
              </li>
              <li>
                The platform is <strong>not a commercial service</strong> and is not intended for
                actual health or fitness guidance
              </li>
              <li>
                You should <strong>only use test or fictional data</strong> when interacting with
                the platform
              </li>
              <li>Features may be incomplete, experimental, or subject to change without notice</li>
              <li>The demo may be taken offline or reset at any time for maintenance or updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              2. Purpose and Intended Use
            </h2>
            <p className="mb-4">GreenLean is provided for:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Demonstrating AI-powered personalization and modern web development</li>
              <li>Showcasing full-stack architecture and technical skills</li>
              <li>Testing and evaluating the platform's features</li>
              <li>Assessment by potential employers, clients, or buyers</li>
            </ul>
            <p className="text-yellow-600 dark:text-yellow-500 font-medium">
              ⚠️ This platform is NOT intended for actual health or fitness advice. Do not make
              health decisions based on this demo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              3. Critical Medical Disclaimer
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg mb-4">
              <p className="font-bold text-red-600 dark:text-red-400 mb-3">
                IMPORTANT DISCLAIMER - DEMO PROJECT ONLY:
              </p>
              <ul className="space-y-2">
                <li>
                  ❌ This is a <strong>demonstration project</strong>, not a medical or health
                  service
                </li>
                <li>
                  ❌ Content generated is for <strong>testing purposes only</strong>
                </li>
                <li>❌ Do NOT use this platform for actual diet or fitness decisions</li>
                <li>❌ Do NOT enter real health data or personal information</li>
                <li>❌ Always consult licensed healthcare professionals for health advice</li>
                <li>
                  ❌ The developer is not responsible for any decisions made based on demo content
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              If this project were to operate commercially, it would require proper medical
              disclaimers, liability insurance, and potentially professional consultation or
              partnerships with licensed health professionals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              4. Demo Account Registration
            </h2>
            <p className="mb-4">To test the platform, you may create an account. You agree to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Use a test email or one you don't mind using for demos</li>
              <li>Create a secure password (standard security practices apply)</li>
              <li>Use fictional or test data in the health quiz</li>
              <li>Not expect long-term data retention (demo may be reset)</li>
              <li>Understand that accounts may be deleted during maintenance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              5. Subscription Features (Demo Mode)
            </h2>
            <p className="mb-4">The platform demonstrates subscription tiers:</p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">Free Tier (Demo)</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>1 AI-generated plan per cycle</li>
              <li>Access to basic features</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-foreground">Pro Tier (Demo)</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>20 AI-generated plans per cycle</li>
              <li>Access to all features</li>
            </ul>

            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mt-4">
              <p className="text-sm">
                <strong>Payment Note:</strong> Any payment processing in this demo is in TEST MODE
                only. No real charges will be made. If payment features are available, they use
                sandbox/test credentials only.
              </p>
              <p className="text-sm">
                <strong>Test Card Number:</strong> 4242, 04/44, 444, John Doe
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Acceptable Use</h2>
            <p className="mb-4">When using this demo, please do NOT:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Attempt to exploit or hack the platform</li>
              <li>Use automated scripts or bots to spam requests</li>
              <li>Enter real personal health information or sensitive data</li>
              <li>Attempt to overload or disrupt the service</li>
              <li>Resell or redistribute access to the demo</li>
              <li>Use for any commercial purpose without permission</li>
              <li>Misrepresent the demo as your own work</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              7. Intellectual Property
            </h2>
            <p className="mb-4">
              This demo project, including all code, design, and content, is the intellectual
              property of the developer. The platform showcases:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Custom React/TypeScript architecture</li>
              <li>Original UI/UX design and components</li>
              <li>AI integration implementation</li>
              <li>Full-stack development capabilities</li>
            </ul>
            <p className="mb-4">
              <strong>For Potential Buyers/Licensees:</strong> If you're interested in acquiring or
              licensing this project, please contact{" "}
              <a href="mailto:support@greenlean.fit" className="text-primary hover:underline">
                support@greenlean.fit
              </a>{" "}
              to discuss terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              8. AI-Generated Content (Demo)
            </h2>
            <p className="mb-4">
              The platform demonstrates AI integration using multiple providers. You acknowledge:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>AI content is generated for demonstration purposes only</li>
              <li>Accuracy and appropriateness are not guaranteed in demo mode</li>
              <li>Content should not be used for actual health decisions</li>
              <li>The demo showcases technical capabilities, not medical expertise</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Third-Party Services</h2>
            <p className="mb-4">This demo integrates with:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Supabase (database and auth)</li>
              <li>OpenAI, Anthropic, Google, Meta (AI providers)</li>
              <li>Vercel (hosting and analytics)</li>
              <li>Payment processors (test mode if enabled)</li>
            </ul>
            <p>
              These services have their own terms and policies. In a commercial version, proper
              service agreements would be established.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              10. Disclaimers and Limitations
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Demo "As-Is" Provision</h3>
                <p>
                  This demo is provided "AS IS" for demonstration purposes. No warranties are made
                  regarding:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Functionality or availability</li>
                  <li>Accuracy of generated content</li>
                  <li>Data persistence or security</li>
                  <li>Fitness for any particular purpose</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">No Liability</h3>
                <p>
                  The developer is not liable for any damages, losses, or issues arising from use of
                  this demo, including but not limited to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Health decisions made based on demo content</li>
                  <li>Data loss or security issues</li>
                  <li>Service interruptions or downtime</li>
                  <li>Inaccurate or inappropriate AI-generated content</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Data and Privacy</h2>
            <p className="mb-4">As a demo project, please be aware:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Data may be reset or deleted at any time</li>
              <li>Use test/fictional data only - no real personal information</li>
              <li>
                Standard security measures are in place, but this is not a production environment
              </li>
              <li>See the Privacy Policy for more details on data handling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              12. Termination and Changes
            </h2>
            <p>
              This demo may be modified, suspended, or terminated at any time without notice.
              Accounts may be deleted, features may change, and the entire service may be taken
              offline for updates or permanently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              13. Commercial Transition
            </h2>
            <p className="mb-4">
              If this project transitions to commercial operation (either by the developer or a new
              owner), the following would be required:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Complete legal terms drafted by an attorney</li>
              <li>Business entity registration and proper licensing</li>
              <li>Liability insurance and risk management</li>
              <li>GDPR, CCPA, and other regulatory compliance</li>
              <li>Medical disclaimer review by legal counsel</li>
              <li>Proper data processing agreements with third parties</li>
              <li>Customer support infrastructure</li>
              <li>Professional financial processing setup</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Information</h2>
            <p className="mb-4">For questions, feedback, or business inquiries about this demo:</p>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="mb-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:support@greenlean.fit" className="text-primary hover:underline">
                  support@greenlean.fit
                </a>
              </p>
              <p className="mb-2">
                <strong>Project Type:</strong> Demo/Portfolio
              </p>
              <p className="mb-2">
                <strong>Purpose:</strong> Technical showcase and potential sale
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Interested in acquiring or licensing this project? Reach out to discuss
                opportunities!
              </p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="text-sm text-foreground/80 mb-4">
                <strong>Final Disclaimer:</strong> These terms are appropriate for a
                demonstration/portfolio project. Any party that acquires this platform for
                commercial operation must engage legal counsel to draft comprehensive terms that
                comply with all applicable laws, regulations, and industry standards in their
                jurisdiction.
              </p>
              <p className="text-sm text-foreground/80">
                By using this demo, you agree that you understand this is a portfolio project, will
                only use test data, and will not make any health or fitness decisions based on the
                platform's content.
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
