const inputValidationHandler = (elements, isValid) => {
  if (isValid) {
    elements.urlInput.classList.remove('is-invalid');
    return;
  }
  if (!isValid) {
    elements.urlInput.classList.add('is-invalid');
    elements.feedbackContainer.classList.replace('text-success', 'text-danger');
  }
};

const rssAddFormStateHandler = (elements, state) => {
  if (state === 'responsing') {
    elements.submit.setAttribute('disabled', '');
    return;
  }
  if (state === 'filling') {
    elements.submit.removeAttribute('disabled');
    elements.feedbackContainer.classList.replace('text-danger', 'text-success');
    elements.rssAddForm.reset();
    elements.urlInput.focus();
  }
  if (state === 'error') {
    elements.submit.removeAttribute('disabled');
    elements.feedbackContainer.classList.replace('text-success', 'text-danger');
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
    case 'rssAddForm.state':
      rssAddFormStateHandler(elements, value);
      break;
    default:
      break;
  }
};
