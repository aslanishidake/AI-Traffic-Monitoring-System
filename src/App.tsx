import { useState, useEffect } from 'react'
import Login from './pages/Login'
import LogisticsDashboard from './pages/LogisticsDashboard'


type PageType = 'login' | 'dashboard' | 'fullscreen-map'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState<PageType>('login')

  // 登录后跳转到 dashboard
  useEffect(() => {
    if (isLoggedIn && currentPage === 'login') {
      setCurrentPage('dashboard')
    }
  }, [isLoggedIn, currentPage])

  // 重置登录页面的字体大小
  useEffect(() => {
    if (!isLoggedIn) {
      document.documentElement.style.fontSize = '16px'
    }
  }, [isLoggedIn])

  // 暴露页面切换函数给全局
  useEffect(() => {
    ;(window as any).navigateTo = (page: PageType) => {
      console.log('页面切换:', currentPage, '->', page)
      setCurrentPage(page)
    }
  }, [currentPage])

  // 进入全屏 - 需要用户交互触发
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement
        if (elem.requestFullscreen) {
          await elem.requestFullscreen()
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen()
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen()
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen()
        }
      } catch (err) {
        console.error('全屏模式失败:', err)
      }
    }

    // 点击页面任意位置进入全屏
    const handleClick = () => {
      if (!document.fullscreenElement) {
        enterFullscreen()
      }
    }

    document.addEventListener('click', handleClick, { once: true })

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  // ESC键退出全屏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        const fullscreenElement = document.fullscreenElement ||
                                  (document as any).webkitFullscreenElement ||
                                  (document as any).mozFullScreenElement ||
                                  (document as any).msFullscreenElement

        if (fullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen()
          } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen()
          } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 调试全屏页面
  useEffect(() => {
    if (currentPage === 'fullscreen-map') {
      console.log('全屏页面激活')
      const root = document.getElementById('root')
      if (root) {
        console.log('root元素:', root)
        console.log('root的子元素数量:', root.children.length)
      }
    }
  }, [currentPage])

  // 根据当前页面渲染不同组件
  console.log('当前页面:', currentPage)

  // 使用 key 强制重新渲染，确保组件完全卸载和重新挂载
  if (currentPage === 'login') {
    return <Login key="login" onLogin={() => setIsLoggedIn(true)} />
  }

  if (currentPage === 'fullscreen-map') {
    console.log('渲染FullscreenMap组件')
    return (
      <div key="fullscreen" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: '#ff0000'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ffffff',
          fontSize: '50px',
          zIndex: 9999999
        }}>
          测试文字 - 如果看到这个说明渲染成功
        </div>
       </div>
    )
  }

  return <LogisticsDashboard key="dashboard" />
}

export default App
