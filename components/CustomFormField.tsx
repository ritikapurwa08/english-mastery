import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  PASSWORD = "password",
}

interface CustomProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  fieldType: FormFieldType;
}

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent items-center">
          {props.iconSrc && (
            <Image src={props.iconSrc} height={24} width={24} alt={props.iconAlt || "icon"} className="ml-2" />
          )}
          <FormControl>
            <Input placeholder={props.placeholder} {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" type="text" />
          </FormControl>
        </div>
      );
    case FormFieldType.PASSWORD:
      return (
          <FormControl>
            <Input placeholder={props.placeholder} {...field} type="password" />
          </FormControl>
      );
    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea placeholder={props.placeholder} {...field} className="shad-textArea" disabled={props.disabled} />
        </FormControl>
      );
    case FormFieldType.SELECT:
        return (
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="shad-select-trigger">
                    <SelectValue placeholder={props.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="shad-select-content">
                  {props.children}
                </SelectContent>
              </Select>
            </FormControl>
          );
    case FormFieldType.CHECKBOX:
        return (
            <FormControl>
              <div className="flex items-center gap-4">
                <Checkbox
                  id={props.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label htmlFor={props.name} className="checkbox-label">
                  {props.label}
                </label>
              </div>
            </FormControl>
          );
    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;
    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, name, label } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className="shad-input-label">{label}</FormLabel>
          )}
          <RenderInput field={field} props={props} />
          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
