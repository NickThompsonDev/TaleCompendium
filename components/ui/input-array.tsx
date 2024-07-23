import * as React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface InputArrayProps {
  name: string;
  label: string;
  placeholderName: string;
  placeholderValue?: string;
  control: any;
}

interface Item {
  name: string;
  description?: string;
}

const InputArray: React.FC<InputArrayProps> = ({ name, label, placeholderName, placeholderValue, control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [newItemName, setNewItemName] = React.useState("");
  const [newItemValue, setNewItemValue] = React.useState("");

  const handleAdd = () => {
    if (newItemName && (!placeholderValue || newItemValue)) {
      const newItem: Item = placeholderValue ? { name: newItemName, description: newItemValue } : { name: newItemName };

      append(newItem as any); // Type assertion to ensure compatibility with useFieldArray
      setNewItemName("");
      setNewItemValue("");
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <FormLabel className="text-16 font-bold text-white-1" htmlFor={name}>{label}</FormLabel>
      {fields.map((item, index) => (
        <div key={item.id} className="flex gap-2.5 items-center">
          <Controller
            control={control}
            name={`${name}.${index}.name`}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2.5 flex-grow">
                <FormLabel htmlFor={`${name}.${index}.name`}>{placeholderName}</FormLabel>
                <FormControl>
                  <Input
                    id={`${name}.${index}.name`}
                    className="input-class focus-visible:ring-offset-orange-1"
                    placeholder={placeholderName}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-white-1" />
              </FormItem>
            )}
          />
          {placeholderValue && (
            <Controller
              control={control}
              name={`${name}.${index}.description`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5 flex-grow">
                  <FormLabel htmlFor={`${name}.${index}.description`}>{placeholderValue}</FormLabel>
                  <FormControl>
                    <Input
                      id={`${name}.${index}.description`}
                      className="input-class focus-visible:ring-offset-orange-1"
                      placeholder={placeholderValue}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          )}
          <Button
            type="button"
            className="text-16 bg-orange-1 py-2 px-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1 flex-[0_0_15%]"
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <div className="flex gap-2.5 items-center">
        <FormItem className={placeholderValue ? "flex-[0_0_25%]" : "flex-[0_0_81%]"}>
          <FormControl>
            <Input
              className="input-class focus-visible:ring-offset-orange-1"
              placeholder={placeholderName}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </FormControl>
        </FormItem>
        {placeholderValue && (
          <FormItem className="flex-[0_0_55%]">
            <FormControl>
              <Input
                className="input-class focus-visible:ring-offset-orange-1"
                placeholder={placeholderValue}
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
              />
            </FormControl>
          </FormItem>
        )}
        <Button
          type="button"
          className="text-16 bg-orange-1 py-2 px-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1 flex-[0_0_15%]"
          onClick={handleAdd}
        >
          Add {label}
        </Button>
      </div>
    </div>
  );
};

export { InputArray };
