import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Button, Textarea, Alert, Spinner, Avatar } from '../components/UI';

const postValidators = {
  content: [
    (v) => (!v?.trim() ? 'Write something first' : null),
    (v) => (v && v.length > 500 ? 'Max 500 characters' : null),
  ],
};

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingPost, setLoadingPost] = useState(false);
  const [serverError, setServerError] = useState('');

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } = useForm(
    { content: '' },
    postValidators
  );

  const fetchFeed = useCallback(async () => {
    try {
      const data = await api.get('/feed');
      setPosts(data.posts);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const onPost = handleSubmit(async (vals) => {
    setLoadingPost(true);
    setServerError('');
    try {
      const data = await api.post('/feed', { content: vals.content.trim() });
      setPosts((prev) => [data.post, ...prev]);
      reset();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoadingPost(false);
    }
  });

  async function toggleLike(postId) {
    try {
      const data = await api.post(`/feed/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, liked: data.liked, like_count: data.like_count } : p
        )
      );
    } catch (err) {
      setServerError(err.message);
    }
  }

  async function deletePost(postId) {
    try {
      await api.delete(`/feed/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setServerError(err.message);
    }
  }

  function addComment(postId, comment) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
      )
    );
  }

  return (
    <div className="page animate-fade-in">
      <div className="page__header">
        <h2 className="page__title">Community Feed</h2>
      </div>

      {serverError && <Alert onDismiss={() => setServerError('')}>{serverError}</Alert>}

      <div className="post-composer">
        <Avatar name={user?.name} color={user?.avatar_color} size={40} />
        <form onSubmit={onPost} className="post-composer__form">
          <Textarea
            id="content"
            name="content"
            placeholder="Share something with the community…"
            value={values.content}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.content}
            touched={touched.content}
            rows={3}
            className="post-composer__textarea"
          />
          <div className="post-composer__footer">
            <span className={`char-count ${values.content.length > 450 ? 'char-count--warn' : ''}`}>
              {values.content.length}/500
            </span>
            <Button type="submit" loading={loadingPost} size="sm">
              Post
            </Button>
          </div>
        </form>
      </div>

      {loadingPage ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">💬</span>
          <p>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="feed">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onLike={toggleLike}
              onDelete={deletePost}
              onComment={addComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUser, onLike, onDelete, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [likingId, setLikingId] = useState(false);

  async function handleLike() {
    setLikingId(true);
    await onLike(post.id);
    setLikingId(false);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) { setCommentError('Comment cannot be empty'); return; }
    setCommentError('');
    setAddingComment(true);
    try {
      const data = await api.post(`/feed/${post.id}/comments`, { content: commentText.trim() });
      onComment(post.id, data.comment);
      setCommentText('');
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setAddingComment(false);
    }
  }

  const timeAgo = formatTime(post.created_at);

  return (
    <article className="post-card animate-slide-in">
      <div className="post-card__header">
        <Avatar name={post.author_name} color={post.avatar_color} size={40} />
        <div className="post-card__meta">
          <span className="post-card__author">{post.author_name}</span>
          <span className="post-card__time">{timeAgo}</span>
        </div>
        {post.user_id === currentUser?.id && (
          <button
            className="post-card__delete"
            onClick={() => onDelete(post.id)}
            aria-label="Delete post"
          >
            ×
          </button>
        )}
      </div>

      <p className="post-card__content">{post.content}</p>

      <div className="post-card__actions">
        <button
          className={`post-card__action ${post.liked ? 'post-card__action--liked' : ''}`}
          onClick={handleLike}
          disabled={likingId}
        >
          {likingId ? <Spinner size="sm" /> : '❤️'} {post.like_count}
        </button>
        <button
          className="post-card__action"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {post.comments.map((c) => (
            <div key={c.id} className="comment">
              <Avatar name={c.author_name} color={c.avatar_color} size={28} />
              <div className="comment__body">
                <span className="comment__author">{c.author_name}</span>
                <p className="comment__text">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <input
              className={`comment-form__input ${commentError ? 'field__input--error' : ''}`}
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => { setCommentText(e.target.value); setCommentError(''); }}
              maxLength={300}
            />
            {commentError && <span className="field__error">{commentError}</span>}
            <Button type="submit" loading={addingComment} size="sm" variant="secondary">
              Send
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}

function formatTime(dateStr) {
  const diff = (Date.now() - new Date(dateStr + 'Z').getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
