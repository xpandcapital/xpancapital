'use client';

import React, { createContext, useContext } from 'react';
import { Project } from './_types';

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProjectName: string | null;
  activeProjectLogo: string | null;
  slug: string;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  activeProjectId: null,
  activeProjectName: null,
  activeProjectLogo: null,
  slug: '',
});

export function ProjectProvider({ children, value }: { children: React.ReactNode; value: ProjectContextType }) {
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  return useContext(ProjectContext);
}
