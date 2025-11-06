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
      { 
        src: encodeImagePath('/images/ui_images/Onboarding.png'), 
        fixedCaption: '온보딩 1단계'
      },
      { 
        src: encodeImagePath('/images/ui_images/Onboarding2.png'), 
        fixedCaption: '온보딩 2단계'
      },
      { 
        src: encodeImagePath('/images/ui_images/Onboarding3.png'), 
        fixedCaption: '온보딩 3단계'
      },
      { 
        src: encodeImagePath('/images/ui_images/Onboarding4.png'), 
        fixedCaption: '온보딩 4단계'
      },
      { 
        src: encodeImagePath('/images/ui_images/Onboarding5.png'), 
        fixedCaption: '온보딩 5단계'
      },
      { 
        src: encodeImagePath('/images/ui_images/Onboarding6.png'), 
        fixedCaption: '온보딩 완료'
      }
    ]
  },
  {
    id: 'ai-chat',
    title: 'AI 중재자',
    description: 'AI agent를 이용한 집안일 분배, 일정 조율, 중재를 제공합니다.',
    images: [
      // { 
      //   src: encodeImagePath('/images/ui_images/AI Chat Interface - v2.png'), 
      //   fixedCaption: 'AI 채팅 메인'
      // },
      { 
        src: encodeImagePath('/images/ui_images/AI Chat Interface1.png'), 
        fixedCaption: '대화 시작'
      },
      { 
        src: encodeImagePath('/images/ui_images/AI Chat Interface2.png'), 
        fixedCaption: '집안일 분배'
      },
      { 
        src: encodeImagePath('/images/ui_images/AI Chat Interface3.png'), 
        fixedCaption: '일정 조율'
      },
      // { 
      //   src: encodeImagePath('/images/ui_images/AI Chat Interface4-1.png'), 
      //   fixedCaption: '중재 진행'
      // },
      { 
        src: encodeImagePath('/images/ui_images/AI Chat Interface4.png'), 
        fixedCaption: '결과 확인'
      },
      {
        src: encodeImagePath('/images/ui_images/AI Chat Interface5.png'),
        fixedCaption: '완료'
      }
    ]
  },
  {
    id: 'alarm',
    title: '알림',
    description: '중요한 일정과 집안일을 놓치지 않도록 스마트 알림을 제공합니다.',
    images: [
      {
        src: encodeImagePath('/images/ui_images/Alarm.png'),
        fixedCaption: '알림 메인'
      },
      {
        src: encodeImagePath('/images/ui_images/Alarm2.png'),
        fixedCaption: '중요 정산'
      },
      {
        src: encodeImagePath('/images/ui_images/Alarm3.png'),
        fixedCaption: '공용 물품 정산'
      },
      {
        src: encodeImagePath('/images/ui_images/Alarm4.png'),
        fixedCaption: '일정 제안'
      }
    ]
  },
  {
    id: 'schedule-integration',
    title: '일정 통합',
    description: '룸메이트들의 일정을 한눈에 확인하고 조율할 수 있습니다.',
    images: [
      {
        src: encodeImagePath('/images/ui_images/Schedule Integration.png'),
        fixedCaption: '통합 일정'
      }
    ]
  },
  {
    id: 'supplies-tracker',
    title: '생필품 관리',
    description: '생필품 재고를 추적하고 자동으로 구매 알림을 받으세요.',
    images: [
      {
        src: encodeImagePath('/images/ui_images/Supplies Tracker.png'),
        fixedCaption: '생필품 추적'
      }
    ]
  }
]

function ImageItem({ image, seriesTitle, imgIndex }) {
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
    <div className="series-image-item">
      <img 
        src={image.src} 
        alt={`${seriesTitle} ${imgIndex + 1}`}
        onError={(e) => handleImageError(e, image.src)}
      />
      {image.fixedCaption && (
        <div className="image-caption-fixed">
          {image.fixedCaption}
        </div>
      )}
    </div>
  )
}

