import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';
import RSSParser from './RSSParser.js';

yup.setLocale({
  mixed: {
    default: () => ({ key: 'default_error' }),
    notOneOf: () => ({ key: 'existing_rss' }),
  },
  string: {
    url: () => ({ key: 'invalid_url' }),
  },
});

const getValidator = (addedURLs) => {
  const schema = yup.object().shape({
    url: yup.string().url().notOneOf(addedURLs),
  });

  return schema;
};

export default (i18next) => {
  const elements = {
    rssAddForm: document.querySelector('form'),
    urlInput: document.querySelector('#url-input'),
    submit: document.querySelector('[type="submit"]'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    feedbackContainer: document.querySelector('.feedback'),
  };

  const state = onChange({
    rssAddForm: {
      state: 'filling',
      isValid: true,
      feedbackMessage: '',
      addedURLs: [],
    },
    feeds: [],
    posts: [],
  }, render(elements, i18next));

  elements.rssAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const validator = getValidator(state.rssAddForm.addedURLs);
    validator
      .validate(Object.fromEntries(formData))
      .then((urlInput) => {
        state.rssAddForm.feedbackMessage = '';
        state.rssAddForm.isValid = true;
        state.rssAddForm.state = 'responsing';

        fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(urlInput.url)}`)
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            state.rssAddForm.state = 'error';
            state.rssAddForm.feedbackMessage = i18next.t('feedback.default_error');
            throw new Error('Network response was not ok.');
          })
          .then((data) => {
            const parser = new RSSParser(JSON.stringify(data));
            try {
              const { feed, posts } = parser.parse().getParsedRSS();
              state.feeds.push(feed);
              state.posts.push(...posts);
              console.log(state);
            } catch (err) {
              state.rssAddForm.state = 'error';
              state.rssAddForm.feedbackMessage = i18next.t('feedback.invalid_rss');/*  */
              throw new Error('Invalid RSS link.');
            }
            // console.log(data);
          })
          .then(() => {
            state.rssAddForm.state = 'filling';
            state.rssAddForm.feedbackMessage = i18next.t('feedback.success');
            state.rssAddForm.addedURLs.push(urlInput.url);
          });
      })
      .catch((err) => {
        const [errorMessage] = err.errors;
        state.rssAddForm.feedbackMessage = i18next.t(`feedback.${errorMessage.key}`);
        state.rssAddForm.isValid = false;
      });
  });
};
