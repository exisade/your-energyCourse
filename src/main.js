import './css/main.scss';

import {
  loadExerciseCards,
  updateBreadcrumbs,
  initSearch,
  initCardsEventListener,
} from './js/exercises.js';

import { initExerciseModal, closeExerciseModal } from './js/exercise-modal.js';
import { initRatingModal, closeRatingModal } from './js/rating-modal.js';

import {
  initGlobalNotification,
  showGlobalNotification,
} from './js/global-notification.js';

import {
  showFieldError,
  hideFieldError,
  validateEmail,
} from './js/form-validation.js';

import { initHeader } from './js/header.js';
import { displayQuote } from './js/quote.js';

/**
 * Sends subscription request to backend
 * @param {string} email
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function subscribeToNewsletter(email) {
  try {
    const response = await fetch(
      'https://your-energy.b.goit.study/api/subscription',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to subscribe');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Display quote of the day
  displayQuote();

  // Initialize modals
  initExerciseModal();
  initRatingModal();

  // Initialize global notifications
  initGlobalNotification();

  // Initialize header logic
  initHeader();

  // Initialize search functionality
  initSearch();

  // Initialize cards event delegation
  initCardsEventListener();

  // Initial load of exercise cards
  loadExerciseCards('Muscles', 1);

  // Close modals on Escape key press
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeExerciseModal?.();
    closeRatingModal?.();
  });

  // Filters handling
  const filterButtons = document.querySelectorAll(
    '.exercises__content__header-filters-item'
  );

  if (filterButtons.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn =>
          btn.classList.remove(
            'exercises__content__header-filters-item--active'
          )
        );

        button.classList.add(
          'exercises__content__header-filters-item--active'
        );

        const filter = button.getAttribute('data-filter');
        updateBreadcrumbs(null);
        loadExerciseCards(filter, 1);
      });
    });
  }

  // Subscription form handling
  const subscribeForm = document.getElementById('subscribeForm');
  const subscribeEmailInput = document.getElementById('subscribeEmail');
  const subscribeEmailError = document.getElementById('subscribeEmailError');

  if (subscribeEmailInput && subscribeEmailError) {
    subscribeEmailInput.addEventListener('input', () => {
      hideFieldError(subscribeEmailInput, subscribeEmailError);
    });
  }

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async event => {
      event.preventDefault();

      const email = subscribeEmailInput?.value.trim() || '';
      let hasErrors = false;

      if (!email) {
        showFieldError(
          subscribeEmailInput,
          subscribeEmailError,
          'Please enter your email address'
        );
        hasErrors = true;
      } else if (!validateEmail(email)) {
        showFieldError(
          subscribeEmailInput,
          subscribeEmailError,
          'Please enter a valid email address'
        );
        hasErrors = true;
      } else {
        hideFieldError(subscribeEmailInput, subscribeEmailError);
      }

      if (hasErrors) return;

      const result = await subscribeToNewsletter(email);

      if (result.success) {
        showGlobalNotification(result.data.message, 'success');
        subscribeForm.reset();
        hideFieldError(subscribeEmailInput, subscribeEmailError);
      } else {
        showGlobalNotification(result.error, 'error');
      }
    });
  }
});
