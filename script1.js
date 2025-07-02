 // === Utility: Debounce Function ===
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // === Navbar Scroll Handling ===
    window.addEventListener('scroll', function() {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // === Horizontal Slider Functionality ===
    const sliderSection = document.querySelector('.slider-section');
    const slider = document.querySelector('.card-slider');
    const sliderCards = document.querySelectorAll('.slider-card');
    const sliderProgress = document.querySelector('.slider-progress');
    const sliderIndicator = document.querySelector('.slider-indicator');

    let currentSlide = 0;
    let isScrolling = false;
    let isSliderActive = false;
    const cardTransitionDuration = 1500;
    const sectionTransitionDuration = 1000;
    const scrollThreshold = 50;

    function updateSliderPosition() {
      isScrolling = true;
      const offset = -currentSlide * 100;
      slider.style.transition = `transform ${cardTransitionDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      slider.style.transform = `translateX(${offset}vw)`;
      const progress = (currentSlide / (sliderCards.length - 1)) * 100;
      sliderProgress.style.transition = `width ${cardTransitionDuration}ms ease`;
      sliderProgress.style.width = `${progress}%`;
      setTimeout(() => {
        isScrolling = false;
        slider.style.transition = 'none';
        sliderProgress.style.transition = 'none';
      }, cardTransitionDuration);
    }

    function updateSliderIndicator() {
      if (currentSlide === 0) {
        sliderIndicator.textContent = '↓';
        sliderIndicator.style.opacity = '0.8';
      } else if (currentSlide === sliderCards.length - 1) {
        sliderIndicator.textContent = '↑';
        sliderIndicator.style.opacity = '0.8';
      } else {
        sliderIndicator.textContent = '↑↓';
        sliderIndicator.style.opacity = '0.8';
      }
      setTimeout(() => {
        sliderIndicator.style.opacity = '0.3';
      }, 2000);
    }

    const sliderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            isSliderActive = true;
            sliderSection.classList.add('sticky');
          } else {
            isSliderActive = false;
            sliderSection.classList.remove('sticky');
          }
        });
      },
      { threshold: [0, 0.2, 0.5, 1], rootMargin: '0px' }
    );

    sliderObserver.observe(sliderSection);

    let lastScrollTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    // Improved touch event handling
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isSliderActive && !isSplitScrollerActive) return;
      
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      
      // Determine if this is a vertical or horizontal swipe
      const xDiff = touchStartX - touchEndX;
      const yDiff = touchStartY - touchEndY;
      
      // Horizontal swipe (for slider)
      if (isSliderActive && Math.abs(xDiff) > Math.abs(yDiff)) {
        e.preventDefault();
      }
      // Vertical swipe (for split scroller)
      else if (isSplitScrollerActive && Math.abs(yDiff) > Math.abs(xDiff)) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const xDiff = touchStartX - touchEndX;
      const yDiff = touchStartY - touchEndY;
      
      // Horizontal slider navigation
      if (isSliderActive && Math.abs(xDiff) > 50) {
        if (xDiff > 0 && currentSlide < sliderCards.length - 1) {
          // Swipe left
          currentSlide++;
        } else if (xDiff < 0 && currentSlide > 0) {
          // Swipe right
          currentSlide--;
        }
        updateSliderPosition();
        updateSliderIndicator();
      }
      
      // Vertical split scroller navigation
      else if (isSplitScrollerActive && Math.abs(yDiff) > 50) {
        if (yDiff > 0 && currentTypeIndex < coffeeTypes.length - 1) {
          // Swipe up
          const nextIndex = currentTypeIndex + 1;
          scrollToCoffeeType(nextIndex);
        } else if (yDiff < 0 && currentTypeIndex > 0) {
          // Swipe down
          const prevIndex = currentTypeIndex - 1;
          scrollToCoffeeType(prevIndex);
        }
      }
    }, { passive: true });

    const handleSliderWheel = debounce((e) => {
      if (!isSliderActive || isScrolling) return;
      e.preventDefault();
      const now = Date.now();
      const deltaTime = now - lastScrollTime;
      lastScrollTime = now;
      
      if (deltaTime > 100) {
        if (e.deltaY > 0) {
          if (currentSlide < sliderCards.length - 1) {
            currentSlide++;
            updateSliderPosition();
          } else {
            isSliderActive = false;
            sliderSection.classList.remove('sticky');
            sliderObserver.unobserve(sliderSection);
            document.querySelector('.footer').scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => sliderObserver.observe(sliderSection), sectionTransitionDuration);
          }
        } else {
          if (currentSlide > 0) {
            currentSlide--;
            updateSliderPosition();
          } else {
            isSliderActive = false;
            sliderSection.classList.remove('sticky');
            sliderObserver.unobserve(sliderSection);
            document.querySelector('.split-scroller-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => sliderObserver.observe(sliderSection), sectionTransitionDuration);
          }
        }
        updateSliderIndicator();
      }
    }, 50);

    window.addEventListener('wheel', handleSliderWheel, { passive: false });

    document.addEventListener('keydown', (e) => {
      if (!isSliderActive || isScrolling) return;
      const now = Date.now();
      if (now - lastScrollTime < sectionTransitionDuration) return;
      lastScrollTime = now;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentSlide < sliderCards.length - 1) {
          currentSlide++;
          updateSliderPosition();
        } else {
          isSliderActive = false;
          sliderSection.classList.remove('sticky');
          sliderObserver.unobserve(sliderSection);
          document.querySelector('.footer').scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => sliderObserver.observe(sliderSection), sectionTransitionDuration);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSlide > 0) {
          currentSlide--;
          updateSliderPosition();
        } else {
          isSliderActive = false;
          sliderSection.classList.remove('sticky');
          sliderObserver.unobserve(sliderSection);
          document.querySelector('.split-scroller-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => sliderObserver.observe(sliderSection), sectionTransitionDuration);
        }
      }
      updateSliderIndicator();
    });

    // === Split Scroller Functionality ===
    const splitScrollerSection = document.querySelector('.split-scroller-section');
    const typesSide = document.getElementById('typesSide');
    const detailsSide = document.getElementById('detailsSide');
    const coffeeTypes = document.querySelectorAll('.coffee-type');
    const coffeeCards = document.querySelectorAll('.coffee-card');
    const progressDots = document.querySelectorAll('.progress-dot');
    let currentTypeIndex = 0;
    let isSyncingScroll = false;
    let isSplitScrollerActive = false;

    const typeCardPositions = [];
    coffeeTypes.forEach((type, index) => {
      const firstCard = document.querySelector(`.coffee-card[data-type="${index}"]`);
      if (firstCard) {
        typeCardPositions[index] = firstCard.offsetTop;
      }
    });

    function scrollToCoffeeType(index) {
      const firstCard = document.querySelector(`.coffee-card[data-type="${index}"]`);
      if (firstCard) {
        isSyncingScroll = true;
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          updateActiveType(index);
          isSyncingScroll = false;
        }, 400);
      }
    }

    function initSplitScroller() {
      if (window.innerWidth < 992) {
        // Mobile behavior - single column
        typesSide.style.overflowY = 'auto';
        detailsSide.style.overflowY = 'auto';
        typesSide.style.scrollSnapType = 'none';
        detailsSide.style.scrollSnapType = 'none';
        
        // Make each section take full height
        document.querySelectorAll('.coffee-type, .coffee-card').forEach(el => {
          el.style.minHeight = '100vh';
        });
        
        // Disable the complex sync logic for mobile
        typesSide.removeEventListener('scroll', handleTypesScroll);
        detailsSide.removeEventListener('scroll', handleDetailsScroll);
      } else {
        // Desktop behavior - original two-panel layout
        typesSide.style.overflowY = 'scroll';
        detailsSide.style.overflowY = 'scroll';
        typesSide.style.scrollSnapType = 'y mandatory';
        detailsSide.style.scrollSnapType = 'y mandatory';
        
        // Re-enable the sync logic
        typesSide.addEventListener('scroll', handleTypesScroll);
        detailsSide.addEventListener('scroll', handleDetailsScroll);
      }
    }

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.4, root: detailsSide }
    );

    coffeeCards.forEach(card => {
      cardObserver.observe(card);
    });

    const splitScrollerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            isSplitScrollerActive = true;
            splitScrollerSection.classList.add('sticky');
            initSplitScroller();
          } else {
            isSplitScrollerActive = false;
            splitScrollerSection.classList.remove('sticky');
          }
        });
      },
      { threshold: [0, 0.2, 0.5, 1], rootMargin: '0px' }
    );

    splitScrollerObserver.observe(splitScrollerSection);

    function updateActiveType(typeIndex) {
      currentTypeIndex = parseInt(typeIndex);
      coffeeTypes.forEach((type, index) => {
        type.classList.toggle('active', index === currentTypeIndex);
      });
      progressDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentTypeIndex);
      });
    }

    const handleTypesScroll = debounce(() => {
      if (isSyncingScroll || !isSplitScrollerActive) return;
      const typesRect = typesSide.getBoundingClientRect();
      let mostVisibleType = null;
      let maxVisibility = 0;
      coffeeTypes.forEach((type, index) => {
        const typeRect = type.getBoundingClientRect();
        const visibility = Math.min(typeRect.bottom, typesRect.bottom) - 
                          Math.max(typeRect.top, typesRect.top);
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleType = index;
        }
      });
      if (mostVisibleType !== null && mostVisibleType !== currentTypeIndex) {
        isSyncingScroll = true;
        const firstCard = document.querySelector(`.coffee-card[data-type="${mostVisibleType}"]`);
        if (firstCard) {
          detailsSide.scrollTo({ top: firstCard.offsetTop, behavior: 'smooth' });
        }
        setTimeout(() => {
          updateActiveType(mostVisibleType);
          isSyncingScroll = false;
        }, 400);
      }
    }, 50);

    const handleDetailsScroll = debounce(() => {
      if (isSyncingScroll || !isSplitScrollerActive) return;
      const detailsRect = detailsSide.getBoundingClientRect();
      let mostVisibleCard = null;
      let maxVisibility = 0;
      coffeeCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const visibility = Math.min(cardRect.bottom, detailsRect.bottom) - 
                          Math.max(cardRect.top, detailsRect.top);
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleCard = card;
        }
      });
      if (mostVisibleCard) {
        const newTypeIndex = mostVisibleCard.getAttribute('data-type');
        if (parseInt(newTypeIndex) !== currentTypeIndex) {
          isSyncingScroll = true;
          coffeeTypes[newTypeIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            updateActiveType(newTypeIndex);
            isSyncingScroll = false;
          }, 400);
        }
      }
    }, 50);

    // Initialize split scroller
    initSplitScroller();
    window.addEventListener('resize', debounce(initSplitScroller, 200));

    progressDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = dot.getAttribute('data-index');
        scrollToCoffeeType(index);
      });
    });

    coffeeTypes.forEach(type => {
      type.addEventListener('click', () => {
        const index = type.getAttribute('data-index');
        scrollToCoffeeType(index);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!isSplitScrollerActive || isSyncingScroll) return;
      const now = Date.now();
      if (now - lastScrollTime < sectionTransitionDuration) return;
      lastScrollTime = now;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentTypeIndex < coffeeTypes.length - 1) {
          const nextIndex = currentTypeIndex + 1;
          scrollToCoffeeType(nextIndex);
        } else {
          isSplitScrollerActive = false;
          splitScrollerSection.classList.remove('sticky');
          splitScrollerObserver.unobserve(splitScrollerSection);
          document.querySelector('.slider-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => splitScrollerObserver.observe(splitScrollerSection), sectionTransitionDuration);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentTypeIndex > 0) {
          const prevIndex = currentTypeIndex - 1;
          scrollToCoffeeType(prevIndex);
        } else {
          isSplitScrollerActive = false;
          splitScrollerSection.classList.remove('sticky');
          splitScrollerObserver.unobserve(splitScrollerSection);
          document.querySelector('.header').scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => splitScrollerObserver.observe(splitScrollerSection), sectionTransitionDuration);
        }
      }
    });

    window.addEventListener('wheel', (e) => {
      if (!isSplitScrollerActive || isSyncingScroll) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime < sectionTransitionDuration) return;
      lastScrollTime = now;
      if (e.deltaY > 0) {
        if (currentTypeIndex < coffeeTypes.length - 1) {
          const nextIndex = currentTypeIndex + 1;
          scrollToCoffeeType(nextIndex);
        } else {
          isSplitScrollerActive = false;
          splitScrollerSection.classList.remove('sticky');
          splitScrollerObserver.unobserve(splitScrollerSection);
          document.querySelector('.slider-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => splitScrollerObserver.observe(splitScrollerSection), sectionTransitionDuration);
        }
      } else {
        if (currentTypeIndex > 0) {
          const prevIndex = currentTypeIndex - 1;
          scrollToCoffeeType(prevIndex);
        } else {
          isSplitScrollerActive = false;
          splitScrollerSection.classList.remove('sticky');
          splitScrollerObserver.unobserve(splitScrollerSection);
          document.querySelector('.header').scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => splitScrollerObserver.observe(splitScrollerSection), sectionTransitionDuration);
        }
      }
    }, { passive: false });

    window.addEventListener('resize', () => {
      coffeeTypes.forEach((type, index) => {
        const firstCard = document.querySelector(`.coffee-card[data-type="${index}"]`);
        if (firstCard) {
          typeCardPositions[index] = firstCard.offsetTop;
        }
      });
    });

    if (coffeeCards.length > 0) {
      coffeeCards[0].classList.add('active');
      updateActiveType(0);
    }

    // === Navbar Link Handling ===
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    
    // Handle mobile menu toggle
    navbarToggler.addEventListener('click', function() {
      document.body.classList.toggle('menu-open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          // Close mobile menu if open
          const navbarCollapse = document.querySelector('.navbar-collapse');
          if (navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
            bsCollapse.hide();
            document.body.classList.remove('menu-open');
          }
          
          // Special handling for mobile
          if (window.innerWidth < 992) {
            isSliderActive = false;
            isSplitScrollerActive = false;
            sliderSection.classList.remove('sticky');
            splitScrollerSection.classList.remove('sticky');
            
            // Simple scroll for mobile
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Original desktop behavior
            isSliderActive = false;
            isSplitScrollerActive = false;
            sliderSection.classList.remove('sticky');
            splitScrollerSection.classList.remove('sticky');
            typesSide.style.scrollSnapType = 'none';
            detailsSide.style.scrollSnapType = 'none';
            sliderObserver.unobserve(sliderSection);
            splitScrollerObserver.unobserve(splitScrollerSection);
            
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            setTimeout(() => {
              sliderObserver.observe(sliderSection);
              splitScrollerObserver.observe(splitScrollerSection);
              if (targetId === 'mentors') {
                typesSide.style.scrollSnapType = 'y mandatory';
                detailsSide.style.scrollSnapType = 'y mandatory';
              }
            }, sectionTransitionDuration);
          }
          
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });

    // === Section Highlighting ===
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        if (isSliderActive || isSplitScrollerActive) return;
        
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const current = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
              }
            });
            
            // Special handling for mobile to ensure proper scrolling
            if (window.innerWidth < 992) {
              setTimeout(() => {
                entry.target.scrollIntoView({ behavior: 'auto', block: 'start' });
              }, 100);
            }
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: window.innerWidth < 992 ? '0px' : '-100px 0px'
      }
    );

    sections.forEach(section => sectionObserver.observe(section));