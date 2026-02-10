"use client";

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  onlineInStock: boolean;
  quantity?: number;
  className?: string;
  size?: 'small' | 'large';
  onClick?: (e?: React.MouseEvent) => void;
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  onlineInStock,
  quantity = 1,
  className = '',
  size = 'small',
  onClick
}: AddToCartButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const { addItem } = useCart();

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!onlineInStock) return;

    // Add item to cart with specified quantity
    addItem({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
    }, quantity);

    // Trigger the temporary state change
    setIsClicked(true);

    // Call the optional onClick handler if provided
    if (onClick) {
      onClick(e);
    }

    // Reset the button state after 2 seconds
    setTimeout(() => {
      setIsClicked(false);
    }, 2000);
  };

  const baseClasses = "font-black rounded-2xl transition-all duration-300 transform uppercase tracking-wide";

  const sizeClasses = size === 'large'
    ? "py-4 px-8 text-lg"
    : "px-4 py-3";

  const stateClasses = onlineInStock
    ? isClicked
      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-default'
      : 'bg-gradient-to-r from-brand-orange to-brand-coral text-white hover:from-brand-coral hover:to-brand-orange hover:scale-105 shadow-brutal hover:shadow-brutal-lg cursor-pointer'
    : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50';

  const buttonText = onlineInStock
    ? isClicked
      ? '✓ ADDED TO CART!'
      : size === 'large'
        ? 'Add to Cart'
        : 'ADD TO CART'
    : size === 'large'
      ? 'Out of Stock'
      : 'OUT OF STOCK';

  return (
    <button
      onClick={handleClick}
      disabled={!onlineInStock || isClicked}
      className={`${baseClasses} ${sizeClasses} ${stateClasses} ${className}`}
    >
      {buttonText}
    </button>
  );
}
