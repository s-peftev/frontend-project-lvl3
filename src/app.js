import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';
import RSSParser from './RSSParser.js';
import { trackRSS } from './rssTracker.js';

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

const tracking = (func, param, period) => {
	const result = func(param);
	if (result) {
		console.log(result);
		setTimeout(() => {tracking(func, param, period)}, period);
		return;
	}
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

  const state = onChange(
    {
      rssAddForm: {
        state: 'filling',
        isValid: true,
        feedbackMessage: '',
        addedURLs: [],
      },
      feeds: [],
      posts: [],
    },
    render(elements, i18next),
  );
  
  trackRSS(state, 10000);

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

        fetch(
          `https://allorigins.hexlet.app/get?url=${encodeURIComponent(
            urlInput.url,
          )}`, {cache: "no-store"})
          .then((response) => {
            if (response.ok) {
              return response.text();
            }
            state.rssAddForm.state = 'error';
            state.rssAddForm.feedbackMessage = i18next.t(
              'feedback.default_error',
            );
            throw new Error('Network response was not ok.');
          })
          .then((data) => {
			  // console.log(data);
            const parser = new RSSParser(data);
            try {
              const { feed, posts } = parser.parse().getParsedRSS();
              state.feeds.push({ ...feed, url: urlInput.url });
              state.posts.push(...posts);
			  state.rssAddForm.state = 'filling';
			  state.rssAddForm.feedbackMessage = i18next.t('feedback.success');
              state.rssAddForm.addedURLs.push(urlInput.url);
               console.log(state);
            } catch (err) {
              state.rssAddForm.state = 'error';
              state.rssAddForm.feedbackMessage = i18next.t(
                'feedback.invalid_rss',
              );
              throw new Error('Invalid RSS link.');
            }
          })
      })
      .catch((err) => {
        const [errorMessage] = err.errors;
        state.rssAddForm.feedbackMessage = i18next.t(
          `feedback.${errorMessage.key}`,
        );
        state.rssAddForm.isValid = false;
      });
  });
};
