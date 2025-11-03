import { Routes, Route } from 'react-router-dom'
import './App.css'

const encodeImagePath = (path) => {
  const parts = path.split('/')
  const dir = parts.slice(0, -1).join('/')
  const fileName = parts[parts.length - 1]
  return dir + '/' + encodeURIComponent(fileName)
}

const UI_SERIES = [
  {
    id: 'onboarding',
    title: '온보딩',
    description: '서비스를 시작하기 위한 초기 설정을 해주세요.',
    images: [
      encodeImagePath('/images/ui_images/Onboarding.png'),
      encodeImagePath('/images/ui_images/Onboarding2.png'),
      encodeImagePath('/images/ui_images/Onboarding3.png'),
      encodeImagePath('/images/ui_images/Onboarding4.png'),
      encodeImagePath('/images/ui_images/Onboarding5.png'),
      encodeImagePath('/images/ui_images/Onboarding6.png')
    ]
  },
  // {
  //   id: 'login',
  //   title: '로그인',
  //   description: '간편하고 안전한 로그인 화면입니다.',
  //   images: [
  //     encodeImagePath('/images/ui_images/Login.png')
  //   ]
  // },
  {
    id: 'ai-chat',
    title: 'AI 중재자',
    description: 'AI agent를 이용한 집안일 분배, 일정 조율, 중재를 제공합니다.',
    images: [
      encodeImagePath('/images/ui_images/AI Chat Interface - v2.png'),
      encodeImagePath('/images/ui_images/AI Chat Interface1.png'),
      encodeImagePath('/images/ui_images/AI Chat Interface2.png'),
      encodeImagePath('/images/ui_images/AI Chat Interface3.png'),
      encodeImagePath('/images/ui_images/AI Chat Interface4-1.png'),
      encodeImagePath('/images/ui_images/AI Chat Interface4.png'),
      encodeImagePath('/images/ui_images/AI Chat Interface5.png')
    ]
  }
]

function App() {
  const handleImageError = (e, originalSrc) => {
    console.error('Image failed to load:', originalSrc);
    const encodedSrc = originalSrc.replace(/ /g, '%20');
    if (e.target.src !== encodedSrc && e.target.src !== originalSrc) {
      console.log('Retrying with encoded path:', encodedSrc);
      e.target.src = encodedSrc;
    } else {
      console.error('All retry attempts failed');
      e.target.style.backgroundColor = '#f0f0f0';
      e.target.style.border = '2px dashed #999';
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="landing-page">
          <header className="header">
            <h1 className="main-title">2025 아이디어톤</h1>
            <p className="subtitle">혁신적인 아이디어를 현실로 만드는 여정</p>
          </header>

          <section className="intro-section">
            <p className="intro-text">
              사용자 중심의 디자인과 직관적인 인터페이스로<br />
              뛰어난 사용자 경험을 제공합니다.
            </p>
          </section>

          <section className="ui-sections">
            {UI_SERIES.map((series, index) => (
              <div 
                key={series.id} 
                className={`ui-series-section ${index % 2 === 0 ? 'left-content' : 'right-content'}`}
              >
                <div className="series-content">
                  <h2 className="series-title">{series.title}</h2>
                  <p className="series-description">{series.description}</p>
                </div>
                <div className="series-images-container">
                  <div className="series-images-track">
                    {series.images.map((img, imgIndex) => (
                      <div key={imgIndex} className="series-image-item">
                        <img 
                          src={img} 
                          alt={`${series.title} ${imgIndex + 1}`}
                          onError={(e) => handleImageError(e, img)}
                          onLoad={() => {
                            console.log('Image loaded successfully:', img);
                          }}
                        />
                      </div>
                    ))}
                    {series.images.map((img, imgIndex) => (
                      <div key={`duplicate-${imgIndex}`} className="series-image-item">
                        <img 
                          src={img} 
                          alt={`${series.title} ${imgIndex + 1}`}
                          onError={(e) => handleImageError(e, img)}
                          onLoad={() => {
                            console.log('Image loaded successfully:', img);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <footer className="footer">
            <p>© 2025 아이디어톤. All rights reserved.</p>
          </footer>
        </div>
      } />
    </Routes>
  )
}

export default App
