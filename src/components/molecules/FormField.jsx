import React from 'react';
import { Label, Input, TextArea, Select } from '../atoms';

export function FormField({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  multiline = false,
  rows = 3,
  children,
  ...props 
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {multiline || type === 'textarea' ? (
        <TextArea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          {...props}
        />
      ) : type === 'select' ? (
        <Select
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        >
          {children}
        </Select>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
    </div>
  );
}
