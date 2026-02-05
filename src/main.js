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

document.addEventListener('DOMContentLoaded', () => {
  const isFavoritesPage = document.body.dataset.page === 'favorites';

  // ===== ОБЩЕЕ ДЛЯ ВСЕХ СТРАНИЦ =====
  displayQuote();
  initExerciseModal();
  initRatingModal();
  initGlobalNotification();
  initHeader();
  initCardsEventListener();

  // ===== ТОЛЬКО ДЛЯ HOME =====
  if (!isFavoritesPage) {
    initSearch();
    loadExerciseCards('Muscles', 1);

    const filterButtons = document.querySelectorAll(
      '.exercises__content__header-filters-item'
    );

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

        const filter = button.dataset.filter;
        updateBreadcrumbs(null);
        loadExerciseCards(filter, 1);
      });
    });
  }

  // ===== ESC =====
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeExerciseModal?.();
    closeRatingModal?.();
  });

  // ===== SUBSCRIBE =====
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

      try {
        const response = await fetch(
          'https://your-energy.b.goit.study/api/subscription',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();
        showGlobalNotification(data.message, 'success');
        subscribeForm.reset();
      } catch (error) {
        showGlobalNotification('Subscription failed', 'error');
      }
    });
  }
});
