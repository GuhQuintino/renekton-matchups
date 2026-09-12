/**
 * Guide section and categories interfaces for the 8 general guides.
 */

export type GuideCategory =
  | 'introduction'
  | 'faq'
  | 'runes'
  | 'mechanics_combos'
  | 'summoners'
  | 'items_builds'
  | 'ability_starts_maxing'
  | 'fury_management';

export interface GuideSection {
  id: number;
  category: GuideCategory;
  sectionKey: string;
  displayOrder: number;
  titleEn: string;
  titlePt: string;
  subtitleEn?: string;
  subtitlePt?: string;
  contentEn: string;
  contentPt: string;
  videoUrl?: string;
  metadataJson?: string;
}

export interface GuideContent {
  category: GuideCategory;
  titleEn: string;
  titlePt: string;
  descriptionEn: string;
  descriptionPt: string;
  videoUrl?: string;
  sections: GuideSection[];
}
