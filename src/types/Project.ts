export type ProjectDomain =
  | 'frontend'
  | 'blockchain'
  | 'cybersecurity'
  | 'real-estate';

export type Project = {
  id: string;
  title: string;
  description: string;
  domain: ProjectDomain;
  stack: string[];
  role: string;
  impact?: string;
  year?: number;
};
