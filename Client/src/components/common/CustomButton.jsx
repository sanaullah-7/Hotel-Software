
import { Button } from '@mui/material';

/**
 * A reusable Button component that wraps MUI's Button.
 * It blends MUI's robust properties with Tailwind utility classes.
 */
export default function CustomButton({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  className = '', 
  ...props 
}) {
  return (
    <Button 
      variant={variant} 
      color={color} 
      className={`rounded-md shadow-sm font-semibold capitalize ${className}`} 
      {...props}
    >
      {children}
    </Button>
  );
}
