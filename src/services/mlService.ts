/**
 * ML Service Integration
 *
 * This service handles communication with the Python ML microservice
 * for meal prediction and user feedback submission.
 */

const ML_SERVICE_URL =
  import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";

class MLService {
  private baseUrl: string;

  constructor(baseUrl: string = ML_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit user feedback for a meal
   */
  async generateMealPlan(): Promise<void> {
    try {
      const res = await fetch(`https://${this.baseUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menus: [
            {
              foods: { Food_Barbequeue_Lays: 1.0, Food_Pizza: 1.0 },
              energy: 2000,
              protein: 80,
              sugar: 50,
            },
          ],
          preferences: "high protein, low sugar",
          restrictions: "no dairy",
          company: "openai",
          model_name: "gpt-4o",
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to submit feedback: ${res.statusText}`);
      }

      const result = await res.json();
      console.log("Result:", result);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const mlService = new MLService();

// Export class for testing
export { MLService };

