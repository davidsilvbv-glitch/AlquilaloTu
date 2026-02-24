// Reveal al hacer scroll
const revealElements = document.querySelectorAll('.step, .impact-card, .card');

window.addEventListener('scroll', () => {
  revealElements.forEach(el => {
    const position = el.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if(position < windowHeight - 100){
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }
  });
});