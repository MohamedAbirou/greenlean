const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";

export const triggerStripeCheckout = async (userId: string) => {
  try {
  const res = await fetch(`${ML_SERVICE_URL}/api/stripe/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      success_url: window.location.origin + "/profile/settings?paid=success",
      cancel_url: window.location.href,
    }),
  });
    const { session_url } = await res.json();
    window.location.href = session_url;
  } catch (error) {
    console.error("Failed to trigger Stripe checkout", error);
  }
};
