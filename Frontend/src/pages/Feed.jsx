import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState(new Set())

  useEffect(() => {
    axios
      .get('/posts')
      .then((res) => {
        setPosts(res.data.posts)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <section className="feed-section" id="feed-page">
        <div className="feed-header">
          <h1>Your Gallery</h1>
          <p>Cloud-powered images from ImageKit</p>
        </div>
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-image" />
              <div className="skeleton-body">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return (
      <section className="feed-section" id="feed-page">
        <div className="feed-header">
          <h1>Your Gallery</h1>
          <p>Cloud-powered images from ImageKit</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h2>No posts yet</h2>
          <p>Upload your first image to start building your gallery</p>
          <Link to="/create-post" className="cta-btn" id="empty-cta-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create Your First Post
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="feed-section" id="feed-page">
      <div className="feed-header">
        <h1>Your Gallery</h1>
        <p>Cloud-powered images from ImageKit</p>
        <div className="post-count">
          <span className="dot"></span>
          {posts.length} {posts.length === 1 ? 'image' : 'images'} in cloud
        </div>
      </div>

      <div className="posts-grid" id="posts-grid">
        {posts.map((post) => (
          <article className="post-card" key={post._id} id={`post-${post._id}`}>
            <div className="post-card-image">
              <img src={post.image} alt={post.caption || 'Uploaded image'} loading="lazy" />
              <div className="image-overlay" />
            </div>
            <div className="post-card-body">
              <p className="post-card-caption">{post.caption}</p>
            </div>
            <div className="post-card-footer">
              <div className="post-card-meta">
                {post.user && (
                  <div className="post-card-author">
                    <div className="post-author-avatar">
                      {post.user.fullName ? post.user.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="post-author-name">{post.user.fullName || 'Unknown'}</span>
                  </div>
                )}
                <div className="post-card-cloud-tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Cloud stored
                </div>
              </div>
              <button
                className={`like-btn ${likedPosts.has(post._id) ? 'liked' : ''}`}
                onClick={() => toggleLike(post._id)}
                aria-label="Like post"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={likedPosts.has(post._id) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Feed