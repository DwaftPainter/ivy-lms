import React from "react";
import { type LucideIcon } from "lucide-react";

interface ButtonIconProps {
    icon: LucideIcon;
    onClick?: () => void;
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "ghost";
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

const ButtonIcon: React.FC<ButtonIconProps> = ({
    icon: Icon,
    onClick,
    size = "md",
    variant = "primary",
    className = "",
    disabled = false,
    type = "button"
}) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-lg"
    };

    const iconSizes = {
        sm: 16,
        md: 18,
        lg: 20
    };

    const variantClasses = {
        primary: `
      bg-primary
      text-white
      hover:bg-[#991717]
      active:bg-[#7f1313] active:scale-95
      focus:ring-1 focus:ring-offset-2 focus:ring-primary/40
      transition-all duration-150
    `,
        secondary: `
      bg-gray-200
      text-gray-800
      hover:bg-gray-300
      active:bg-gray-400 active:scale-95
      focus:ring-1 focus:ring-offset-2 focus:ring-gray-400/40
      transition-all duration-150
    `,
        ghost: `
      bg-transparent
      text-gray-700
      hover:bg-gray-100
      active:bg-gray-200 active:scale-95
      focus:ring-1 focus:ring-offset-2 focus:ring-gray-300/40
      transition-all duration-150
    `
    };

    return (
        <div className="rounded-md bg-linear-to-b from-[#ffffff2b] to-[#ffffff0a] p-[1px]">
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={`
            bg-transparent
            inline-flex items-center justify-center
            rounded-md
            transition-colors duration-200
            focus:outline-none focus:ring-1 focus:ring-offset-2
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${className}
        `}
                style={{
                    border: "1px solid transparent",
                    borderImage: "linear-gradient(to bottom, #ffffff2b, #ffffff0a) 1"
                }}
            >
                <Icon size={iconSizes[size]} />
            </button>
        </div>
    );
};

export default ButtonIcon;
