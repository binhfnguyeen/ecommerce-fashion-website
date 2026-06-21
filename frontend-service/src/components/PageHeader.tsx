import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionText,
  onActionClick,
}) => {
  return (
    <div className="page-title-row">
      <div>
        <h2 className="page-title">{title}</h2>
        {description && <p className="page-title-desc">{description}</p>}
      </div>
      {actionText && onActionClick && (
        <button 
          className="btn btn-primary" 
          onClick={(e) => {
            e.stopPropagation();
            onActionClick();
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
