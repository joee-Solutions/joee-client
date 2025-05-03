import React from "react";

// Define the props types
type RadioGroupProps = {
  value: string | null;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

type RadioGroupItemProps = {
  value: string;
  id: string;
  name?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
};

// Radio Group Component
const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  // Create a common name for all radio inputs if not provided
  const groupName = "radio-group-" + Math.random().toString(36).substring(2, 9);

  // Helper function to recursively process children
  const processChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement<RadioGroupItemProps>(child)) return child;

      // Process RadioGroupItem directly
      if ((child.type as React.FC).displayName === "RadioGroupItem") {
        return React.cloneElement(child, {
          checked: child.props.value === value,
          onChange: () => onValueChange(child.props.value),
          name: child.props.name || groupName,
        });
      }

      // Process nested children recursively
      if (child.props && child.props.children) {
        const newChildren = processChildren(child.props.children);
        return React.cloneElement(child, { children: newChildren });
      }

      return child;
    });
  };

  return (
    <div role="radiogroup" className={className}>
      {processChildren(children)}
    </div>
  );
};

// Radio Group Item Component
const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  id,
  name,
  checked,
  onChange,
  className,
  children,
}) => {
  return (
    <div className={`flex items-center ${className || ""}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked || false}
        onChange={() => onChange && onChange(value)}
        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <label htmlFor={id} className="ml-2 text-gray-700">
        {children || value}
      </label>
    </div>
  );
};

// Set displayName explicitly to ensure proper identification
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };