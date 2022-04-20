import RSSParser from './RSSParser.js';
import _ from 'lodash';

const getNewRSSPosts = (state) => {
	const trackedFeeds = state.feeds;
	
	if (trackedFeeds.length === 0) {
		return;
	}
	
	const fetchPromises = trackedFeeds.map((feed) => {
		return fetch(
          `https://allorigins.hexlet.app/get?url=${encodeURIComponent(
            feed.url,
          )}`, {cache: "no-store"})
		.then((response) => {
            if (response.ok) {
              return [response.text(), feed.id];
            }

            throw new Error('RSSTracker: Network response was not ok.');
        });
	});
	
	const promiseAllFetching = Promise.all(fetchPromises);
	
	promiseAllFetching
		.then((allFeedsData) => {
			const postsParsingPromises = allFeedsData.map(([data, feedID]) => {
				return data.then((innerText) => {
					const parser = new RSSParser(innerText);
					const { posts } = parser.parse().getParsedRSS();
					const postsWithCorrectFeedID = posts.map((post) => {
						post.feedID = feedID;
						return post;
					});
					
					return postsWithCorrectFeedID;
				});	
			});
			
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
	
	setTimeout(() => {trackRSS(state, frequency)}, frequency);
};

export { getNewRSSPosts, trackRSS };