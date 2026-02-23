import React from 'react'

interface ModalCardProps {
  /** Content to display inside the modal */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable modal card component with consistent styling
 */
export const ModalCard: React.FC<ModalCardProps> = ({
  children,
  className = ''
}) => (
  <div
    className={`bg-grey500-mode1 border-grey100-mode1 flex w-md flex-col items-center gap-2.5 rounded-[20px] border p-5 px-11 ${className}`}
  >
    {children}
  </div>
)
