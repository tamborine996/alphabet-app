import * as React from "react";

const Button = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-gray-50 hover:bg-gray-900/90 active:scale-95 px-4 py-2 sm:px-6 sm:py-3"
    {...props}
  />
));

Button.displayName = "Button";

export default Button;
