/**
 * Main JavaScript - Progressive Enhancement
 * All functionality MUST work without JS; this only enhances the experience.
 */

(function() {
  'use strict';

  /**
   * Navigation Dropdown Handler
   * Enhances navigation with keyboard support and proper ARIA states
   */
  function initNavDropdowns() {
    const toggles = document.querySelectorAll('.site-nav__toggle');
    
    toggles.forEach(toggle => {
      const dropdownId = toggle.getAttribute('aria-controls');
      const dropdown = document.getElementById(dropdownId);
      
      if (!dropdown) return;
      
      // Click handler
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns();
        
        if (!isExpanded) {
          toggle.setAttribute('aria-expanded', 'true');
          dropdown.setAttribute('data-open', 'true');
        }
      });
      
      // Keyboard handler
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false');
          dropdown.setAttribute('data-open', 'false');
          toggle.focus();
        }
      });
      
      // Close on escape from within dropdown
      dropdown.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false');
          dropdown.setAttribute('data-open', 'false');
          toggle.focus();
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-nav__item')) {
        closeAllDropdowns();
      }
    });
  }
  
  function closeAllDropdowns() {
    document.querySelectorAll('.site-nav__toggle').forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.site-nav__dropdown').forEach(dropdown => {
      dropdown.setAttribute('data-open', 'false');
    });
  }

  /**
   * Accordion Handler
   * Provides keyboard navigation and proper ARIA states
   */
  function initAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    
    accordions.forEach(accordion => {
      const headers = accordion.querySelectorAll('.accordion__header');
      const allowMultiple = accordion.hasAttribute('data-allow-multiple');
      
      headers.forEach(header => {
        const panelId = header.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        
        if (!panel) return;
        
        header.addEventListener('click', () => {
          const isExpanded = header.getAttribute('aria-expanded') === 'true';
          
          if (!allowMultiple) {
            // Close all other panels
            headers.forEach(h => {
              if (h !== header) {
                h.setAttribute('aria-expanded', 'false');
                const p = document.getElementById(h.getAttribute('aria-controls'));
                if (p) p.setAttribute('data-open', 'false');
              }
            });
          }
          
          header.setAttribute('aria-expanded', !isExpanded);
          panel.setAttribute('data-open', !isExpanded);
        });
        
        header.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            header.click();
          }
        });
      });
    });
  }

  /**
   * Tabs Handler
   * Implements ARIA tabs pattern with keyboard navigation
   */
  function initTabs() {
    const tabGroups = document.querySelectorAll('.tabs');
    
    tabGroups.forEach(tabGroup => {
      const tabs = tabGroup.querySelectorAll('.tabs__tab');
      const panels = tabGroup.querySelectorAll('.tabs__panel');
      
      if (tabs.length === 0) return;
      
      // Set initial state
      tabs[0].setAttribute('aria-selected', 'true');
      tabs[0].setAttribute('tabindex', '0');
      panels[0].setAttribute('data-active', 'true');
      
      tabs.forEach((tab, index) => {
        if (index > 0) {
          tab.setAttribute('aria-selected', 'false');
          tab.setAttribute('tabindex', '-1');
        }
        
        tab.addEventListener('click', () => {
          activateTab(tabs, panels, index);
        });
        
        tab.addEventListener('keydown', (e) => {
          let newIndex;
          
          switch (e.key) {
            case 'ArrowLeft':
              newIndex = index === 0 ? tabs.length - 1 : index - 1;
              break;
            case 'ArrowRight':
              newIndex = index === tabs.length - 1 ? 0 : index + 1;
              break;
            case 'Home':
              newIndex = 0;
              break;
            case 'End':
              newIndex = tabs.length - 1;
              break;
            default:
              return;
          }
          
          e.preventDefault();
          tabs[newIndex].focus();
          activateTab(tabs, panels, newIndex);
        });
      });
    });
  }
  
  function activateTab(tabs, panels, activeIndex) {
    tabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      tab.setAttribute('aria-selected', isActive);
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    
    panels.forEach((panel, index) => {
      panel.setAttribute('data-active', index === activeIndex);
    });
  }

  /**
   * Modal Handler
   * Implements focus trapping and keyboard support
   */
  function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    
    modalTriggers.forEach(trigger => {
      const modalId = trigger.getAttribute('data-modal-trigger');
      const modal = document.getElementById(modalId);
      const backdrop = document.querySelector(`[data-modal-backdrop="${modalId}"]`);
      
      if (!modal) return;
      
      const closeBtn = modal.querySelector('.modal__close');
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      
      function openModal() {
        modal.setAttribute('data-open', 'true');
        if (backdrop) backdrop.setAttribute('data-open', 'true');
        document.body.classList.add('modal-open');
        firstFocusable.focus();
      }
      
      function closeModal() {
        modal.setAttribute('data-open', 'false');
        if (backdrop) backdrop.setAttribute('data-open', 'false');
        document.body.classList.remove('modal-open');
        trigger.focus();
      }
      
      trigger.addEventListener('click', openModal);
      
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
      
      if (backdrop) {
        backdrop.addEventListener('click', closeModal);
      }
      
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
        
        // Focus trap
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      });
    });
  }

  /**
   * Form Validation Enhancement
   * Enhances native validation with better UX
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const invalidFields = form.querySelectorAll(':invalid');
        
        if (invalidFields.length > 0) {
          e.preventDefault();
          
          // Focus error summary or first invalid field
          const errorSummary = form.querySelector('.error-summary');
          if (errorSummary) {
            errorSummary.focus();
          } else {
            invalidFields[0].focus();
          }
        }
      });
      
      // Live validation on blur
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          validateField(input);
        });
      });
    });
  }
  
  function validateField(field) {
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (field.validity.valid) {
      field.removeAttribute('aria-invalid');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.hidden = true;
      }
    } else {
      field.setAttribute('aria-invalid', 'true');
      if (errorElement) {
        errorElement.textContent = field.validationMessage;
        errorElement.hidden = false;
      }
    }
  }

  /**
   * Initialize all components
   */
  function init() {
    initNavDropdowns();
    initAccordions();
    initTabs();
    initModals();
    initFormValidation();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
