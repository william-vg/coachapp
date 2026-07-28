import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Button, Input, Alert } from '../components/UI';

const validators = {
  email: [
    (v) => (!v ? 'Email is required' : null),
    (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email' : null),
  ],
  password: [(v) => (!v ? 'Password is required' : null)],
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '', password: '' },
    validators
  );

  const onSubmit = handleSubmit(async (vals) => {
    setServerError('');
    setLoading(true);
    try {
      await login(vals.email, vals.password);
      navigate('/todos');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-card__header">
          <h1 className="auth-card__title">⚡ CoachApp</h1>
          <p className="auth-card__subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {serverError && (
            <Alert onDismiss={() => setServerError('')}>{serverError}</Alert>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            autoComplete="email"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading} className="btn--full">
            Sign In
          </Button>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register" className="link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
