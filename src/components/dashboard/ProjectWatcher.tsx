"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect } from "react";

const ProjectWatcher = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const secretId = useProjectStore((state) => state.secretId);
  const projectSecretRefs = useProjectStore((state) => state.projectSecretRefs);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setProject = useProjectStore((state) => state.setProject);
  const setSecret = useProjectStore((state) => state.setSecret);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const addProjectSecretRefs = useProjectStore((state) => state.addProjectSecretRefs);
  const setLoadingStates = useProjectStore((state) => state.setLoadingStates);
  const setShowAll = useProjectStore((state) => state.setShowAll);

  const { data: projects, isLoading: isLoadingProjects } = trpc.project.get.useQuery();

  const {
    data: updatedSecret,
    isLoading: isLoadingSecret,
    refetch: refetchSecret,
  } = trpc.secret.get.useQuery(
    { projectId: Number(projectId), secretId: secretId },
    {
      enabled: !!projectId && !!secretId && hasHydrated,
      retry: false,
    }
  );

  const {
    data: updatedProject,
    isLoading: isLoadingProject,
    refetch: refetchProject,
  } = trpc.project.getById.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId && hasHydrated, retry: false }
  );

  useEffect(() => {
    if (!projectId && projects && projects?.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (secretId) {
      refetchSecret();
    } else {
      if (projectId) {
        const secretIdRef = projectSecretRefs[projectId!];
        if (secretIdRef) {
          setSecretId(secretIdRef);
        }
      }

      setSecret(null);
    }

    if (secretId && projectId) {
      addProjectSecretRefs(projectId, secretId);
    }

    setShowAll(false);
  }, [secretId, projectId]);

  useEffect(() => {
    if (!secretId) {
      setSecret(null);
    }
  }, [secretId]);

  useEffect(() => {
    if (updatedSecret) {
      setSecret(updatedSecret);
      setSecretId(updatedSecret.id);
    }
  }, [updatedSecret]);

  useEffect(() => {
    setIsSaved(true);

    if (projectId) {
      refetchProject();

      const secretIdRef = projectSecretRefs[projectId!];
      if (secretIdRef && !secretId) {
        setSecretId(secretIdRef);
      }
    }
  }, [projectId]);

  useEffect(() => {
    if (updatedProject) {
      setProject(updatedProject);
    }
  }, [updatedProject]);

  useEffect(() => {
    setLoadingStates([isLoadingProjects, isLoadingProject, isLoadingSecret]);
  }, [isLoadingProjects, isLoadingProject, isLoadingSecret]);

  return null;
};

export default ProjectWatcher;
