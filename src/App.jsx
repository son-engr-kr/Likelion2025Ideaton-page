import { Routes, Route } from 'react-router-dom'
import './App.css'

const UI_SECTIONS = [
  {
    id: 1,
    title: '메인 화면',
    description: '가나다라마바사사',
    image: '/images/ui-1.png'
  },
  {
    id: 2,
    title: '기능 소개',
    description: '기능1',
    image: '/images/ui-2.png'
  },
  {
    id: 3,
    title: '상세 페이지',
    description: '상세상세 사사삭',
    image: '/images/ui-3.png'
  }
]

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="landing-page">
          <header className="header">
            <h1 className="main-title">2025 아이디어톤</h1>
            <p className="subtitle">서브 타이틀틀</p>
          </header>

          <section className="intro-section">
            <p className="intro-text">
              소개소개 소개소개<br />
              소개소개 소개소개
            </p>
          </section>

          <section className="ui-sections">
            {UI_SECTIONS.map((section, index) => (
              <div 
                key={section.id} 
                className={`ui-section ${index % 2 === 0 ? 'left-image' : 'right-image'}`}
              >
                <div className="ui-image-wrapper">
                  <img 
                    src={section.image} 
                    alt={section.title}
                    className="ui-image"
                  />
                </div>
                <div className="ui-content">
                  <h2 className="ui-title">{section.title}</h2>
                  <p className="ui-description">{section.description}</p>
                </div>
              </div>
            ))}
          </section>

          <footer className="footer">
            <p>© 2025 팀 이름. All rights reserved.</p>
          </footer>
        </div>
      } />
    </Routes>
  )
}

export default App
