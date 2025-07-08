document.addEventListener('DOMContentLoaded', function() {
    const abinSection = document.querySelector('.abin-section');
    const abinContainer = document.querySelector('.abin-container');
    const abinContentWrapper = document.querySelector('.abin-content-wrapper');
    const abinContent = document.querySelector('.abin-content');
    const typingCursor = document.querySelector('.typing-cursor');
    const progressBar = document.querySelector('.typing-progress-bar');
    
    let characters = [];
    let totalChars = 0;
    
    if (abinSection && abinContainer && abinContent) {
        // Initialize container animation
        abinContainer.style.opacity = '0';
        abinContainer.style.transform = 'translateY(20px)';
        
        // Split text into individual characters
        function initializeTypewriter() {
            const contentText = abinContent.textContent.trim();
            totalChars = contentText.length;
            
            // Create character spans
            const charSpans = contentText.split('').map((char, index) => {
                const span = document.createElement('span');
                span.className = 'typewriter-char';
                span.textContent = char;
                span.setAttribute('data-index', index);
                return span;
            });
            
            // Clear content and add character spans
            abinContent.innerHTML = '';
            charSpans.forEach(span => abinContent.appendChild(span));
            
            // Store references
            characters = Array.from(abinContent.querySelectorAll('.typewriter-char'));
        }
        
        // Initialize typewriter
        initializeTypewriter();
        
        // Intersection Observer for initial animation
        const abinObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        abinContainer.style.opacity = '1';
                        abinContainer.style.transform = 'translateY(0)';
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        abinObserver.observe(abinSection);
        
        // Enhanced typewriter scroll effect
        function handleTypewriterScroll() {
            const rect = abinSection.getBoundingClientRect();
            const sectionHeight = abinSection.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // Calculate scroll progress within the section
            let scrollProgress = 0;
            
            if (rect.top <= viewportHeight * 0.3 && rect.bottom >= viewportHeight * 0.7) {
                // Section is in optimal viewing area
                scrollProgress = Math.min(1, (viewportHeight * 0.3 - rect.top) / (sectionHeight * 0.6));
            } else if (rect.top <= 0 && rect.bottom >= viewportHeight) {
                // Section fills viewport
                scrollProgress = Math.abs(rect.top) / (sectionHeight - viewportHeight);
            } else if (rect.top > viewportHeight * 0.3) {
                scrollProgress = 0;
            } else if (rect.bottom < viewportHeight * 0.7) {
                scrollProgress = 1;
            }
            
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));
            
            // Update other elements
            const baseOpacity = 0.1;
            const maxOpacity = 1;
            const opacityRange = maxOpacity - baseOpacity;
            
            // Apply to icon, title, button
            const elements = [
                document.querySelector('.abin-icon'),
                document.querySelector('.abin-title'),
                document.querySelector('.btn')
            ];
            
            elements.forEach(el => {
                if (el) {
                    el.style.opacity = baseOpacity + (scrollProgress * opacityRange);
                    el.style.transform = `translateY(${(1 - scrollProgress) * 10}px)`;
                }
            });
            
            // Typewriter effect
            const revealedChars = Math.floor(scrollProgress * totalChars);
            let currentCharIndex = -1;
            
            characters.forEach((char, index) => {
                if (index < revealedChars) {
                    char.classList.add('revealed');
                    char.classList.remove('current');
                } else if (index === revealedChars) {
                    char.classList.add('current');
                    char.classList.remove('revealed');
                    currentCharIndex = index;
                } else {
                    char.classList.remove('revealed', 'current');
                }
            });
            
            // Update cursor position and visibility
            if (typingCursor) {
                if (currentCharIndex >= 0 && currentCharIndex < totalChars) {
                    typingCursor.classList.add('active');
                    // Position cursor after current character
                    const currentChar = characters[currentCharIndex];
                    if (currentChar) {
                        const rect = currentChar.getBoundingClientRect();
                        const containerRect = abinContent.getBoundingClientRect();
                        typingCursor.style.position = 'absolute';
                        typingCursor.style.left = `${rect.right - containerRect.left}px`;
                        typingCursor.style.top = `${rect.top - containerRect.top}px`;
                    }
                } else if (revealedChars >= totalChars) {
                    typingCursor.classList.remove('active');
                } else {
                    typingCursor.classList.remove('active');
                }
            }
            
            // Update progress bar
            if (progressBar) {
                progressBar.style.width = `${scrollProgress * 100}%`;
            }
            
            // Add scroll-active class
            if (scrollProgress > 0.2) {
                abinSection.classList.add('scroll-active');
            } else {
                abinSection.classList.remove('scroll-active');
            }
            
            // Wrapper transform
            if (abinContentWrapper) {
                abinContentWrapper.style.transform = `translateY(${(1 - scrollProgress) * 5}px)`;
            }
        }
        
        // Optimized scroll listener
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(handleTypewriterScroll);
                ticking = true;
                setTimeout(() => { ticking = false; }, 16);
            }
        }
        
        window.addEventListener('scroll', requestTick);
        
        // Initial call
        handleTypewriterScroll();
    }
});