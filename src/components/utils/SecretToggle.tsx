"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { EyeOff, Eye } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "../ui/input";

type SecretToggleProps = {
  name: string;
};

const SecretToggle = ({ name }: SecretToggleProps) => {
  const { control, getValues } = useFormContext();
  const value = getValues(name);
  const [isVisible, setIsVisible] = useState(!value);

  return (
    <div className="relative w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {isVisible ? (
              <Input
                {...field}
                type="text"
                autoComplete="off"
                className="pr-[55px]"
                onBlur={() => setIsVisible(false)}
              />
            ) : (
              <Input
                type="text"
                value={"*".repeat(field.value?.length || 0)}
                readOnly
                className="cursor-default pr-[55px]"
              />
            )}
          </>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        className="absolute right-0 top-1/2 transform -translate-y-1/2"
        onClick={() => setIsVisible((prev) => !prev)}>
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  );
};

export default SecretToggle;
