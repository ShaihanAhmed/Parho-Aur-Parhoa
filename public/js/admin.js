// Switch between Users and Courses view
document.querySelectorAll('.switch-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Hide all views
        document.querySelectorAll('.view-content').forEach(view => view.classList.remove('active'));
        
        // Show selected view
        const viewType = this.dataset.view;
        if (viewType === 'users') {
            document.querySelector('.users-view').classList.add('active');
        } else if (viewType === 'courses') {
            document.querySelector('.courses-view').classList.add('active');
        }
    });
});

// Delete button functionality
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = this.closest('.user-card, .course-card');
        
        if (confirm('Are you sure you want to delete this item?')) {
            card.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                card.remove();
            }, 300);
        }
    });
});

// User type dropdown filter
document.querySelector('.user-type-dropdown')?.addEventListener('change', function() {
    console.log('Filter changed to:', this.value);
    // Add your filtering logic here
});

// Logout button
document.querySelector('.logout-btn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        // Add logout logic here
        alert('Logout functionality will be implemented here');
    }
});

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }
`;
document.head.appendChild(style);

// Animated counter for stats
function animateCounter(element) {
    const target = element.textContent;
    const isPercentage = target.includes('%');
    const numericValue = parseInt(target.replace(/,/g, '').replace('%', ''));
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        const displayValue = Math.floor(current);
        if (isPercentage) {
            element.textContent = displayValue + '%';
        } else {
            element.textContent = displayValue.toLocaleString();
        }
    }, duration / steps);
}

// Initialize counter animations on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-value').forEach(element => {
        animateCounter(element);
    });
});
