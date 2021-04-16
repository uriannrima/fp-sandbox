/**
 * 1) Construct a url for our particular search term: Pure
 * 2) Make the flickr api call: Inpure
 * 3) Transform the resulting json into html images: Pure
 * 4) Place them on the screen: Inpure
 */

import { flow, pipe } from "fp-ts/lib/function";
import { compose, map, partial, prop, tap } from "ramda";
import $ from "jquery";

const ImpureAPI = {
  getJSON: (callback: Function) => (url: string) => $.getJSON(url, callback),
  setHtml: (selector: string) => (html: any) => $(selector).append(html),
  trace: <A>(trace: string) => (a: A) => {
    console.log(trace, a);
    return a;
  },
};

const Environment = {
  host: "api.flickr.com",
  path: "/services/feeds/photos_public.gne",
};

const PureAPI = {
  query: (s: string) => `?tags=${s}&format=json&jsoncallback=?`,
  url: (query: (s: string) => string, host: string, path: string, s: string) =>
    `https://${host}${path}${query(s)}`,
};

interface Image {
  media: {
    m: string;
  };
}

type Images = Image[];

interface FlickrResponse {
  items: Images;
}

const mediaUrl = flow(entry<Image>(), prop("media"), prop("m"));
const mediaUrls = compose(
  map(mediaUrl),
  prop("items"),
  entry<FlickrResponse>()
);

const urlP = partial(PureAPI.url, [
  PureAPI.query,
  Environment.host,
  Environment.path,
]);

const img = (src: string) => $("<img />", { src });
const images = compose(map(img), mediaUrls);
const createRenderer = (getImages: typeof images) =>
  compose(ImpureAPI.setHtml("#js-main"), getImages);
const createApp = (renderer: ReturnType<typeof createRenderer>) =>
  compose(ImpureAPI.getJSON(renderer), urlP);

/**
 * Map Composition Law:
 * compose(map(f), map(g)) === map(compose(f, g))
 * So:
 * compose(map(image), map(mediaUrl)) === map(compose(image, mediaUrl))
 * Do in a single pass.
 */
const mediaToImg = compose(img, mediaUrl);

/**
 * Function to help annotate the entry of the compose function.
 */
export function entry<T>() {
  return function (t: T): T {
    return t;
  };
}

const imagesV2 = compose(
  // Instead to use two maps, we map using a single compose
  //   map(image),
  //   map(mediaUrl),
  map(mediaToImg),
  prop("items"),
  entry<FlickrResponse>()
);

const app = pipe(images, createRenderer, createApp);
const appV2 = pipe(imagesV2, createRenderer, createApp);

app("dogs");
appV2("cats");
