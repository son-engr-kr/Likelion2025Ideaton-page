import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import './App.css'

const encodeImagePath = (path) => {
  const parts = path.split('/')
  const dir = parts.slice(0, -1).join('/')
  const fileName = parts[parts.length - 1]
  const baseUrl = import.meta.env.BASE_URL
  const cleanDir = dir.startsWith('/') ? dir.slice(1) : dir
  return baseUrl + cleanDir + '/' + encodeURIComponent(fileName)
}

const UI_SERIES = [
  {
    id: 'onboarding',
    title: '온보딩',
    description: '서비스를 시작하기 위한 초기 설정을 해주세요.',
    images: [
      { src: encodeImagePath('/images/ui_images/Onboarding.png'), caption: '온보딩 시작 화면' },
      { src: encodeImagePath('/images/ui_images/Onboarding2.png'), caption: '서비스 소개' },
      { src: encodeImagePath('/images/ui_images/Onboarding3.png'), caption: '주요 기능 안내' },
      { src: encodeImagePath('/images/ui_images/Onboarding4.png'), caption: '사용자 가이드' },
      { src: encodeImagePath('/images/ui_images/Onboarding5.png'), caption: '설정 완료' },
      { src: encodeImagePath('/images/ui_images/Onboarding6.png'), caption: '환영 화면' }
    ]
  },
  {
    id: 'ai-chat',
    title: 'AI 중재자',
    description: 'AI agent를 이용한 집안일 분배, 일정 조율, 중재를 제공합니다.',
    images: [
      { src: encodeImagePath('/images/ui_images/AI Chat Interface - v2.png'), caption: 'AI 채팅 메인 화면' },
      { src: encodeImagePath('/images/ui_images/AI Chat Interface1.png'), caption: '대화 시작' },
      { src: encodeImagePath('/images/ui_images/AI Chat Interface2.png'), caption: '집안일 분배 중' },
      { src: encodeImagePath('/images/ui_images/AI Chat Interface3.png'), caption: '일정 조율 화면' },
      { src: encodeImagePath('/images/ui_images/AI Chat Interface4-1.png'), caption: '중재 진행 중' },
      { src: encodeImagePath('/images/ui_images/AI Chat Interface4.png'), caption: '결과 확인' },
      { src: encodeImagePath('/images/ui_images/AI Chat Interface5.png'), caption: '완료된 작업' }
    ]
  }
]

function ImageItem({ image, seriesTitle, imgIndex, containerRef }) {
  const itemRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const lastShownTimeRef = useRef(0)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    if (!containerRef || !itemRef.current) return

    const checkPosition = () => {
      if (!containerRef || !itemRef.current) return

      const container = containerRef
      const item = itemRef.current
      
      const containerRect = container.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      
      const containerCenter = containerRect.left + containerRect.width / 2
      const itemCenter = itemRect.left + itemRect.width / 2
      
      const distance = Math.abs(containerCenter - itemCenter)
      const threshold = containerRect.width * 0.3
      
      const now = Date.now()
      const timeSinceLastShow = now - lastShownTimeRef.current
      
      if (distance < threshold && timeSinceLastShow > 6000 && !isAnimatingRef.current) {
        setIsVisible(true)
        lastShownTimeRef.current = now
        isAnimatingRef.current = true
        
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            isAnimatingRef.current = false
          }, 500)
        }, 5000)
      } else if (distance >= threshold * 1.5) {
        if (isAnimatingRef.current) {
          setIsVisible(false)
          isAnimatingRef.current = false
        }
      }
    }

    const interval = setInterval(checkPosition, 100)
    return () => clearInterval(interval)
  }, [containerRef])

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
    <div ref={itemRef} className="series-image-item">
      <img 
        src={image.src} 
        alt={`${seriesTitle} ${imgIndex + 1}`}
        onError={(e) => handleImageError(e, image.src)}
      />
      {image.caption && (
        <div className={`image-caption ${isVisible ? 'visible' : ''}`}>
          {image.caption}
        </div>
      )}
    </div>
  )
}

function App() {
  const containerRefs = useRef({})

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
                <div 
                  ref={(el) => containerRefs.current[series.id] = el}
                  className="series-images-container"
                >
                  <div className="series-images-track">
                    {series.images.map((img, imgIndex) => (
                      <ImageItem
                        key={imgIndex}
                        image={img}
                        seriesTitle={series.title}
                        imgIndex={imgIndex}
                        containerRef={containerRefs.current[series.id]}
                      />
                    ))}
                    {series.images.map((img, imgIndex) => (
                      <ImageItem
                        key={`duplicate-${imgIndex}`}
                        image={img}
                        seriesTitle={series.title}
                        imgIndex={imgIndex}
                        containerRef={containerRefs.current[series.id]}
                      />
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
