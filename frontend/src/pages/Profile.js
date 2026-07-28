import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Button, Input, Textarea, Alert, Spinner, Avatar } from '../components/UI';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#64748b',
];

const profileValidators = {
  name: [(v) => (!v?.trim() ? 'Name is required' : null)],
  bio: [(v) => (v && v.length > 200 ? 'Bio max 200 characters' : null)],
};

const passwordValidators = {
  current_password: [(v) => (!v ? 'Current password is required' : null)],
  new_password: [
    (v) => (!v ? 'New password is required' : null),
    (v) => (v && v.length < 6 ? 'Must be at least 6 characters' : null),
  ],
  confirm_password: [
    (v) => (!v ? 'Please confirm password' : null),
    (v, all) => (v && v !== all.new_password ? 'Passwords do not match' : null),
  ],
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [selectedColor, setSelectedColor] = useState(user?.avatar_color || COLORS[0]);

  const profileForm = useForm(
    { name: user?.name || '', bio: user?.bio || '' },
    profileValidators
  );

  const passwordForm = useForm(
    { current_password: '', new_password: '', confirm_password: '' },
    passwordValidators
  );

  useEffect(() => {
    api.get('/profile')
      .then((data) => {
        setStats(data.stats);
        profileForm.setValues({ name: data.user.name, bio: data.user.bio || '' });
        setSelectedColor(data.user.avatar_color || COLORS[0]);
      })
      .catch((err) => setProfileError(err.message))
      .finally(() => setLoadingPage(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = profileForm.handleSubmit(async (vals) => {
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const data = await api.put('/profile', {
        name: vals.name.trim(),
        bio: vals.bio.trim(),
        avatar_color: selectedColor,
      });
      updateUser(data.user);
      setProfileSuccess('Profile updated!');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  });

  const onChangePassword = passwordForm.handleSubmit(async (vals) => {
    setPasswordError('');
    setPasswordSuccess('');
    setSavingPassword(true);
    try {
      await api.put('/profile/password', {
        current_password: vals.current_password,
        new_password: vals.new_password,
      });
      setPasswordSuccess('Password changed successfully!');
      passwordForm.reset();
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  });

  if (loadingPage) {
    return <div className="center-spinner"><Spinner size="lg" /></div>;
  }

  return (
    <div className="page animate-fade-in">
      <div className="page__header">
        <h2 className="page__title">Profile</h2>
      </div>

      <div className="profile-grid">
        {/* Stats card */}
        <div className="profile-avatar-card">
          <Avatar name={user?.name} color={selectedColor} size={80} />
          <h3 className="profile-avatar-card__name">{user?.name}</h3>
          <p className="profile-avatar-card__email">{user?.email}</p>
          {stats && (
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat__value">{stats.todos}</span>
                <span className="profile-stat__label">Tasks</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat__value">{stats.posts}</span>
                <span className="profile-stat__label">Posts</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit profile */}
        <div className="card">
          <h3 className="card__title">Edit Profile</h3>

          {profileSuccess && <Alert type="success" onDismiss={() => setProfileSuccess('')}>{profileSuccess}</Alert>}
          {profileError && <Alert onDismiss={() => setProfileError('')}>{profileError}</Alert>}

          <form onSubmit={onSaveProfile} noValidate>
            <Input
              id="name"
              label="Full Name"
              type="text"
              name="name"
              value={profileForm.values.name}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={profileForm.errors.name}
              touched={profileForm.touched.name}
            />
            <Textarea
              id="bio"
              label="Bio"
              name="bio"
              placeholder="Tell us about yourself…"
              value={profileForm.values.bio}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={profileForm.errors.bio}
              touched={profileForm.touched.bio}
              rows={3}
            />

            <div className="color-picker">
              <label className="field__label">Avatar Color</label>
              <div className="color-picker__swatches">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${selectedColor === color ? 'color-swatch--selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" loading={savingProfile}>
              Save Changes
            </Button>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <h3 className="card__title">Change Password</h3>

          {passwordSuccess && <Alert type="success" onDismiss={() => setPasswordSuccess('')}>{passwordSuccess}</Alert>}
          {passwordError && <Alert onDismiss={() => setPasswordError('')}>{passwordError}</Alert>}

          <form onSubmit={onChangePassword} noValidate>
            <Input
              id="current_password"
              label="Current Password"
              type="password"
              name="current_password"
              placeholder="••••••••"
              value={passwordForm.values.current_password}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.errors.current_password}
              touched={passwordForm.touched.current_password}
              autoComplete="current-password"
            />
            <Input
              id="new_password"
              label="New Password"
              type="password"
              name="new_password"
              placeholder="At least 6 characters"
              value={passwordForm.values.new_password}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.errors.new_password}
              touched={passwordForm.touched.new_password}
              autoComplete="new-password"
            />
            <Input
              id="confirm_password"
              label="Confirm New Password"
              type="password"
              name="confirm_password"
              placeholder="Repeat new password"
              value={passwordForm.values.confirm_password}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.errors.confirm_password}
              touched={passwordForm.touched.confirm_password}
              autoComplete="new-password"
            />
            <Button type="submit" loading={savingPassword} variant="secondary">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
