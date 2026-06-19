import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import './App.css';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  
  // Backend Health States
  const [healthStatus, setHealthStatus] = useState('loading'); // 'loading', 'online', 'offline'
  const [healthMessage, setHealthMessage] = useState('Checking backend status...');
  const [checkTrigger, setCheckTrigger] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  //  handler
  const onSubmit = (data) => {
    setIsSubmittingForm(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmittingForm(false);
      setIsLoggedIn(true);
      setUserEmail(data.email);
      reset(); // clear form inputs
    }, 1200);
  };

  //  Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    setHealthStatus('loading');
    setHealthMessage('Fetching health status from backend...');

    fetch('http://localhost:8080/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setHealthStatus('online');
        setHealthMessage(data.message || 'Backend is healthy');
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setHealthStatus('offline');
        setHealthMessage('Could not connect to backend. Make sure it is running on port 8080.');
      });
  }, [isLoggedIn, checkTrigger]);

  const triggerHealthCheck = () => {
    setCheckTrigger((prev) => prev + 1);
  };

  return (
    <main className="card">
      {!isLoggedIn ? (
        /* Login Card */
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="brand">
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                {...register('email')}
                disabled={isSubmittingForm}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`form-input ${errors.password ? 'error' : ''}`}
                {...register('password')}
                disabled={isSubmittingForm}
              />
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmittingForm}
          >
            {isSubmittingForm ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      ) : (
        /* Logged In Dashboard Card */
        <div>
          <div className="success-header">
            <div className="success-icon">✓</div>
            <h2>Sign In Successful</h2>
            <p>Static authentication complete</p>
          </div>

          <div className="user-badge">
            <div className="user-badge-title">Logged In As</div>
            <div className="user-badge-value">{userEmail}</div>
          </div>

          {/* Health Check Widget */}
          <div className="health-box">
            <div className="health-header">
              <span className="health-title">Backend Status</span>
              <span
                className={`health-status-badge ${
                  healthStatus === 'online'
                    ? 'online'
                    : healthStatus === 'offline'
                    ? 'offline'
                    : 'loading'
                }`}
              >
                {healthStatus}
              </span>
            </div>
            <div className="health-details">{healthMessage}</div>
            <div className="health-btn-row">
              <button
                type="button"
                className="btn-mini"
                onClick={triggerHealthCheck}
                disabled={healthStatus === 'loading'}
              >
                Recheck
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
