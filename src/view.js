const inputValidationHandler = (elements, isValid) => {
  switch (isValid) {
    case true:
      elements.urlInput.classList.remove('is-invalid');
      break;
    case false:
      elements.urlInput.classList.add('is-invalid');
      break;
    default:
      break;
  }
};

export default (elements) => (path, value) => {
  switch (path) {
    case 'rssAddForm.isValid':
      inputValidationHandler(elements, value);
      break;
    case 'rssAddForm.feedbackMessage':
      elements.feedbackContainer.replaceChildren(value);
      break;
    default:
      break;
  }
};
