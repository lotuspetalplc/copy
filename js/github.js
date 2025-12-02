// ===================================
// GITHUB API HANDLER
// Fetch and display GitHub repositories
// ===================================

const GITHUB_USERNAME = 'kdippan';
const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
const MAX_REPOS = 12;

let allProjects = [];
let filteredProjects = [];

// Initialize projects section
document.addEventListener('DOMContentLoaded', () => {
  fetchGitHubProjects();
  initProjectFilters();
  fetchGitHubStats();
});

// Fetch projects from GitHub API
async function fetchGitHubProjects() {
  const loadingState = document.getElementById('projects-loading');
  const errorState = document.getElementById('projects-error');
  const projectsGrid = document.getElementById('projects-grid');
  const projectsCount = document.getElementById('projects-count');
  
  try {
    const response = await fetch(`${REPOS_API_URL}?per_page=100&sort=updated`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const repos = await response.json();
    
    // Filter out forked repos and sort by stars/updated
    allProjects = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, MAX_REPOS);
    
    filteredProjects = [...allProjects];
    
    // Hide loading, show projects
    loadingState.style.display = 'none';
    renderProjects(filteredProjects);
    
    // Update stats
    if (projectsCount) {
      animateCounter(projectsCount, allProjects.length);
    }
    
    // Update languages count
    const languages = new Set(allProjects.map(p => p.language).filter(Boolean));
    const languagesCount = document.getElementById('languages-count');
    if (languagesCount) {
      animateCounter(languagesCount, languages.size);
    }
    
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
  }
}

// Render projects to the grid
function renderProjects(projects) {
  const projectsGrid = document.getElementById('projects-grid');
  const emptyState = document.getElementById('projects-empty');
  
  if (projects.length === 0) {
    projectsGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  projectsGrid.innerHTML = projects.map(project => `
    <article class="project-card" data-language="${project.language || 'Other'}">
      <div class="project-header">
        <h3 class="project-title">${escapeHtml(project.name)}</h3>
        ${project.language ? `
          <span class="project-language">
            <span class="language-dot" aria-hidden="true"></span>
            ${escapeHtml(project.language)}
          </span>
        ` : ''}
      </div>
      
      <p class="project-description">
        ${escapeHtml(project.description || 'No description available')}
      </p>
      
      <div class="project-stats">
        <span class="project-stat" aria-label="${project.stargazers_count} stars">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ${project.stargazers_count}
        </span>
        <span class="project-stat" aria-label="${project.forks_count} forks">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="18" r="3"/>
            <circle cx="6" cy="6" r="3"/>
            <circle cx="18" cy="6" r="3"/>
            <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/>
            <path d="M12 12v3"/>
          </svg>
          ${project.forks_count}
        </span>
      </div>
      
      ${project.topics && project.topics.length > 0 ? `
        <div class="project-topics" role="list" aria-label="Project topics">
          ${project.topics.slice(0, 5).map(topic => `
            <span class="topic-tag" role="listitem">#${escapeHtml(topic)}</span>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="project-links">
        <a href="${project.html_url}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="View ${project.name} on GitHub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Code
        </a>
        ${project.homepage ? `
          <a href="${project.homepage}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="View live demo of ${project.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Demo
          </a>
        ` : ''}
      </div>
    </article>
  `).join('');
  
  // Add animation delay to cards
  const cards = projectsGrid.querySelectorAll('.project-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

// Initialize project filters
function initProjectFilters() {
  const searchInput = document.getElementById('search-projects');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  let currentFilter = 'all';
  let currentSearch = '';
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      applyFilters(currentFilter, currentSearch);
    }, 300));
  }
  
  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-filter');
      
      // Update active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      applyFilters(currentFilter, currentSearch);
    });
  });
}

// Apply filters and search
function applyFilters(filter, search) {
  filteredProjects = allProjects.filter(project => {
    const matchesFilter = filter === 'all' || project.language === filter || (!project.language && filter === 'Other');
    const matchesSearch = !search ||
      project.name.toLowerCase().includes(search) ||
      (project.description && project.description.toLowerCase().includes(search)) ||
      (project.topics && project.topics.some(t => t.toLowerCase().includes(search)));
    
    return matchesFilter && matchesSearch;
  });
  
  renderProjects(filteredProjects);
}

// Animate counter
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 50;
  const duration = 1000;
  const stepTime = duration / 50;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, stepTime);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Debounce function for search
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

// Fetch GitHub user stats
async function fetchGitHubStats() {
  try {
    // Fetch user info
    const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await userResponse.json();
    
    // Update repo count
    const reposCountEl = document.getElementById('github-repos-count');
    if (reposCountEl) {
      animateCounter(reposCountEl, userData.public_repos);
    }
    
    // Fetch all repos to calculate total stars and forks
    const reposResponse = await fetch(`${REPOS_API_URL}?per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repos for stats');
    }
    
    const repos = await reposResponse.json();
    
    // Calculate total stars
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const starsCountEl = document.getElementById('github-stars-count');
    if (starsCountEl) {
      animateCounter(starsCountEl, totalStars);
    }
    
    // Calculate total forks
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const forksCountEl = document.getElementById('github-forks-count');
    if (forksCountEl) {
      animateCounter(forksCountEl, totalForks);
    }
    
    console.log('✅ GitHub stats loaded successfully');
    
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    // Set fallback values
    const reposCountEl = document.getElementById('github-repos-count');
    const starsCountEl = document.getElementById('github-stars-count');
    const forksCountEl = document.getElementById('github-forks-count');
    
    if (reposCountEl) reposCountEl.textContent = '--';
    if (starsCountEl) starsCountEl.textContent = '--';
    if (forksCountEl) forksCountEl.textContent = '--';
  }
}
