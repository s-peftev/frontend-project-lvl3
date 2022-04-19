import path, { dirname } from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import jsdom from 'jsdom';
import RSSParser from '../src/RSSParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const fakeDOMParser = {
  parseFromString(rssData) {
    return rssData;
  },
};

test('parsing valid rss', async () => {
  const rssData = await fs.readFile(getFixturePath('feed.xml'), 'utf-8');
  const expectedFeed = {
    id: 'feed_1',
    title: 'Deutsche Welle: DW.COM News',
    description: 'Deutsche Welle: DW.COM News',
  };
  const expectedPosts = [
    {
      id: 'post_2',
      title: 'У школы в Кабуле прогремели минимум три взрыва',
      description:
        'У школы в западном районе Кабула, где проживают шииты, произошли три взрыва, среди учеников есть раненые.',
      link: 'https://www.dw.com/ru/у-школы-в-кабуле-прогремели-минимум-три-взрыва/a-61509255?maca=rus-rss-ru-news-4383-xml-mrss',
      feedID: 'feed_1',
    },
    {
      id: 'post_3',
      title:
        'Вице-премьер Украины: Гуманитарных коридоров не будет третий день подряд',
      description:
        'Россия продолжает военное вторжение в Украину, начатое 24 февраля по приказу Владимира Путина. DW следит за событиями 19 апреля.',
      link: 'https://www.dw.com/ru/вице-премьер-украины-гуманитарных-коридоров-не-будет-третий-день-подряд/a-61507240?maca=rus-rss-ru-news-4383-xml-mrss',
      feedID: 'feed_1',
    },
  ];
  const dom = new jsdom.JSDOM(rssData);
  const parser = new RSSParser(dom.window.document, fakeDOMParser);
  const { feed, posts } = parser.parse().getParsedRSS();

  expect(feed).toEqual(expectedFeed);
  expect(posts).toEqual(expectedPosts);
});

test('parsing invalid rss', () => {
  const parser = new RSSParser('', fakeDOMParser);
  expect(() => {
    parser.parse();
  }).toThrow();
});
