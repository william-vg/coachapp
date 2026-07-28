import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Button, Input, Alert } from '../components/UI';

const validators = {
  name: [(v) => (!v?.trim() ? 'Name is required' : null)],
  email: [
    (v) => (!v ? 'Email is required' : null),
    (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email' : null),
  ],
  password: [
    (v) => (!v ? 'Password is required' : null),
    (v) => (v && v.length < 6 ? 'Password must be at least 6 characters' : null),
  ],
  confirm: [
    (v) => (!v ? 'Please confirm your password' : null),
    (v, all) => (v && v !== all.password ? 'Passwords do not match' : null),
  ],
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { name: '', email: '', password: '', confirm: '' },
    validators
  );

  const onSubmit = handleSubmit(async (vals) => {
    setServerError('');
    setLoading(true);
    try {
      await register(vals.name, vals.email, vals.password);
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
          <p className="auth-card__subtitle">Create your account</p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {serverError && (
            <Alert onDismiss={() => setServerError('')}>{serverError}</Alert>
          )}

          <Input
            id="name"
            label="Full Name"
            type="text"
            name="name"
            placeholder="Jane Smith"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            autoComplete="name"
          />

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
            placeholder="At least 6 characters"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            autoComplete="new-password"
          />

          <Input
            id="confirm"
            label="Confirm Password"
            type="password"
            name="confirm"
            placeholder="Repeat password"
            value={values.confirm}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirm}
            touched={touched.confirm}
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="btn--full">
            Create Account
          </Button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
