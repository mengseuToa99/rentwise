// UnitForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Trash, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export interface RoomTypePrice {
  id: number;
  roomType: string;
  price: string;
}

interface UnitFormProps {
  index: number;
  remove: (index: number) => void;
  roomTypePrices?: RoomTypePrice[];
  utilities: Array<{ utility_name: string; isDefault?: boolean }>;
}

const UnitForm: React.FC<UnitFormProps> = ({
  index,
  remove,
  roomTypePrices = [],
  utilities,
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { control, setValue } = useFormContext();

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setValue(`units[${index}].roomDueDate`, selectedDate);
  };

  useEffect(() => {
    if (date) {
      setValue(`units[${index}].roomDueDate`, date);
    }
  }, [date, index, setValue]);

  return (
    <div className="relative p-4 border rounded-lg w-full">
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Available</span>
        <FormField
          control={control}
          name={`units[${index}].available`}
          render={({ field }) => (
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
            </FormControl>
          )}
        />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={control}
            name={`units[${index}].unitNumber`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Unit Number</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Unit Number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`units[${index}].unitDescrption`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Unit Description</FormLabel>
                <FormControl>
                  <Input placeholder="Unit Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={control}
            name={`units[${index}].roomType`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Room Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const selected = roomTypePrices.find(
                      (rt) => rt.roomType === value
                    );
                    if (selected) {
                      setValue(`units[${index}].unitPrice`, selected.price);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roomTypePrices
                      .filter((rt) => rt.roomType.trim() !== "")
                      .map((rt) => (
                        <SelectItem key={rt.id} value={rt.roomType}>
                          {rt.roomType}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`units[${index}].unitPrice`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input placeholder="Unit Price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {utilities
            .filter(utility => utility.isDefault)
            .map((utility, utilityIndex) => (
              <FormField
                key={utility.utility_name}
                control={control}
                name={`units[${index}].utilityReadings.${utilityIndex}.reading`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{utility.utility_name} Reading</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder={`Enter ${utility.utility_name} Reading`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

          <FormField
            control={control}
            name={`units[${index}].roomDueDate`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Room Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? date.toDateString() : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          variant="destructive"
          onClick={() => remove(index)}
          className="h-10"
        >
          <Trash size={16} />
        </Button>
      </div>
    </div>
  );
};

export default UnitForm;