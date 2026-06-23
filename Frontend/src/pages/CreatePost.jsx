import React, { useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CreatePost = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [caption, setCaption] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState({ show: false, type: '', message: '' })

  const showToast = (type, message) => {
    setToast({ show: true, type, message })
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFile = () => {
    setPreview(null)
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)

      // Update file input for FormData
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!fileInputRef.current?.files[0]) {
      showToast('error', '⚠️ Please select an image first')
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append('image', fileInputRef.current.files[0])
    formData.append('caption', caption)

    try {
      await axios.post('/create-post', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      showToast('success', '✨ Post uploaded to cloud!')
      setTimeout(() => navigate('/feed'), 800)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) {
        showToast('error', '🔒 Session expired — please sign in again')
        setTimeout(() => navigate('/auth'), 1200)
      } else {
        showToast('error', '❌ Upload failed — please try again')
      }
      setIsUploading(false)
    }
  }

  return (
    <section className="create-post-section" id="create-post-page">
      <div className="create-post-container">
        <div className="page-header">
          <h1>Upload to Cloud</h1>
          <p>Share your moments — stored securely on ImageKit</p>
        </div>

        <form className="upload-card" onSubmit={handleSubmit} id="upload-form">
          {/* Drop Zone */}
          <div
            className={`drop-zone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={handleRemoveFile}
                  id="remove-image-btn"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="drop-zone-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="drop-zone-text">
                  <p>
                    Drag & drop your image or{' '}
                    <span className="highlight">browse files</span>
                  </p>
                  <p className="formats">PNG, JPG, GIF, WEBP up to 10MB</p>
                </div>
              </>
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              id="file-input"
            />
          </div>

          {/* Caption */}
          <div className="caption-input-wrapper">
            <textarea
              className="caption-input"
              name="caption"
              placeholder="Write a caption for your image..."
              required
              rows="3"
              maxLength={200}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              id="caption-input"
            />
            <span className="char-count">{caption.length}/200</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="submit-btn"
            disabled={isUploading || !preview}
            id="submit-btn"
          >
            {isUploading ? (
              <>
                <div className="spinner"></div>
                Uploading...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload to Cloud
              </>
            )}
          </button>
        </form>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`} id="toast">
        {toast.message}
      </div>
    </section>
  )
}

export default CreatePost