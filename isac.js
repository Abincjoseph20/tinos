  window.addEventListener("scroll", () => {
    const textElement = document.getElementById("abinText");
    const rect = textElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top >= 0 && rect.top <= windowHeight) {
      const opacity = 1 - rect.top / windowHeight;
      textElement.style.opacity = opacity.toFixed(2);
    } else {
      textElement.style.opacity = 0;
    }
  });
