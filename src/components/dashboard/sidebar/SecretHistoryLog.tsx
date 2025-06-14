"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import { SecretHistory } from "@/types/types";
import { cn, timeAgo } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { Badge } from "@/components/ui/badge";
import { ENVIRONMENTS } from "@/config";
import SkeletonWrapper from "@/components/utils/loaders/SkeletonWrapper";
import { useSidebar } from "@/components/ui/sidebar";
import { LuHistory } from "react-icons/lu";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVirtualQuery } from "@/hooks/use-virtual-query";

const SecretHistoryLog = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const secretId = useProjectStore((state) => state.secretId);
  const secret = useProjectStore((state) => state.secret);

  const isSaved = useProjectStore((state) => state.isSaved);
  const isLoading = useProjectStore((state) => state.isLoading);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const setLoadingStates = useSidebarStore((state) => state.setLoadingStates);
  const isLoadingSidebar = useSidebarStore((state) => state.isLoading);

  const [isReadyToRender, setIsReadyToRender] = useState(true);
  const [hasLoadedSecret, setHasLoadedSecret] = useState(false);

  const {
    data: logs,
    refetch: refetchLogs,
    isLoading: isLoadingLogs,
  } = useVirtualQuery<SecretHistory[] | null>(
    () => trpc.secret.getHistory.useQuery(undefined, { retry: false }),
    [],
    "logs"
  );

  const { mutate: saveToHistory, isPending: isSavingToHistory } =
    trpc.secret.saveToHistory.useMutation({
      onSettled: () => {
        setIsReadyToRender(false);
        refetchLogs().then(() => setIsReadyToRender(true));
      },
    });

  useEffect(() => {
    setLoadingStates([isLoadingLogs, isLoading]);
  }, [isLoadingLogs, isLoading]);

  useEffect(() => {
    if (secretId && !hasLoadedSecret) {
      saveToHistory({ secretId });
    }

    setHasLoadedSecret(false);
  }, [secretId]);

  useEffect(() => {
    if (!secret && !secretId) {
      refetchLogs();
    }
  }, [secret]);

  const loadSecret = (log: SecretHistory) => {
    setProjectId(log.project_id);
    setSecretId(log.secret_id);
    isMobile && toggleSidebar();
    saveToHistory({ secretId: log.secret_id });
    setHasLoadedSecret(true);
  };

  const isLoadingUI =
    isLoadingLogs ||
    isLoading ||
    (isLoadingSidebar && isMobile) ||
    !isReadyToRender ||
    isSavingToHistory;

  const isCollapsed = state === "collapsed" && !isMobile;

  if (isCollapsed) {
    return (
      <Button onClick={toggleSidebar} variant="ghost">
        <LuHistory size={24} />
      </Button>
    );
  }

  return (
    <SkeletonWrapper skeletons={8} isLoading={isLoadingUI} className="flex flex-col gap-y-4">
      <div>
        <p className="text-lg text-text-color mb-8">Your history</p>
        <ScrollArea
          className={cn(
            "flex flex-col gap-y-4 max-h-[500px]",
            isCollapsed ? "overflow-y-hidden" : "overflow-y-auto"
          )}>
          {logs?.map((log) => {
            const logContent = (
              <div className="flex flex-col gap-y-2 w-full">
                <span className="text-text-color text-sm">{log.project}</span>
                <div className="flex justify-between items-center w-full">
                  <Badge variant="outline">
                    {ENVIRONMENTS.find((env) => env.value === log.environment)?.label}
                  </Badge>
                  <span className="text-xs">{timeAgo(log.created_at)}</span>
                </div>
                <p
                  className={cn({
                    "text-primary underline": secretId === log.secret_id,
                  })}>
                  {log.path}
                </p>
              </div>
            );

            return (
              <div key={log.id} className="my-2 px-1">
                {isSaved ? (
                  <Button
                    onClick={() => loadSecret(log)}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                      {
                        "hover:bg-transparent hover:text-foreground": secretId === log.secret_id,
                      }
                    )}>
                    {logContent}
                  </Button>
                ) : (
                  <AlertDialog
                    title="Are you sure you want to change .env file?"
                    description="Any unsaved changes will be lost. This action cannot be undone."
                    action="Continue"
                    actionFn={() => loadSecret(log)}>
                    <Button
                      onClick={() => loadSecret(log)}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                        {
                          "hover:bg-transparent hover:text-foreground": secretId === log.secret_id,
                        }
                      )}>
                      {logContent}
                    </Button>
                  </AlertDialog>
                )}
              </div>
            );
          })}
        </ScrollArea>
      </div>
    </SkeletonWrapper>
  );
};

export default SecretHistoryLog;
