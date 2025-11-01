import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import React, { useState } from 'react';
import { useSubmitReview } from '../hooks/useReviews';

function StarSelect({ value, setValue }: { value: number, setValue: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, cursor: 'pointer' }}>
      {[1,2,3,4,5].map(star => (
        <span key={star} onClick={() => setValue(star)} style={{ color: star <= value ? '#f5c518' : '#e4e4e4', fontSize: 28 }}>
          &#9733;
        </span>
      ))}
    </div>
  );
}

export function ReviewForm({ userId, onSuccess }: { userId: string, onSuccess?: () => void }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [weightDelta, setWeightDelta] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: submit, isPending } = useSubmitReview();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!rating || rating < 1 || rating > 5) {
      setError('Please choose a rating from 1 to 5 stars.');
      return;
    }
    if (!reviewText.trim()) {
      setError('Review text is required.');
      return;
    }
    const payload = {
      user_id: userId,
      rating,
      review_text: reviewText.trim(),
      weight_change_kg: weightDelta.trim() ? Number(weightDelta) : null,
    };
    submit(payload, {
      onSuccess: () => {
        setRating(5);
        setReviewText('');
        setWeightDelta('');
        if (onSuccess) onSuccess();
      },
      onError: err => setError(err?.message || 'Submission failed'),
    });
  }

  return (
    <Card style={{ maxWidth: 420, margin: '20px auto', padding: 28 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Write your review</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 15 }}>Rating</label>
          <StarSelect value={rating} setValue={setRating} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 15 }}>Your experience (required)</label>
          <Textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            rows={4}
            maxLength={800}
            style={{ width: '100%' }}
            placeholder="Share your journey, feedback or tips with others!"
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 15 }}>
            Weight lost/gained <span style={{ color: '#888' }}>(kg, optional)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            min={-200}
            max={200}
            value={weightDelta}
            onChange={e => setWeightDelta(e.target.value)}
            placeholder="e.g. -5 (lost 5kg), +2 (gained 2kg)"
            style={{ width: 160 }}
          />
        </div>
        {error && <div style={{ color: 'tomato', marginBottom: 12 }}>{error}</div>}
        <Button type="submit" disabled={isPending} style={{ width: '100%' }}>
          {isPending ? 'Submitting...' : 'Submit review'}
        </Button>
      </form>
    </Card>
  );
}
