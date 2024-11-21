import * as React from "react";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className="rounded-lg border bg-white text-gray-950 shadow-sm"
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className="p-6" {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardContent };
