/**
 * Resend Email Service
 * Production-grade transactional emails for GreenLean
 *
 * Get your API key: https://resend.com/api-keys (free tier: 100 emails/day)
 */

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "GreenLean <noreply@greenlean.app>"; // Update with your verified domain

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export interface ProgressReportData {
  userName: string;
  weekNumber: number;
  caloriesLogged: number;
  workoutsCompleted: number;
  weightChange: number;
  streakDays: number;
}

export interface ReEngagementData {
  userName: string;
  daysSinceLastLogin: number;
}

export interface PlanGenerationCompleteData {
  userName: string;
  planType: "meal" | "workout" | "both";
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = RESEND_API_KEY;
    this.fromEmail = FROM_EMAIL;
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send email using Resend API
   */
  private async sendEmail(template: EmailTemplate): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("Resend API key not configured. Email not sent.");
      console.log("Would have sent email to:", template.to);
      return false;
    }

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [template.to],
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Resend API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Email sent successfully:", data.id);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GreenLean!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Welcome to GreenLean! 🎉</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${data.userName},</p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for joining GreenLean! We're excited to help you achieve your health and fitness goals with personalized AI-powered meal and workout plans.
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        Here's what you can do next:
      </p>

      <!-- Features List -->
      <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 0 0 30px 0;">
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 10px;"><strong>Complete the quick quiz</strong> to get your personalized AI meal and workout plans</li>
          <li style="margin-bottom: 10px;"><strong>Track your meals</strong> from our database of 350,000+ foods</li>
          <li style="margin-bottom: 10px;"><strong>Log your workouts</strong> and watch your progress grow</li>
          <li style="margin-bottom: 10px;"><strong>Join challenges</strong> and earn rewards for staying consistent</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="https://greenlean.app/quiz" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Get Started with Your Quiz
        </a>
      </div>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 10px 0;">
        Need help? Just reply to this email and we'll be happy to assist you.
      </p>

      <p style="font-size: 16px; color: #4b5563; margin: 0;">
        To your health,<br>
        <strong>The GreenLean Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
        GreenLean - Your AI-Powered Fitness Companion
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        You received this email because you signed up for GreenLean.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Welcome to GreenLean, ${data.userName}!

Thank you for joining GreenLean! We're excited to help you achieve your health and fitness goals with personalized AI-powered meal and workout plans.

Here's what you can do next:
- Complete the quick quiz to get your personalized AI meal and workout plans
- Track your meals from our database of 350,000+ foods
- Log your workouts and watch your progress grow
- Join challenges and earn rewards for staying consistent

Get started: https://greenlean.app/quiz

Need help? Just reply to this email and we'll be happy to assist you.

To your health,
The GreenLean Team
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: "Welcome to GreenLean - Let's Get Started! 🎉",
      html,
      text,
    });
  }

  /**
   * Send weekly progress report
   */
  async sendProgressReport(email: string, data: ProgressReportData): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Progress Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Week ${data.weekNumber} Progress Report</h1>
      <p style="color: #d1fae5; margin: 0; font-size: 16px;">Keep up the amazing work, ${data.userName}! 💪</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 30px 0;">
        Here's a summary of your progress this week:
      </p>

      <!-- Stats Grid -->
      <div style="margin: 0 0 30px 0;">
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 15px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Calories Logged</p>
          <p style="color: #1f2937; font-size: 32px; font-weight: bold; margin: 0;">${data.caloriesLogged.toLocaleString()}</p>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 15px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Workouts Completed</p>
          <p style="color: #1f2937; font-size: 32px; font-weight: bold; margin: 0;">${data.workoutsCompleted}</p>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 15px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Weight Change</p>
          <p style="color: #1f2937; font-size: 32px; font-weight: bold; margin: 0;">${data.weightChange > 0 ? '+' : ''}${data.weightChange.toFixed(1)} kg</p>
        </div>

        <div style="background-color: #fce7f3; border-left: 4px solid #ec4899; padding: 20px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Current Streak</p>
          <p style="color: #1f2937; font-size: 32px; font-weight: bold; margin: 0;">${data.streakDays} days 🔥</p>
        </div>
      </div>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        ${data.streakDays >= 7 ?
          "Amazing! You've maintained a 7-day streak. Consistency is key to achieving your goals!" :
          "Keep logging your meals and workouts to build a streak and stay on track!"}
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 20px 0;">
        <a href="https://greenlean.app/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          View Full Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
        Keep crushing your goals! 💪
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        <a href="https://greenlean.app/settings/notifications" style="color: #9ca3af; text-decoration: underline;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Week ${data.weekNumber} Progress: ${data.workoutsCompleted} workouts, ${data.streakDays} day streak! 🔥`,
      html,
    });
  }

  /**
   * Send re-engagement email to inactive users
   */
  async sendReEngagementEmail(email: string, data: ReEngagementData): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We miss you at GreenLean!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">We Miss You! 🥺</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${data.userName},</p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        It's been ${data.daysSinceLastLogin} days since we last saw you, and we wanted to check in!
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        Your health journey is important, and even small steps can make a big difference. Here's what's waiting for you:
      </p>

      <!-- Benefits -->
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
          <li>Your personalized AI meal and workout plans</li>
          <li>Track progress with our 350K+ food database</li>
          <li>Join new challenges and earn rewards</li>
          <li>See your week-by-week transformation</li>
        </ul>
      </div>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        <strong>Remember:</strong> Consistency beats perfection. Just 10 minutes today can restart your momentum!
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="https://greenlean.app/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Continue Your Journey
        </a>
      </div>

      <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
        Not interested? <a href="https://greenlean.app/settings/notifications" style="color: #10b981; text-decoration: underline;">Update your preferences</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        GreenLean - We're here when you're ready 💚
      </p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `${data.userName}, your health journey is waiting for you! 💚`,
      html,
    });
  }

  /**
   * Send plan generation complete notification
   */
  async sendPlanCompleteEmail(email: string, data: PlanGenerationCompleteData): Promise<boolean> {
    const planText = data.planType === "both" ? "meal and workout plans" :
                     data.planType === "meal" ? "meal plan" : "workout plan";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Plans Are Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Your Plans Are Ready! 🎉</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Great news, ${data.userName}!</p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        Your personalized AI-generated ${planText} ${data.planType === "both" ? "are" : "is"} now ready! Our AI has analyzed your goals, preferences, and lifestyle to create the perfect plan just for you.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="https://greenlean.app/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          View Your Plans
        </a>
      </div>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0;">
        Start tracking your progress today and watch yourself transform!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        GreenLean - Your AI-Powered Fitness Companion
      </p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `✅ Your personalized ${planText} ${data.planType === "both" ? "are" : "is"} ready!`,
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

export default emailService;
