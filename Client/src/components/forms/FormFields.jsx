
import { TextField } from '@mui/material';

/**
 * A reusable Form Field wrapping MUI's TextField.
 * Ensures consistent styling, margins, and behavior across all forms.
 */
export default function CustomTextField({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = false, 
  error = false, 
  helperText = '',
  className = '',
  ...props 
}) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      helperText={helperText}
      className={`mb-4 ${className}`}
      {...props}
    />
  );
}
