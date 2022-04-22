import _ from 'lodash';
import RSSParser from './RSSParser.js';

const getNewRSSPosts = (state) => {
  const trackedFeeds = state.feeds;

  if (trackedFeeds.length === 0) {
    return;
  }

  const fetchPromises = trackedFeeds.map((feed) => fetch(
    `https://allorigins.hexlet.app/get?url=${encodeURIComponent(feed.url)}`,
    { cache: 'no-store' },
  ).then((response) => {
    if (response.ok) {
      return [response.text(), feed.id];
    }

    throw new Error('RSSTracker: Network response was not ok.');
  }));

  const promiseAllFetching = Promise.all(fetchPromises);

  promiseAllFetching
    .then((allFeedsData) => {
      const postsParsingPromises = allFeedsData.map(([data, feedID]) => data.then((innerText) => {
        const parser = new RSSParser(innerText);
        try {
          const { posts } = parser.parse().getParsedRSS();
          const postsWithCorrectFeedID = posts.map((post) => {
            const postReassignedFeedID = { ...post, feedID };
            return postReassignedFeedID;
          });

          return postsWithCorrectFeedID;
        } catch (err) {
          throw new Error(`RSS Tracking: Parsing RSS Error: ${err}`);
        }
      }));

      return Promise.all(postsParsingPromises);
    })
    .then((parsedPosts) => {
      const savedPosts = state.posts;
      const fetchedPosts = parsedPosts.flat();
      const newPosts = _.differenceBy(fetchedPosts, savedPosts, 'link');
      state.posts.push(...newPosts);
    });
};

const trackRSS = (state, frequency) => {
  getNewRSSPosts(state);
  setTimeout(() => {
    trackRSS(state, frequency);
  }, frequency);
};

export { getNewRSSPosts, trackRSS };
