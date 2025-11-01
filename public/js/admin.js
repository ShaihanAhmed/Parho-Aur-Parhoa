// // Switch between Users and Courses view

const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');

hamburger?.addEventListener('click', () => {
  sidebar.classList.toggle('show');
});


const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');


    if (sidebar.classList.contains('show')) sidebar.classList.remove('show');
  });
});


const topSearch = document.getElementById('topSearch');
topSearch?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  const rows = document.querySelectorAll('.table tbody tr');
  rows.forEach(r => {
    const cells = r.textContent.toLowerCase();
    r.style.display = cells.includes(q) ? '' : 'none';
  });
});


document.querySelectorAll('.sort').forEach(sel => {
  sel.addEventListener('change', () => {
    alert('Sort changed - implement server side or JS sort if needed');
  });
});


document.querySelectorAll('.page').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".stat-number");

  counters.forEach(counter => {
    const target = +counter.getAttribute("data-target");
    const duration = 2000;
    const stepTime = 20;
    const increment = target / (duration / stepTime);

    let current = 0;
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };
    updateCounter();
  });
});