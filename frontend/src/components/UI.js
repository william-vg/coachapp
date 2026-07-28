import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  const px = sizes[size] || 24;
  return (
    <span
      className={`spinner ${className}`}
      style={{ width: px, height: px }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Button({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size="sm" className="btn__spinner" /> : null}
      <span className={loading ? 'btn__text--loading' : ''}>{children}</span>
    </button>
  );
}

export function Input({
  label,
  error,
  touched,
  id,
  className = '',
  ...props
}) {
  const showError = touched && error;
  return (
    <div className={`field ${showError ? 'field--error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <input
        id={id}
        className={`field__input ${showError ? 'field__input--error' : ''}`}
        aria-describedby={showError ? `${id}-error` : undefined}
        aria-invalid={showError ? 'true' : undefined}
        {...props}
      />
      {showError && (
        <span id={`${id}-error`} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  touched,
  id,
  className = '',
  ...props
}) {
  const showError = touched && error;
  return (
    <div className={`field ${showError ? 'field--error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <textarea
        id={id}
        className={`field__input field__textarea ${showError ? 'field__input--error' : ''}`}
        aria-describedby={showError ? `${id}-error` : undefined}
        aria-invalid={showError ? 'true' : undefined}
        {...props}
      />
      {showError && (
        <span id={`${id}-error`} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function Alert({ type = 'error', children, onDismiss }) {
  if (!children) return null;
  return (
    <div className={`alert alert--${type}`} role="alert">
      <span>{children}</span>
      {onDismiss && (
        <button className="alert__close" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

export function Avatar({ name = '', color = '#6366f1', size = 40 }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  return (
    <span
      className="avatar"
      style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
