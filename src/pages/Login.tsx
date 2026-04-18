import { useState } from 'react'
import '../styles/Login.css'

interface LoginProps {
  onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // シミュレート認証
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1500)
  }

  return (
    <div className="login-container">
      {/* 背景アニメーション */}
      <div className="login-bg-grid"></div>
      <div className="login-glow login-glow-1"></div>
      <div className="login-glow login-glow-2"></div>
      <div className="login-glow login-glow-3"></div>

      {/* ログインカード */}
      <div className="login-card">
        {/* タイトル */}
        <div className="login-header">
          <div className="login-icon-wrapper">
            <svg className="login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="login-title">京都AI交通センター</h1>
        </div>

        {/* ログインフォーム */}
        <div className="login-form-card">
          <form onSubmit={handleSubmit} className="login-form">
            {/* ユーザー名 */}
            <div className="login-input-group">
              <label className="login-label">ユーザー名</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* パスワード */}
            <div className="login-input-group">
              <label className="login-label">パスワード</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? (
                <span className="login-button-loading">
                  <svg className="login-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  認証中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>
        </div>

        {/* フッター */}
        <div className="login-footer">
          <p>© 2025 京都AI交通センター ダッシュボード</p>
          <p>Powered by AI & Smart City Technology</p>
        </div>
      </div>
    </div>
  )
}

export default Login
