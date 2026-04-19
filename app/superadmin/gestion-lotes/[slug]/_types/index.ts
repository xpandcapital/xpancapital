export interface Project {
  id: string;
  name: string;
  status: string;
  slug?: string;
}

export interface GestionLotesState {
  isLoading: boolean;
  projects: Project[];
  activeProjectId: string | null;
  projectNotFound: boolean;
}