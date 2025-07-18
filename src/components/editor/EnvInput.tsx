import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "../ui/input";
import SecretToggle from "../utils/SecretToggle";
import { IoMdClose } from "react-icons/io";
import AlertDialog from "../utils/AleartDialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";
import { useDashboardContext } from "@/context/DashboardContext";

type EnvInputProps = {
  index: number;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  onDelete: (index: number) => void;
};

const EnvInput = ({
  index,
  isVisible,
  setIsVisible,
  onDelete,
}: EnvInputProps) => {
  const { isSaved } = useProjectStore();
  const { hasWriteAccess } = useDashboardContext();

  const { control } = useFormContext();

  const watchedField = useWatch({
    name: `envVariables.${index}`,
    control,
  });

  const name = watchedField?.name || "";
  const value = watchedField?.value || "";

  const isEmpty = !name && !value;

  return (
    <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-8">
      <div className="flex gap-x-2 w-full">
        {hasWriteAccess && (
          <>
            {isSaved ? (
              !isEmpty ? (
                <AlertDialog
                  title="Delete env variable"
                  description={`Are you sure you want to delete ${name}?`}
                  action="Delete"
                  actionFn={() => onDelete(index)}
                >
                  <Button variant="ghost">
                    <IoMdClose size={16} />
                  </Button>
                </AlertDialog>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onDelete(index)}
                >
                  <IoMdClose size={16} />
                </Button>
              )
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => toast.error("Please save your changes")}
              >
                <IoMdClose size={16} />
              </Button>
            )}
          </>
        )}

        <Controller
          name={`envVariables.${index}.name`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              type="text"
              disabled={!hasWriteAccess}
              autoComplete="off"
              spellCheck="false"
              className="w-full"
            />
          )}
        />
      </div>
      <div className="pl-14 lg:p-0 w-full">
        <SecretToggle
          name={`envVariables.${index}.value`}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          disabled={!hasWriteAccess}
        />
      </div>
    </div>
  );
};

export default EnvInput;
