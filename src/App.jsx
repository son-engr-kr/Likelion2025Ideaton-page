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
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (!containerRef || !itemRef.current) {
      return
    }

    const checkPosition = () => {
      if (!containerRef || !itemRef.current) return

      const container = containerRef
      const item = itemRef.current
      
      const containerRect = container.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      
      if (containerRect.width === 0) return
      
      const containerCenterX = containerRect.left + containerRect.width / 2
      const itemCenterX = itemRect.left + itemRect.width / 2
      
      const distance = Math.abs(containerCenterX - itemCenterX)
      const threshold = containerRect.width * 0.8
      
      let newOpacity = 0
      
      if (distance < threshold) {
        const normalizedDistance = distance / threshold
        newOpacity = Math.max(0, 1 - normalizedDistance)
        newOpacity = Math.pow(newOpacity, 1.1)
      }
      
      setOpacity(newOpacity)
    }

    checkPosition()
    const interval = setInterval(checkPosition, 50)
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
        <>
          <div className="image-caption-fixed">
            {image.caption}
          </div>
          <div 
            className="image-caption"
            style={{ opacity }}
          >
            {image.caption}
          </div>
        </>
      )}
    </div>
  )
}

function App() {
  const containerRefs = useRef({})
  const trackRefs = useRef({})

  // Generate dynamic keyframes for each series
  useEffect(() => {
    const initAnimations = () => {
      UI_SERIES.forEach((series) => {
        const imageCount = series.images.length
        if (imageCount <= 1) return

        const trackElement = trackRefs.current[series.id]
        const containerElement = containerRefs.current[series.id]
        
        if (!trackElement || !containerElement) {
          return
        }

        // Check if images are loaded
        const imageItems = trackElement.querySelectorAll('.series-image-item img')
        const allLoaded = Array.from(imageItems).every(img => img.complete && img.naturalHeight !== 0)
        
        if (!allLoaded && imageItems.length > 0) {
          // Wait for images to load
          const loadPromises = Array.from(imageItems).map(img => {
            if (img.complete) return Promise.resolve()
            return new Promise(resolve => {
              img.addEventListener('load', resolve, { once: true })
              img.addEventListener('error', resolve, { once: true })
            })
          })
          
          Promise.all(loadPromises).then(() => {
            setTimeout(() => {
              createAnimationForSeries(series, trackElement, containerElement)
            }, 100)
          })
        } else {
          setTimeout(() => {
            createAnimationForSeries(series, trackElement, containerElement)
          }, 100)
        }
      })
    }

    // Initial call
    initAnimations()

    // Recreate animations on window resize
    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        initAnimations()
      }, 250)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  const createAnimationForSeries = (series, trackElement, containerElement) => {
    const imageCount = series.images.length
    const allImageItems = Array.from(trackElement.querySelectorAll('.series-image-item'))
    const originalImageItems = allImageItems.slice(0, imageCount)

    if (originalImageItems.length === 0) return

    const animationName = `scroll-horizontal-${series.id}`
    const styleId = `keyframes-${series.id}`
    
    // Remove existing style if any
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    // Reset height before recalculating to avoid stale values
    containerElement.style.height = 'auto'

    // Measure actual positions relative to container width
    const positions = []
    let containerWidth = containerElement.getBoundingClientRect().width

    console.log(`Container initial width: ${containerWidth}`)

    // Calculate container height based on image aspect ratio
    const firstImage = originalImageItems[0].querySelector('img')
    if (firstImage && firstImage.naturalWidth > 0 && firstImage.naturalHeight > 0) {
      const imageAspectRatio = firstImage.naturalHeight / firstImage.naturalWidth
      const calculatedHeight = containerWidth * imageAspectRatio
      
      // Set container height to match image aspect ratio
      containerElement.style.height = `${calculatedHeight}px`
      
      // Re-measure container width after height adjustment (in case of layout shifts)
      containerWidth = containerElement.getBoundingClientRect().width
      console.log(`Container after height set: ${containerWidth}`)
    }
    
    // Set container width as CSS variable for relative calculations
    containerElement.style.setProperty('--container-width', `${containerWidth}px`)

    // Calculate positions for all images including duplicate
    // We want to translate the track so each image appears centered
    // When image i is centered: track.translateX = (containerWidth/2) - (item[i].left + item[i].width/2)
    allImageItems.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect()
      const containerRect = containerElement.getBoundingClientRect()
      
      // Calculate item position relative to container
      const itemLeft = item.offsetLeft
      const itemWidth = itemRect.width
      
      // To center this item in the container:
      // itemCenter should be at containerCenter
      // itemCenter (in track coords) = itemLeft + itemWidth/2
      // After translateX: itemCenter + translateX = containerCenter
      // Therefore: translateX = containerCenter - itemCenter
      const itemCenter = itemLeft + itemWidth / 2
      const containerCenter = containerWidth / 2
      const translateX = containerCenter - itemCenter
      
      // Store as pixels (we'll use CSS calc with var(--container-width))
      positions.push({
        translateX: translateX,
        index,
        itemLeft,
        itemWidth,
        itemCenter,
        containerCenter,
        containerWidth
      })
    })

    // Debug: log positions
    console.log(`Series ${series.id}: containerWidth=${containerWidth}, imageCount=${imageCount}`)
    console.log(`Positions:`, positions.map(p => ({
      index: p.index,
      left: p.itemLeft,
      width: p.itemWidth,
      itemCenter: p.itemCenter.toFixed(0),
      containerCenter: p.containerCenter.toFixed(0),
      translateX: p.translateX.toFixed(0)
    })))

    if (positions.length < imageCount + 1) {
      console.warn(`Not enough positions: ${positions.length} < ${imageCount + 1}`)
      return
    }

    // Calculate keyframe percentages - each image gets equal time
    const percentPerImage = 100 / imageCount
    const holdTime = 0.7 // 70% hold
    const transitionTime = 0.3 // 30% transition

    const keyframes = []
    const transformFor = (pos) => `translateX(${pos.translateX}px)`

    // Start at first image
    keyframes.push(`0% { transform: ${transformFor(positions[0])}; }`)

    // Create keyframes for each image transition
    for (let i = 0; i < imageCount; i++) {
      const currentImagePos = positions[i]
      const nextImageIndex = i === imageCount - 1 ? imageCount : i + 1 // Last one uses duplicate
      const nextImagePos = positions[nextImageIndex]
      
      // Calculate timing for this image's cycle
      const cycleStartPercent = i * percentPerImage
      const holdEndPercent = cycleStartPercent + (percentPerImage * holdTime)
      const transitionEndPercent = (i + 1) * percentPerImage
      
      // Hold on current image
      if (i > 0) {
        // For images after first, add keyframe at cycle start (should match previous cycle end)
        keyframes.push(`${cycleStartPercent.toFixed(2)}% { transform: ${transformFor(currentImagePos)}; }`)
      }
      
      // Hold until it's time to transition
      keyframes.push(`${holdEndPercent.toFixed(2)}% { transform: ${transformFor(currentImagePos)}; }`)
      
      // Transition to next image
      keyframes.push(`${transitionEndPercent.toFixed(2)}% { transform: ${transformFor(nextImagePos)}; }`)
    }
    
    // Create style element
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes ${animationName} {
        ${keyframes.join('\n        ')}
      }
      .series-images-track-${series.id} {
        animation: ${animationName} ${imageCount * 4}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
    `
    document.head.appendChild(style)

    // Restart animation to apply updated keyframes
    const animatedClass = `series-images-track-${series.id}`
    trackElement.classList.remove(animatedClass)
    // Force reflow so the removal takes effect
    void trackElement.offsetWidth
    trackElement.classList.add(animatedClass)
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="landing-page">
          <header className="header">
            <h1 className="main-title">이름 정해야 하는데</h1>
            <p className="subtitle">서브타이틀도 정해야 하는데데</p>
          </header>

          <section className="intro-section">
            <p className="intro-text">
              여기에다가는 뭘 적을까요<br />
              뭔가 적기는 해야하는데..
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
                  <div 
                    ref={(el) => trackRefs.current[series.id] = el}
                    className={`series-images-track series-images-track-${series.id}`}
                  >
                    {series.images.map((img, imgIndex) => (
                      <ImageItem
                        key={imgIndex}
                        image={img}
                        seriesTitle={series.title}
                        imgIndex={imgIndex}
                        containerRef={containerRefs.current[series.id]}
                      />
                    ))}
                    {/* Duplicate first image for seamless loop */}
                    <ImageItem
                      key="loop-duplicate"
                      image={series.images[0]}
                      seriesTitle={series.title}
                      imgIndex={0}
                      containerRef={containerRefs.current[series.id]}
                    />
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
