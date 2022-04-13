import i18next from 'i18next';
import en from './locales/en.js';
import app from './app.js';

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  }).then(() => {
    app(i18nextInstance);
  });
};
