import React from 'react';
import type { Post } from '../lib/types';
import { format } from 'date-fns';

interface PostCardProps {
  post: Post;
  isDraggable?: boolean;
  isPublished?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isDraggable = false, isPublished = false }) => {
  // For demo purposes, we'll use a placeholder image
  const imageSrc = post.image.startsWith('http') 
    ? post.image 
    : `https://placehold.co/600x400?text=${encodeURIComponent(post.title)}`;
  
  return (
    <div className={`card bg-base-200 shadow-xl ${isPublished ? 'border-2 border-success' : ''}`}>
      <figure>
        <img src={imageSrc} alt={post.title} className="w-full h-48 object-cover" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          {post.title}
          {isPublished && (
            <div className="badge badge-success">Published</div>
          )}
          {!isPublished && isDraggable && (
            <div className="badge badge-warning">Scheduled</div>
          )}
        </h2>
        <p className="line-clamp-3">{post.caption}</p>
        <div className="card-actions justify-between items-center mt-2">
          <div className="text-sm opacity-70">
            {isPublished && post.publishedAt 
              ? `Published: ${format(new Date(post.publishedAt), 'MMM d, yyyy')}`
              : `Created: ${format(new Date(post.createdAt), 'MMM d, yyyy')}`
            }
          </div>
          <button className="btn btn-sm btn-primary">View</button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
