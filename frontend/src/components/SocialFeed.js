import React, { useState, useEffect } from 'react';
import './SocialFeed.css';

const MAX_CONTENT = 500;

function SocialFeed({ token }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/feed', {
        headers: { Authorization: `****** },
      });
      if (!response.ok) throw new Error('Failed to load feed');
      const data = await response.json();
      setPosts(data);
    } catch {
      setError('Could not load feed. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newPost.trim();
    if (!trimmed) {
      setPostError('Post cannot be empty');
      return;
    }
    if (trimmed.length > MAX_CONTENT) {
      setPostError(`Post must be ${MAX_CONTENT} characters or less`);
      return;
    }
    setPostError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `******
        },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        setPostError(data.error || 'Failed to post');
        return;
      }
      setPosts((prev) => [data, ...prev]);
      setNewPost('');
    } catch {
      setPostError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const charsLeft = MAX_CONTENT - newPost.length;

  return (
    <div className="feed-card">
      <h3>Social Feed</h3>

      <form onSubmit={handlePostSubmit} className="post-form">
        <div className="textarea-wrap">
          <textarea
            placeholder="Share something with the community\u2026"
            value={newPost}
            onChange={(e) => {
              setNewPost(e.target.value);
              if (postError) setPostError('');
            }}
            rows="3"
            maxLength={MAX_CONTENT + 1}
            className={postError ? 'input-error' : ''}
            aria-label="New post content"
          />
          <span className={`char-count ${charsLeft < 20 ? (charsLeft < 0 ? 'over' : 'warn') : ''}`}>
            {charsLeft}
          </span>
        </div>
        {postError && <p className="inline-error" role="alert">{postError}</p>}
        <button type="submit" disabled={submitting || newPost.trim().length === 0} className="post-btn">
          {submitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Posting\u2026
            </>
          ) : (
            'Post'
          )}
        </button>
      </form>

      <div className="feed-list">
        {loading ? (
          <div className="loading-wrap" aria-label="Loading feed">
            <span className="spinner" />
            <span>Loading feed\u2026</span>
          </div>
        ) : error ? (
          <p className="inline-error" role="alert">{error}</p>
        ) : posts.length === 0 ? (
          <p className="empty">No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-item">
              <div className="post-header">
                <span className="post-avatar" aria-hidden="true">
                  {post.email.charAt(0).toUpperCase()}
                </span>
                <div className="post-meta">
                  <strong>{post.email}</strong>
                  <span className="post-time">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <p>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SocialFeed;