function App() {
  const containerRefs = useRef({})
  const trackRefs = useRef({})
  const sectionRefs = useRef({})
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const scrollProgressRef = useRef({})
  const isScrollingThroughImages = useRef({})
  const touchStartY = useRef(null)
  const touchStartScrollY = useRef(null)
  const activeTouchSeriesId = useRef(null)

  // Initialize scroll progress for each series
  useEffect(() => {
    UI_SERIES.forEach((series) => {
      if (!scrollProgressRef.current[series.id]) {
        scrollProgressRef.current[series.id] = 0
      }
      if (!isScrollingThroughImages.current[series.id]) {
        isScrollingThroughImages.current[series.id] = false
      }
      setCurrentImageIndex(prev => ({
        ...prev,
        [series.id]: 0
      }))
    })
  }, [])

  // Handle scroll-based image navigation
  useEffect(() => {
    const handleWheel = (e) => {
      // Find which section we're currently viewing
      let targetSection = null
      let targetSeriesId = null

      for (const series of UI_SERIES) {
        const section = sectionRefs.current[series.id]
        if (!section) continue

        const rect = section.getBoundingClientRect()
        const viewportMiddle = window.innerHeight / 2

        // Check if section is in the middle of viewport
        if (rect.top < viewportMiddle && rect.bottom > viewportMiddle) {
          targetSection = section
          targetSeriesId = series.id
          break
        }
      }

      if (!targetSection || !targetSeriesId) return

      const series = UI_SERIES.find(s => s.id === targetSeriesId)
      if (!series || series.images.length <= 1) return

      const imageCount = series.images.length
      const currentIndex = currentImageIndex[targetSeriesId] || 0

      // Check if we're at the boundaries
      const isAtStart = currentIndex === 0 && e.deltaY < 0
      const isAtEnd = currentIndex === imageCount - 1 && e.deltaY > 0

      // If at boundaries, allow normal scroll
      if (isAtStart || isAtEnd) {
        isScrollingThroughImages.current[targetSeriesId] = false
        return
      }

      // We're in the middle of images, prevent scroll and change image
      e.preventDefault()
      isScrollingThroughImages.current[targetSeriesId] = true

      const scrollDelta = e.deltaY
      const scrollThreshold = 100 // Pixels needed to change image

      // Update scroll progress
      scrollProgressRef.current[targetSeriesId] =
        (scrollProgressRef.current[targetSeriesId] || 0) + scrollDelta

      // Check if we should change image
      if (Math.abs(scrollProgressRef.current[targetSeriesId]) >= scrollThreshold) {
        const direction = scrollProgressRef.current[targetSeriesId] > 0 ? 1 : -1
        const newIndex = Math.max(0, Math.min(imageCount - 1, currentIndex + direction))

        setCurrentImageIndex(prev => ({
          ...prev,
          [targetSeriesId]: newIndex
        }))

        // Reset scroll progress
        scrollProgressRef.current[targetSeriesId] = 0
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [currentImageIndex])

  // Handle touch-based image navigation for mobile
  useEffect(() => {
    const findActiveSection = () => {
      for (const series of UI_SERIES) {
        const section = sectionRefs.current[series.id]
        if (!section) continue

        const rect = section.getBoundingClientRect()
        const viewportMiddle = window.innerHeight / 2

        if (rect.top < viewportMiddle && rect.bottom > viewportMiddle) {
          return { section, seriesId: series.id }
        }
      }
      return { section: null, seriesId: null }
    }

    const handleTouchStart = (e) => {
      const { section, seriesId } = findActiveSection()
      if (!section || !seriesId) return

      const series = UI_SERIES.find(s => s.id === seriesId)
      if (!series || series.images.length <= 1) return

      touchStartY.current = e.touches[0].clientY
      touchStartScrollY.current = window.scrollY
      activeTouchSeriesId.current = seriesId
    }

    const handleTouchMove = (e) => {
      if (touchStartY.current === null || !activeTouchSeriesId.current) return

      const targetSeriesId = activeTouchSeriesId.current
      const series = UI_SERIES.find(s => s.id === targetSeriesId)
      if (!series) return

      const imageCount = series.images.length
      const currentIndex = currentImageIndex[targetSeriesId] || 0

      const touchCurrentY = e.touches[0].clientY
      const touchDeltaY = touchStartY.current - touchCurrentY

      // Check if we're at the boundaries
      const isAtStart = currentIndex === 0 && touchDeltaY < 0
      const isAtEnd = currentIndex === imageCount - 1 && touchDeltaY > 0

      // If at boundaries, allow normal scroll
      if (isAtStart || isAtEnd) {
        isScrollingThroughImages.current[targetSeriesId] = false
        return
      }

      // We're in the middle of images, prevent default scroll behavior
      e.preventDefault()
      isScrollingThroughImages.current[targetSeriesId] = true

      const scrollThreshold = 50 // Lower threshold for touch

      // Update scroll progress
      scrollProgressRef.current[targetSeriesId] = touchDeltaY

      // Check if we should change image
      if (Math.abs(scrollProgressRef.current[targetSeriesId]) >= scrollThreshold) {
        const direction = scrollProgressRef.current[targetSeriesId] > 0 ? 1 : -1
        const newIndex = Math.max(0, Math.min(imageCount - 1, currentIndex + direction))

        if (newIndex !== currentIndex) {
          setCurrentImageIndex(prev => ({
            ...prev,
            [targetSeriesId]: newIndex
          }))

          // Reset for next swipe
          touchStartY.current = touchCurrentY
          scrollProgressRef.current[targetSeriesId] = 0
        }
      }
    }

    const handleTouchEnd = () => {
      touchStartY.current = null
      touchStartScrollY.current = null
      activeTouchSeriesId.current = null

      // Reset scroll progress for all series
      Object.keys(scrollProgressRef.current).forEach(key => {
        scrollProgressRef.current[key] = 0
      })
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentImageIndex])

  // Update image positions based on current index
  useEffect(() => {
    UI_SERIES.forEach((series) => {
      const trackElement = trackRefs.current[series.id]
      const containerElement = containerRefs.current[series.id]

      if (!trackElement || !containerElement) return

      const imageCount = series.images.length

      // For single image, reset transform and let CSS center it
      if (imageCount <= 1) {
        trackElement.style.transform = 'none'
        return
      }

      const currentIndex = currentImageIndex[series.id] || 0

      // Calculate position
      const allImageItems = Array.from(trackElement.querySelectorAll('.series-image-item'))
      const targetItem = allImageItems[currentIndex]

      if (!targetItem) return

      const containerWidth = containerElement.getBoundingClientRect().width
      const itemLeft = targetItem.offsetLeft
      const itemWidth = targetItem.getBoundingClientRect().width

      const itemCenter = itemLeft + itemWidth / 2
      const containerCenter = containerWidth / 2
      const translateX = containerCenter - itemCenter

      trackElement.style.transform = `translateX(${translateX}px)`
      trackElement.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    })
  }, [currentImageIndex])

  // Set container heights based on image aspect ratios
  useEffect(() => {
    const initContainers = () => {
      UI_SERIES.forEach((series) => {
        const containerElement = containerRefs.current[series.id]
        const trackElement = trackRefs.current[series.id]

        if (!containerElement || !trackElement) return

        const firstImageItem = trackElement.querySelector('.series-image-item img')
        if (!firstImageItem) return

        const setupHeight = () => {
          if (firstImageItem.naturalWidth > 0 && firstImageItem.naturalHeight > 0) {
            const containerWidth = containerElement.getBoundingClientRect().width
            const imageAspectRatio = firstImageItem.naturalHeight / firstImageItem.naturalWidth
            const calculatedHeight = containerWidth * imageAspectRatio
            const maxHeight = window.innerHeight * 0.8

            const finalHeight = Math.min(calculatedHeight, maxHeight)
            containerElement.style.height = `${finalHeight}px`
          }
        }

        if (firstImageItem.complete) {
          setupHeight()
        } else {
          firstImageItem.addEventListener('load', setupHeight, { once: true })
        }
      })
    }

    initContainers()

    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        initContainers()
      }, 250)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])


  return (
    <Routes>
      <Route path="/" element={
        <div className="landing-page">
          <header className="header">
            <h1 className="main-title">Cohabit AI</h1>
            <p className="subtitle">AI 매니저와 함께하는 룸메이트 생활</p>
          </header>

          <section className="intro-section">
            <p className="intro-text">
            "누가 청소 할 차례였지?"<br />
            "룸메이트가 집 월세를 빨리 보내줘야 하는데.."<br /><br />
            더 이상 고민하지 마세요.<br />
            Cohabit AI가 공정하게 조율해드립니다.
            </p>
          </section>

          <section className="demo-section">
            <a
              href="https://www.figma.com/proto/rOIwsaHrhGJVnF8B8epnqG/Likelion2025ideaton?node-id=59-5758&t=5BJcwwNiMJae0aoO-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=59%3A5758"
              target="_blank"
              rel="noopener noreferrer"
              className="demo-link-button"
            >
              데모 버전 체험하기
            </a>
          </section>

          <section className="ui-sections">
            {UI_SERIES.map((series, index) => (
              <div
                key={series.id}
                ref={(el) => sectionRefs.current[series.id] = el}
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
                  <div
                    ref={(el) => trackRefs.current[series.id] = el}
                    className="series-images-track"
                  >
                    {series.images.map((img, imgIndex) => (
                      <ImageItem
                        key={imgIndex}
                        image={img}
                        seriesTitle={series.title}
                        imgIndex={imgIndex}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <footer className="footer">
            <a
              href="https://www.figma.com/proto/rOIwsaHrhGJVnF8B8epnqG/Likelion2025ideaton?node-id=59-5758&t=5BJcwwNiMJae0aoO-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=59%3A5758"
              target="_blank"
              rel="noopener noreferrer"
              className="demo-link-button"
            >
              데모 버전 체험하기
            </a>
            <p>© 2025 Team 노새. All rights reserved.</p>
          </footer>
        </div>
      } />
    </Routes>
  )
}

export default App
