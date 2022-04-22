const isViewedPost = (post, state) => state.seenPostsID.includes(post.id);

const feedsRender = (elements, feeds, i18next) => {
  elements.feedsContainer.replaceChildren('');
  if (feeds.length > 0) {
    const feedsCard = document.createElement('div');
    feedsCard.classList.add('card', 'border-0');
    const feedsCardBody = document.createElement('div');
    feedsCardBody.classList.add('card-body');
    feedsCardBody.innerHTML = `<h2 class="card-title h4">${i18next.t(
      'feeds_card_title',
    )}</h2>`;
    feedsCard.append(feedsCardBody);
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0', 'rounded-0');
    const feedItems = feeds.map((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      const title = document.createElement('h3');
      title.classList.add('h6', 'm-0');
      title.textContent = feed.title;
      const description = document.createElement('p');
      description.classList.add('m-0', 'small', 'text-black-50');
      description.textContent = feed.description;
      li.append(title, description);
      return li;
    });
    feedsList.append(...feedItems);
    feedsCard.append(feedsList);
    elements.feedsContainer.replaceChildren(feedsCard);
  }
};

const postsRender = (elements, posts, i18next, state) => {
  elements.postsContainer.replaceChildren('');
  if (posts.length > 0) {
    const postsCard = document.createElement('div');
    postsCard.classList.add('card', 'border-0');
    const postsCardBody = document.createElement('div');
    postsCardBody.classList.add('card-body');
    postsCardBody.innerHTML = `<h2 class="card-title h4">${i18next.t(
      'posts_card_title',
    )}</h2>`;
    postsCard.append(postsCardBody);
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');
    const postItems = posts.map((post) => {
      const li = document.createElement('li');
      li.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'alidn-item-start',
        'border-0',
        'border-end-0',
      );
      const title = document.createElement('a');
      const titleClasses = isViewedPost(post, state)
        ? ['fw-normal', 'link-secondary']
        : ['fw-bold'];
      title.classList.add(...titleClasses);
      title.setAttribute('href', post.link);
      title.setAttribute('data-id', post.id);
      title.setAttribute('target', '_blank');
      title.setAttribute('rel', 'noopener noreferrer');
      title.textContent = post.title;
      const viewButton = document.createElement('button');
      viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      viewButton.setAttribute('type', 'button');
      viewButton.setAttribute('data-id', post.id);
      viewButton.setAttribute('data-bs-toggle', 'modal');
      viewButton.setAttribute('data-bs-target', '#modal');
      viewButton.textContent = i18next.t('view_button');
      li.append(title, viewButton);
      return li;
    });
    postsList.append(...postItems);
    postsCard.append(postsList);
    elements.postsContainer.replaceChildren(postsCard);
  }
};

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

const modalRender = (elements, postID, state) => {
  const relatedPost = state.posts.find((post) => post.id === postID);
  const modalTitle = elements.modal.querySelector('.modal-title');
  const modalBody = elements.modal.querySelector('.modal-body');
  const fullArticleLink = elements.modal.querySelector('.full-article');

  modalTitle.textContent = relatedPost.title;
  modalBody.textContent = relatedPost.description;
  fullArticleLink.setAttribute('href', relatedPost.link);
};

const seenPostsRender = (elements, seenPostsID) => {
  seenPostsID.forEach((seenPostID) => {
    const seenPostTitle = elements.postsContainer.querySelector(
      `a[data-id="${seenPostID}"]`,
    );
    if (seenPostTitle.classList.contains('fw-bold')) {
      seenPostTitle.classList.remove('fw-bold');
      seenPostTitle.classList.add('fw-normal', 'link-secondary');
    }
  });
};

export default (elements, state, i18next, onChangePath, onChangeValue) => {
  switch (onChangePath) {
    case 'rssAddForm.isValid':
      inputValidationHandler(elements, onChangeValue);
      break;
    case 'rssAddForm.feedbackMessage':
      elements.feedbackContainer.replaceChildren(onChangeValue);
      break;
    case 'rssAddForm.state':
      rssAddFormStateHandler(elements, onChangeValue);
      break;
    case 'feeds':
      feedsRender(elements, onChangeValue, i18next);
      break;
    case 'posts':
      postsRender(elements, onChangeValue, i18next, state);
      break;
    case 'seenPostsID':
      seenPostsRender(elements, onChangeValue);
      break;
    case 'modal.postID':
      modalRender(elements, onChangeValue, state);
      break;
    default:
      break;
  }
};
