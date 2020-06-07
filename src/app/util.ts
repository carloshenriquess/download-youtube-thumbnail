import { Observable } from 'rxjs';
import { GetThumbsEvent, GetThumbsEventType, Thumbnail } from './models';

export const parseUrl = (url: string) => {
  const baseUrl = 'https://www.youtube.com/watch?v=';
  if (!hasUnsafeCharacter(url)) {
    return baseUrl + url;
  }

  if (url.startsWith('www.youtube.com/')) {
    url = 'https://' + url;
  }

  if (!validateYoutubeUrl(url)) {
    throw new Error('Invalid URL or video ID');
  }
  const videoId = new URL(url).searchParams.get('v');
  return baseUrl + videoId;
};

const hasUnsafeCharacter = (text: string): boolean => !!text.match(/[^A-z0-9-._~]/);

const validateYoutubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    if (
      urlObj.hostname !== 'www.youtube.com' ||
      !videoId ||
      hasUnsafeCharacter(videoId) ||
      urlObj.pathname !== '/watch'
    ) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
};

export const getThumbs = (videoUrl: string): Observable<GetThumbsEvent> => {
  return new Observable<GetThumbsEvent>(subscriber => {
    subscriber.next({ type: GetThumbsEventType.Loading });

    const thumbNames = [
      'maxresdefault.jpg',
      'sddefault.jpg',
      'hqdefault.jpg',
      '0.jpg',
      'mqdefault.jpg',
      '1.jpg',
      '2.jpg',
      '3.jpg',
      'default.jpg'
    ];

    const thumbPromises: Promise<Thumbnail>[] = thumbNames.map(
      thumbName => getThumbnail(videoUrl, thumbName)
    );
    Promise.all(thumbPromises).then(thumbnails => subscriber.next({
      type: GetThumbsEventType.Result,
      thumbnails,
    }));
  });
};

const getThumbnail = (videoUrl: string, thumbName: string): Promise<Thumbnail> => {
  return new Promise(
    resolve => {
      const url = getBaseThumbUrl(videoUrl) + thumbName;
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({
        url,
        resolution: `${img.width}x${img.height}`,
        name: thumbName
      });
    }
  );
};

const getBaseThumbUrl = (videoUrl: string) => {
  return videoUrl
    .replace('www.youtube', 'i.ytimg')
    .replace('watch?v=', 'vi/')
    .concat('/');
};
