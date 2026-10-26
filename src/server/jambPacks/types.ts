export interface SeedQuestion {
  topic: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface SubjectPack {
  subjectId: string;
  subjectName: string;
  iconName: string;
  description: string;
  materialId: string;
  materialTitle: string;
  materialSummary: string;
  materialSections: string[];
  pastPaperId: string;
  pastPaperTitle: string;
  pastPaperYear: string;
  pastPaperSummary: string;
  questions: SeedQuestion[];
}
