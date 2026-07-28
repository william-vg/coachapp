import React, { useState, useEffect } from 'react';
import './SocialFeed.css';

function SocialFeed({ token }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/feed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (response.ok) {
        const post = await response.json();
        setPosts([post, ...posts]);
        setNewPost('');
      }
    } catch (err) {
      console.error('Error posting:', err);
    }
  };

  return (
    <div className="feed-card">
      <h3>Social Feed</h3>

      <form onSubmit={handlePostSubmit} className="post-form">
        <textarea
          placeholder="Share something with the community..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows="3"
        />
        <button type="submit">Post</button>
      </form>

      <div className="feed-list">
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p className="empty">No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-item">
              <div className="post-header">
                <strong>{post.email}</strong>
                <span className="post-time">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
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
