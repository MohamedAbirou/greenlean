/**
 * Question Renderer Component
 * Renders different question types
 */

import { Badge } from "../../../shared/components/ui/badge";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import { Slider } from "../../../shared/components/ui/slider";
import { Textarea } from "../../../shared/components/ui/textarea";
import type { QuizQuestion } from "../types";

interface QuestionRendererProps {
  question: QuizQuestion;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const renderByType = () => {
    switch (question.type) {
      case "weight":
      case "height":
        return (
          <WeightHeightInput
            value={value}
            onChange={onChange}
            units={question.units || ["kg"]}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
          />
        );

      case "radio":
        return (
          <RadioInput
            value={value}
            onChange={onChange}
            options={question.options || []}
          />
        );

      case "select":
        return (
          <SelectInput
            value={value}
            onChange={onChange}
            options={question.options || []}
            placeholder={question.placeholder}
          />
        );

      case "multiselect":
        return (
          <MultiSelectInput
            value={value || []}
            onChange={onChange}
            options={question.options || []}
          />
        );

      case "slider":
        return (
          <SliderInput
            value={value}
            onChange={onChange}
            min={question.min || 0}
            max={question.max || 100}
            step={question.step || 1}
          />
        );

      case "textarea":
        return (
          <TextareaInput
            value={value}
            onChange={onChange}
            placeholder={question.placeholder}
          />
        );

      case "number":
        return (
          <NumberInput
            value={value}
            onChange={onChange}
            min={question.min}
            max={question.max}
            placeholder={question.placeholder}
          />
        );

      default:
        return <Input value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    }
  };

  return <div className="space-y-4">{renderByType()}</div>;
}

function WeightHeightInput({
  value,
  onChange,
  units,
  placeholder,
  min,
  max,
}: {
  value: any;
  onChange: (val: any) => void;
  units: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  const currentValue = value?.value || "";
  const currentUnit = value?.unit || units[0];

  const handleValueChange = (newValue: string) => {
    onChange({ value: parseFloat(newValue) || 0, unit: currentUnit });
  };

  const handleUnitChange = (newUnit: string) => {
    onChange({ value: currentValue, unit: newUnit });
  };

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        value={currentValue}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="flex-1"
      />
      <Select value={currentUnit} onValueChange={handleUnitChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => (
            <SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function RadioInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange}>
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={option} />
          <Label htmlFor={option} className="cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || "Select an option"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiSelectInput({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  options: string[];
}) {
  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div
          key={option}
          onClick={() => toggleOption(option)}
          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
            value.includes(option)
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{option}</span>
            {value.includes(option) && <Badge variant="default">Selected</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SliderInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{min}</span>
        <span className="font-semibold text-foreground text-lg">{value || min}</span>
        <span>{max}</span>
      </div>
      <Slider
        value={[value || min]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

function TextareaInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="resize-none"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  placeholder,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <Input
      type="number"
      value={value || ""}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      placeholder={placeholder}
    />
  );
}
