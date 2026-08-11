export const handleNavLinkClick = (e, targetId) => {
  e.preventDefault();
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  const offset = 96; // Offset to clear space for the fixed navbar
  const elementPosition = targetElement.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  const startPosition = window.pageYOffset;
  const distance = offsetPosition - startPosition;
  
  // Scale duration based on distance, keeping it within 700ms - 1100ms
  const duration = Math.min(1100, Math.max(700, Math.abs(distance) * 0.8));
  let startTime = null;

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = easeInOutCubic(Math.min(1, timeElapsed / duration));
    
    window.scrollTo(0, startPosition + distance * progress);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};
