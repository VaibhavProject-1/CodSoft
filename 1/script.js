// Intersection Observer for sliding animation
const sections = document.querySelectorAll('.alternate');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        } else {
            entry.target.classList.remove('in-view');
        }
    });
}, { threshold: 0.5 });

sections.forEach(section => {
    observer.observe(section);
});
