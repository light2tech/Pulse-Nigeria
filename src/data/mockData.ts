import heroScholarImg from '../assets/images/hero_nigerian_scholar_1793018558397.jpg';
import stemCoverImg from '../assets/images/cover_stem_syllabus_1793018559312.jpg';
import bioscienceCoverImg from '../assets/images/cover_bioscience_syllabus_1793018560111.jpg';
import humanitiesCoverImg from '../assets/images/cover_humanities_economics_syllabus_1793020850847.jpg';

export const VISUAL_ASSETS = {
  heroScholar: heroScholarImg,
  stemCover: stemCoverImg,
  bioscienceCover: bioscienceCoverImg,
  humanitiesCover: humanitiesCoverImg,
};

export function getMaterialCoverImage(subject: string, customUrl?: string): string {
  if (customUrl && customUrl.trim() && !customUrl.includes('googleusercontent.com/aida-public')) {
    return customUrl;
  }
  const lower = (subject || '').toLowerCase();
  if (lower.includes('bio') || lower.includes('chem') || lower.includes('agric')) {
    return bioscienceCoverImg;
  }
  if (
    lower.includes('eng') ||
    lower.includes('econ') ||
    lower.includes('geog') ||
    lower.includes('gov') ||
    lower.includes('lit') ||
    lower.includes('comm')
  ) {
    return humanitiesCoverImg;
  }
  return stemCoverImg;
}
