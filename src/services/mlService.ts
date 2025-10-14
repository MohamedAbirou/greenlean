/**
 * ML Service Integration
 * 
 * This service handles communication with the Python ML microservice
 * for meal prediction and user feedback submission.
 */

import {
    MacroTargets,
    MealFeedback,
    UserProfile
} from '../types/mealGeneration';

const ML_SERVICE_URL = process.env.REACT_APP_ML_SERVICE_URL || 'http://localhost:8000';

export interface MLPredictionRequest {
  user_id: string;
  user_profile: UserProfile;
  macro_targets: MacroTargets;
  meal_type: string;
  available_templates: string[];
}

export interface MLPredictionResponse {
  recommended_templates: string[];
  portion_sizes: Record<string, number>;
  confidence: number;
  reasoning: string;
}

export interface ModelPerformance {
  model_name: string;
  metric_name: string;
  metric_value: number;
  evaluation_date: string;
  training_data_size: number;
  test_data_size: number;
}

class MLService {
  private baseUrl: string;

  constructor(baseUrl: string = ML_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit user feedback for a meal
   */
  async submitFeedback(feedback: MealFeedback): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Feedback submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Get ML prediction for meal template selection
   */
  async getMealPrediction(request: MLPredictionRequest): Promise<MLPredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to get prediction: ${response.statusText}`);
      }

      const prediction = await response.json();
      return prediction;
    } catch (error) {
      console.error('Error getting ML prediction:', error);
      // Return fallback prediction
      return this.getFallbackPrediction(request);
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(): Promise<ModelPerformance[]> {
    try {
      const response = await fetch(`${this.baseUrl}/performance`);

      if (!response.ok) {
        throw new Error(`Failed to get model performance: ${response.statusText}`);
      }

      const performance = await response.json();
      return performance;
    } catch (error) {
      console.error('Error getting model performance:', error);
      return [];
    }
  }

  /**
   * Trigger model retraining
   */
  async retrainModels(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/retrain`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to retrain models: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Models retrained successfully:', result);
    } catch (error) {
      console.error('Error retraining models:', error);
      throw error;
    }
  }

  /**
   * Check ML service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('ML service health check failed:', error);
      return false;
    }
  }

  /**
   * Fallback prediction when ML service is unavailable
   */
  private getFallbackPrediction(request: MLPredictionRequest): MLPredictionResponse {
    const { available_templates, user_profile, macro_targets } = request;
    
    // Simple rule-based fallback
    let recommendedTemplates = [...available_templates];
    
    // Filter by diet type
    if (user_profile.dietType === 'Vegan') {
      recommendedTemplates = recommendedTemplates.filter(t => 
        !t.toLowerCase().includes('chicken') && 
        !t.toLowerCase().includes('beef') && 
        !t.toLowerCase().includes('pork') &&
        !t.toLowerCase().includes('fish') &&
        !t.toLowerCase().includes('salmon') &&
        !t.toLowerCase().includes('tuna')
      );
    } else if (user_profile.dietType === 'Vegetarian') {
      recommendedTemplates = recommendedTemplates.filter(t => 
        !t.toLowerCase().includes('chicken') && 
        !t.toLowerCase().includes('beef') && 
        !t.toLowerCase().includes('pork') &&
        !t.toLowerCase().includes('fish') &&
        !t.toLowerCase().includes('salmon') &&
        !t.toLowerCase().includes('tuna')
      );
    } else if (user_profile.dietType === 'Keto') {
      recommendedTemplates = recommendedTemplates.filter(t => 
        !t.toLowerCase().includes('rice') && 
        !t.toLowerCase().includes('pasta') && 
        !t.toLowerCase().includes('bread') &&
        !t.toLowerCase().includes('oats') &&
        !t.toLowerCase().includes('quinoa')
      );
    }

    // Take top 3 templates
    recommendedTemplates = recommendedTemplates.slice(0, 3);

    // Calculate portion sizes based on macro targets
    const baseCalories = 400;
    const targetCalories = macro_targets.calories;
    const scaleFactor = targetCalories / baseCalories;

    const portionSizes = {
      protein_scale: scaleFactor,
      carb_scale: scaleFactor,
      fat_scale: scaleFactor,
      vegetable_scale: scaleFactor * 1.2
    };

    return {
      recommended_templates: recommendedTemplates,
      portion_sizes: portionSizes,
      confidence: 0.3, // Low confidence for fallback
      reasoning: 'Fallback prediction (ML service unavailable)'
    };
  }
}

// Export singleton instance
export const mlService = new MLService();

// Export class for testing
export { MLService };
