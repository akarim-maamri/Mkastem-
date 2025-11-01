
export enum ImageStyle {
  RusticDark = 'Rustic/Dark',
  BrightModern = 'Bright/Modern',
  SocialMedia = 'Social Media',
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isLoading: boolean;
}
