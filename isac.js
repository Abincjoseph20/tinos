document.addEventListener('DOMContentLoaded', function() {
    const abinSection = document.querySelector('.abin-section');
    const abinContainer = document.querySelector('.abin-container');
    const abinContentWrapper = document.querySelector('.abin-content-wrapper');
    const abinTitle = document.querySelector('.abin-title');
    const abinContent = document.querySelector('.abin-content');
    const abinIcon = document.querySelector('.abin-icon');
    const abinButton = document.querySelector('.abin-content-wrapper .btn');
    
    if (abinSection && abinContainer) {
        // Initialize with animation properties
        abinContainer.style.opacity = '0';
        abinContainer.style.transform = 'translateY(20px)';
        abinContainer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        // Enhanced content splitting with sentence-based lines
        if (abinContent) {
            const contentText = abinContent.textContent.trim();
            // Split by sentences and clean up
            const sentences = contentText.split(/(?<=\.)\s+/).filter(sentence => sentence.trim().length > 0);
            
            abinContent.innerHTML = sentences.map((sentence, index) => 
                `<span class="content-line" data-line="${index}">${sentence}</span>`
            ).join('');
        }
        
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
        
        // Enhanced scroll-based visibility with granular line control
        function handleScrollVisibility() {
            const rect = abinSection.getBoundingClientRect();
            const sectionHeight = abinSection.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // Calculate scroll progress within the section
            let scrollProgress = 0;
            
            if (rect.top <= viewportHeight * 0.3 && rect.bottom >= viewportHeight * 0.7) {
                // Section is in the optimal viewing area
                scrollProgress = Math.min(1, (viewportHeight * 0.3 - rect.top) / (sectionHeight * 0.6));
            } else if (rect.top <= 0 && rect.bottom >= viewportHeight) {
                // Section is fully in viewport or larger than viewport
                scrollProgress = Math.abs(rect.top) / (sectionHeight - viewportHeight);
            } else if (rect.top > viewportHeight * 0.3) {
                // Section is below optimal viewing area
                scrollProgress = 0;
            } else if (rect.bottom < viewportHeight * 0.7) {
                // Section is above optimal viewing area
                scrollProgress = 1;
            }
            
            // Clamp between 0 and 1
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));
            
            // Enhanced element visibility control
            const baseOpacity = 0.1;
            const maxOpacity = 1;
            const opacityRange = maxOpacity - baseOpacity;
            
            // Apply opacity to main elements
            if (abinIcon) {
                abinIcon.style.opacity = baseOpacity + (scrollProgress * opacityRange);
                abinIcon.style.transform = `translateY(${(1 - scrollProgress) * 10}px)`;
            }
            if (abinTitle) {
                abinTitle.style.opacity = baseOpacity + (scrollProgress * opacityRange);
                abinTitle.style.transform = `translateY(${(1 - scrollProgress) * 10}px)`;
            }
            if (abinButton) {
                abinButton.style.opacity = baseOpacity + (scrollProgress * opacityRange);
                abinButton.style.transform = `translateY(${(1 - scrollProgress) * 10}px)`;
            }
            
            // Enhanced content lines handling
            if (abinContent) {
                const contentLines = abinContent.querySelectorAll('.content-line');
                const lineCount = contentLines.length;
                
                contentLines.forEach((line, index) => {
                    // Calculate when this line should start appearing (more gradual)
                    const lineStartProgress = (index / lineCount) * 0.8; // Start earlier
                    const lineEndProgress = Math.min(1, lineStartProgress + 0.4); // Longer transition
                    
                    // Calculate line-specific progress
                    let lineProgress = 0;
                    if (scrollProgress > lineStartProgress) {
                        lineProgress = Math.min(1, (scrollProgress - lineStartProgress) / (lineEndProgress - lineStartProgress));
                    }
                    
                    // Enhanced line visibility with multiple states
                    const lineOpacity = 0.05 + (lineProgress * 0.95);
                    const lineTransform = (1 - lineProgress) * 15;
                    const lineBlur = (1 - lineProgress) * 2;
                    
                    line.style.opacity = lineOpacity;
                    line.style.transform = `translateY(${lineTransform}px)`;
                    line.style.filter = `blur(${lineBlur}px)`;
                    
                    // Add special focus effect for currently active line
                    if (lineProgress > 0.3 && lineProgress < 0.9) {
                        line.classList.add('line-focused');
                    } else {
                        line.classList.remove('line-focused');
                    }
                    
                    // Add visible class for lines that are sufficiently visible
                    if (lineProgress > 0.5) {
                        line.classList.add('line-visible');
                    } else {
                        line.classList.remove('line-visible');
                    }
                });
            }
            
            // Add scroll-active class when significantly visible
            if (scrollProgress > 0.2) {
                abinSection.classList.add('scroll-active');
            } else {
                abinSection.classList.remove('scroll-active');
            }
            
            // Enhanced wrapper transform effect
            if (abinContentWrapper) {
                abinContentWrapper.style.transform = `translateY(${(1 - scrollProgress) * 5}px)`;
            }
        }
        
        // Optimized scroll event listener
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(handleScrollVisibility);
                ticking = true;
                setTimeout(() => { ticking = false; }, 8); // Higher frequency for smoother effect
            }
        }
        
        window.addEventListener('scroll', requestTick);
        
        // Initial call
        handleScrollVisibility();
    }
});