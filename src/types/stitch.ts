export type DeviceType = 'MOBILE' | 'DESKTOP' | 'TABLET' | 'AGNOSTIC';
export type ModelId = 'GEMINI_3_PRO' | 'GEMINI_3_FLASH';
export type CreativeRange = 'REFINE' | 'EXPLORE' | 'REIMAGINE';
export type VariantAspect = 'LAYOUT' | 'COLOR_SCHEME' | 'IMAGES' | 'TEXT_FONT' | 'TEXT_CONTENT';

export interface VariantOptions {
  variantCount?: number;
  creativeRange?: CreativeRange;
  aspects?: VariantAspect[];
}

export interface ScreenData {
  screenId: string;
  projectId: string;
  html: string;
  imageUrl?: string;
}

export interface ProjectData {
  projectId: string;
  title: string;
  screenCount: number;
}
