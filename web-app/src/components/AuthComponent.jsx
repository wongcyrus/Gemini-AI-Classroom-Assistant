import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase-config';
import './AuthComponent.css';

const AuthComponent = ({ unverifiedUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [cooldown]);

  const handleRegister = () => {
    if (!email.endsWith('@stu.vtc.edu.hk') && !email.endsWith('@vtc.edu.hk')) {
      setError('Only emails ending with @stu.vtc.edu.hk or @vtc.edu.hk are allowed.');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(userCredential.user)
          .then(() => {
            setMessage('Registration successful. A verification email has been sent. Please verify your email before logging in.');
          })
          .catch((error) => {
            setError("Error sending verification email: " + error.message);
          });
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setMessage('');
        setError('');
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-credential') {
          setError('Login failed. Please check your email and password.');
          setMessage('If you were recently added to a class, you might need to set your password first. Use the "Forgot Password" link.');
        } else {
          setError(error.message);
        }
      });
  };

  const handleResendVerificationEmail = () => {
    if (unverifiedUser && cooldown === 0) {
      sendEmailVerification(unverifiedUser)
        .then(() => {
          setMessage('A new verification email has been sent. Please check your inbox.');
          setError('');
          setCooldown(60);
        })
        .catch((error) => {
          setError('Error resending verification email: ' + error.message);
        });
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage('Password reset email sent. Please check your inbox.');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login / Register</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="button-group">
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
        <button onClick={handleForgotPassword} className="forgot-password-button">Forgot Password</button>
        {unverifiedUser && (
            <button 
              onClick={handleResendVerificationEmail} 
              disabled={cooldown > 0}
              className="resend-verification-button"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
            </button>
        )}
        <div className="message-container">
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default AuthComponent;