import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, Send } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitStatus("loading");

      if (validateForm()) {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: "abiroumohamed58@gmail.com",
            subject: formData.subject,
            html: `
                <div style="font-family: 'Inter', sans-serif; background:#f9fafb; padding:20px;">
                  <div style="max-width:600px; margin:auto; background:white; border-radius:12px; padding:30px; box-shadow:0 2px 10px rgba(0,0,0,0.1)">
                    <h2 style="color:#6366f1; margin-bottom:10px;">📬 New Message from Your Contact Form</h2>
                    <p style="font-size:14px; color:#4b5563; margin-bottom:20px;">
                      <strong>From:</strong> ${formData.name} &lt;${formData.email}&gt;<br>
                      <strong>Subject:</strong> ${formData.subject}
                    </p>
                    <div style="background:#f3f4f6; padding:20px; border-radius:8px; font-size:16px; color:#111827; line-height:1.5;">
                      ${formData.message.replace(/\n/g, "<br>")}
                    </div>
                    <p style="margin-top:20px; font-size:14px; color:#6b7280;">
                      This message was sent via your GreenLean contact form.
                    </p>
                  </div>
                </div>
              `,
          }),
        });

        if (!res.ok) throw new Error("Failed to send email");

        setTimeout(() => {
          setSubmitStatus("success");
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
          });
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
    } finally {
      setSubmitStatus("idle");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            className="text-3xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Have questions or feedback? We'd love to hear from you. Fill out the form below and
            we'll get back to you as soon as possible.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Get in Touch</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-foreground">Email</h3>
                    <a
                      href="mailto:support@greenlean.fit"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      support@greenlean.fit
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-foreground">
                      Address
                    </h3>
                    <a
                      href="https://maps.google.com/?q=229+West+28th+Street+New+York+NY+10001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      229 West 28th Street
                      <br />
                      New York, NY 10001
                      <br />
                      United States
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-foreground">
                      Support Hours
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM EST
                      <br />
                      Saturday: 10:00 AM - 4:00 PM EST
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-primary/20 rounded-lg border border-primary">
                <p className="text-sm text-primary">
                  For immediate assistance, please check our{" "}
                  <Link to="/faq" className="text-primary font-medium hover:text-primary">
                    FAQ page
                  </Link>{" "}
                  or send us an email.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Send us a Message</h2>

              {submitStatus === "success" ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-700 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-600 mb-4">
                    Thank you for contacting us. We've received your message and will get back to
                    you within 24-48 hours.
                  </p>
                  <button
                    className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg  transition-colors"
                    onClick={() => setSubmitStatus("idle")}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={`${errors.name ? "border-red-300" : "border-gray-300"}`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className={`${errors.email ? "border-red-300" : "border-gray-300"}`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(val) =>
                        handleChange({
                          target: { name: "subject", value: val },
                        } as any)
                      }
                    >
                      <SelectTrigger
                        className={`w-full ${
                          errors.subject ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Diet Plan Question">Diet Plan Question</SelectItem>
                        <SelectItem value="Exercise Routine Question">
                          Exercise Routine Question
                        </SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="Partnership Inquiry">Partnership Inquiry</SelectItem>
                        <SelectItem value="Media Inquiry">Media Inquiry</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-destructive">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className={`${errors.message ? "border-red-300" : "border-gray-300"}`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-destructive">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <div>
                    <Button
                      type="submit"
                      className={`w-full flex justify-center items-center ${
                        submitStatus === "loading"
                          ? "bg-gray-400 cursor-not-allowed"
                          : `bg-primary hover:bg-primary/90`
                      }`}
                      disabled={submitStatus === "loading"}
                    >
                      {submitStatus === "loading" ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
