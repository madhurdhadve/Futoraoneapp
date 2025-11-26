import logo from "@/assets/futora-logo.png";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <img 
      src={logo} 
      alt="FutoraOne Logo" 
      className={className}
    />
  );
};
