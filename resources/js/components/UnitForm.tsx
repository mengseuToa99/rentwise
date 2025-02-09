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
// Import the Switch component from your UI library.
import { Switch } from "@/components/ui/switch";

// Export the RoomTypePrice interface so it can be shared with the parent.
export interface RoomTypePrice {
  id: number;
  roomType: string;
  price: string;
}

interface UnitFormProps {
  index: number;
  remove: (index: number) => void;
  /** Array of room type price objects passed from the parent. */
  roomTypePrices?: RoomTypePrice[];
}

const UnitForm: React.FC<UnitFormProps> = ({
  index,
  remove,
  roomTypePrices = [],
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { control, setValue } = useFormContext();

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setValue(`units[${index}].roomDueDate`, selectedDate);
  };

  // Ensure the due date is set in the form state once the component mounts or date changes.
  useEffect(() => {
    setValue(`units[${index}].roomDueDate`, date);
  }, [date, index, setValue]);

  return (
    <div className="relative p-4 border rounded-lg w-full">
      {/* Availability switch positioned at top right */}
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

      {/* The form fields below have a top margin to avoid overlapping the switch */}
      <div className="mt-8 space-y-4">
        {/* First Row - Unit Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={control}
            name={`units[${index}].unitNumber`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Unit Number</FormLabel>
                <FormControl>
                  <Input placeholder="Unit Number" {...field} />
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

        {/* Second Row - Room Type & Price */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={control}
            name={`units[${index}].roomType`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Room Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // When a room type is selected, look up its price.
                      const selected = roomTypePrices.find(
                        (rt) => rt.roomType === value
                      );
                      if (selected) {
                        setValue(`units[${index}].unitPrice`, selected.price);
                      }
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
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
                </FormControl>
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

        {/* Third Row - Utilities & Due Date */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={control}
            name={`units[${index}].electricityReading`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Electricity Reading</FormLabel>
                <FormControl>
                  <Input placeholder="Electricity Reading" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`units[${index}].waterReading`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Water Reading</FormLabel>
                <FormControl>
                  <Input placeholder="Water Reading" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`units[${index}].roomDueDate`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Room Due Date</FormLabel>
                <FormControl>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Remove Unit Button */}
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
