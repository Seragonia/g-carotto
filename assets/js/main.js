document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  
  // Get the current language from the URL path
  function getLanguageFromURL() {
    // For Jekyll Polyglot, language is in the path: /lang/path or / for default language
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    // If path starts with a language code (first segment after splitting by /)
    if (pathParts.length > 0) {
      const possibleLang = pathParts[0];
      // Check if this is one of our supported languages
      const supportedLangs = ['fr', 'en', 'es', 'de', 'zh', 'id', 'fil'];
      if (supportedLangs.includes(possibleLang)) {
        return possibleLang;
      }
    }
    
    // Default language if none found in URL
    return 'fr';
  }
  
  // No need to add language to links, Jekyll Polyglot handles URL generation
  
  // Get current language from URL path
  const currentLang = getLanguageFromURL();
  
  if (currentLang) {
    // Mark the correct language as active in the dropdown
    const languageLinks = document.querySelectorAll('.language-dropdown a');
    languageLinks.forEach(link => {
      try {
        const linkLang = link.getAttribute('data-lang');
        if (linkLang === currentLang) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      } catch (e) {
        console.warn('Error processing language link:', link, e);
      }
    });
    
    // Store language preference
    localStorage.setItem('preferredLanguage', currentLang);
    
    // Set the HTML lang attribute
    document.documentElement.lang = currentLang;
  } else {
    // Check if we have a stored language preference
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang && storedLang !== 'fr') {
      // Redirect to the same page with the language in path
      window.location.href = '/' + storedLang + window.location.pathname;
    }
  }
  
  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.querySelector('body');
  
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      body.classList.toggle('mobile-menu-active');
    });
  }
  
  // Mobile submenu toggles
  const menuItemsWithChildren = document.querySelectorAll('.mobile-menu .menu-item-has-children');
  
  menuItemsWithChildren.forEach(item => {
    const link = item.querySelector('a');
    
    if (link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const parent = this.parentNode;
        parent.classList.toggle('active');
        const submenu = parent.querySelector('.sub-menu');
        if (submenu) {
          submenu.classList.toggle('active');
        }
      });
    }
  });
  
  // Language selector
  const languageSelectorButton = document.querySelector('.language-current');
  const languageDropdown = document.querySelector('.language-dropdown');
  const languageSelectorLinks = document.querySelectorAll('.language-dropdown a');
  
  // Toggle dropdown on click
  if (languageSelectorButton && languageDropdown) {
    languageSelectorButton.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event from bubbling up
      languageDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      languageDropdown.classList.remove('show');
    });
    
    // Prevent closing when clicking inside dropdown
    languageDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
  
  languageSelectorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Store the selected language 
      const targetLang = this.getAttribute('data-lang');
      localStorage.setItem('preferredLanguage', targetLang);
      
      // If we're already on this language page, prevent navigation
      const currentLang = getLanguageFromURL();
      if (currentLang === targetLang) {
        e.preventDefault();
        languageDropdown.classList.remove('show');
        return;
      }
    });
  });
  
  // Remove any empty list items
  document.querySelectorAll('li:empty').forEach(li => {
    li.remove();
  });
  
  // Remove any li elements that contain only whitespace
  document.querySelectorAll('li').forEach(li => {
    const hasContent = li.textContent.trim() || 
                       li.querySelector('a[href]') || 
                       li.querySelector('button') ||
                       li.querySelector('input');
    
    if (!hasContent) {
      li.remove();
    }
  });
  
  // Scroll to top button
  const scrollToTopButton = document.querySelector('.scroll-to-top');
  
  if (scrollToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollToTopButton.classList.add('visible');
      } else {
        scrollToTopButton.classList.remove('visible');
      }
    });
    
    scrollToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Header scroll behavior
  const header = document.querySelector('.site-header');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      if (scrollTop > lastScrollTop) {
        // Scrolling down
        header.classList.add('header-hidden');
      } else {
        // Scrolling up
        header.classList.remove('header-hidden');
      }
      lastScrollTop = scrollTop;
    }
  });
  
  // Add anchor links to headings in content
  const articleContent = document.querySelector('.wiki-content');
  
  if (articleContent) {
    const headings = articleContent.querySelectorAll('h2, h3, h4');
    
    headings.forEach(heading => {
      // Skip headings that already have IDs
      if (!heading.id) {
        // Create an ID from the heading text
        const id = heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        heading.id = id;
      }
      
      // Create anchor link
      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = `#${heading.id}`;
      anchor.innerHTML = '<i class="fas fa-link"></i>';
      heading.appendChild(anchor);
    });
  }
  
  // Table responsive wrapper
  const tables = document.querySelectorAll('table');
  
  tables.forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}); 