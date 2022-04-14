import _ from 'lodash';

class RSSParser {
  #rssData;

  #rssParser;

  #rssChannelDOM;

  constructor(rssData, parser = new DOMParser()) {
    this.#rssData = rssData;
    this.#rssParser = parser;
  }

  parse() {
    const parsedDOM = this.#rssParser.parseFromString(JSON.stringify(this.#rssData), 'text/html');
    const rssChannelDOM = parsedDOM.body.querySelector('channel');
    if (rssChannelDOM === null) {
      throw new Error('Invalid RSS link');
    }
    this.#rssChannelDOM = rssChannelDOM;
    return this;
  }

  getParsedRSS() {
    const feedTitle = this.#rssChannelDOM.querySelector('title').textContent.trim();
    const feedDescription = this.#rssChannelDOM.querySelector('description').textContent.trim();
    const feed = { id: _.uniqueId('feed_'), title: feedTitle, description: feedDescription };

    const postElements = this.#rssChannelDOM.querySelectorAll('item');
    const posts = [...postElements].map((post) => {
      const postTitle = post.querySelector('title').textContent.trim();
      const postDescription = post.querySelector('description').textContent.trim();
      const postLink = post.querySelector('link').nextSibling.textContent.replace(/(\r\n|\n|\r)/gm, '');
      return {
        id: _.uniqueId('post_'), title: postTitle, description: postDescription, link: postLink, feedID: feed.id,
      };
    });

    return { feed, posts };
  }
}

export default RSSParser;
