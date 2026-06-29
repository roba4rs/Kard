import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleEmailAuth = async () => {
    setLoading(true)
    setError(null)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    })
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo / Brand */}
        <div style={brandStyle}>
          <span style={logoStyle}>K</span>
          <span style={logoTextStyle}>ard</span>
        </div>

        <p style={subtitleStyle}>
          {isSignUp ? 'Create your digital card' : 'Welcome back'}
        </p>

        {/* Google OAuth */}
        <button onClick={handleGoogle} style={googleBtnStyle}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div style={dividerStyle}>
          <span style={dividerLineStyle} />
          <span style={dividerTextStyle}>or</span>
          <span style={dividerLineStyle} />
        </div>

        {/* Email + Password */}
        <div style={fieldGroupStyle}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#22c55e'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#22c55e'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
          />
        </div>

        {error && (
          <p style={errorStyle}>{error}</p>
        )}

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          style={{ ...primaryBtnStyle, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        <p style={toggleStyle}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => { setIsSignUp(!isSignUp); setError(null) }} style={toggleLinkStyle}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  )
}

/* ── Styles ─────────────────────────────────────────────── */

const pageStyle = {
  minHeight: '100vh',
  background: '#0a0a0a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const cardStyle = {
  width: '100%',
  maxWidth: 400,
  background: '#111111',
  border: '1px solid #222222',
  borderRadius: 16,
  padding: '40px 32px',
  boxSizing: 'border-box',
}

const brandStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 2,
  marginBottom: 8,
}

const logoStyle = {
  fontSize: 28,
  fontWeight: 700,
  color: '#22c55e',
  letterSpacing: '-1px',
}

const logoTextStyle = {
  fontSize: 28,
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: '-1px',
}

const subtitleStyle = {
  color: '#888888',
  fontSize: 14,
  marginBottom: 28,
  marginTop: 0,
}

const googleBtnStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '11px 16px',
  background: '#1a1a1a',
  color: '#ffffff',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  margin: '20px 0',
}

const dividerLineStyle = {
  flex: 1,
  height: 1,
  background: '#222222',
  display: 'block',
}

const dividerTextStyle = {
  color: '#555555',
  fontSize: 12,
  whiteSpace: 'nowrap',
}

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginBottom: 12,
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: '#1a1a1a',
  color: '#ffffff',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const errorStyle = {
  color: '#ef4444',
  fontSize: 13,
  marginBottom: 12,
  marginTop: 0,
}

const primaryBtnStyle = {
  width: '100%',
  padding: '11px 16px',
  background: '#22c55e',
  color: '#000000',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 4,
  boxSizing: 'border-box',
  transition: 'background 0.15s',
}

const toggleStyle = {
  textAlign: 'center',
  marginTop: 20,
  marginBottom: 0,
  color: '#555555',
  fontSize: 13,
}

const toggleLinkStyle = {
  color: '#22c55e',
  cursor: 'pointer',
  textDecoration: 'none',
  fontWeight: 500,
}