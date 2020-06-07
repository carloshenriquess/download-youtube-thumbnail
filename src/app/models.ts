export interface Thumbnail {
  url?: string;
  resolution?: string;
  name: string;
}

export const enum GetThumbsEventType {
  Loading = 0, Result = 1, Error = 2
}

export interface GetThumbsEvent {
  type: GetThumbsEventType;
  errorMessage?: string;
  thumbnails?: Thumbnail[];
}
