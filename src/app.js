import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';

const getValidator = (addedFeeds) => {
  const schema = yup.object().shape({
    url: yup.string().url().notOneOf(addedFeeds),
  });

  return schema;
};

export default () => {
  const elements = {
    rssAddForm: document.querySelector('form'),
    urlInput: document.querySelector('#url-input'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    feedbackContainer: document.querySelector('.feedback'),
  };

  const state = onChange({
    rssAddForm: {
      state: 'filling',
      isValid: true,
      feedbackMessage: '',
      addedFeeds: [],
    },
  }, render(elements));

  elements.rssAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const validator = getValidator(state.rssAddForm.addedFeeds);
    validator
      .validate(Object.fromEntries(formData))
      .then(() => {
        state.rssAddForm.feedbackMessage = '';
        state.rssAddForm.isValid = true;
      })
      .catch((err) => {
        const [errorMessage] = err.errors;
        state.rssAddForm.feedbackMessage = errorMessage;
        state.rssAddForm.isValid = false;
      });
  });
};
