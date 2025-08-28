import React from 'react';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="border rounded-md p-4 mb-4">
      <h3 className="font-semibold">{review.serviceProvider.name}</h3>
      <p>Overall Rating: {review.ratings.overall}/5</p>
      <p>Quality: {review.ratings.quality}/5</p>
      <p>Comment: {review.comment}</p>
      <p>Would Recommend: {review.wouldRecommend ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default ReviewCard;
