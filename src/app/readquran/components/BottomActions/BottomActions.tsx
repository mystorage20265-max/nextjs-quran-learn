/**
 * Standalone Quran UI - BottomActions Component
 * Self-contained tabs for verse-related content
 */

import React, { useState } from 'react';
import { classNames } from '../../utils';
import type { BottomActionsProps, TabConfig } from '../../types';
import './BottomActions.scss';

export const BottomActions: React.FC<BottomActionsProps> = ({
  verseKey,
  tabs = [],
  activeTab: controlledActiveTab,
  onTabChange,
  className,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  
  const activeTab = controlledActiveTab ?? internalActiveTab;
  
  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };
  
  if (tabs.length === 0) return null;
  
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
  
  return (
    <div className={classNames('bottom-actions', className)}>
      <div className="bottom-actions__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={classNames(
              'bottom-actions__tab',
              activeTab === tab.id && 'bottom-actions__tab--active'
            )}
            onClick={() => handleTabClick(tab.id)}
            aria-label={tab.label}
          >
            {tab.icon && (
              <span className="bottom-actions__tab-icon">{tab.icon}</span>
            )}
            <span className="bottom-actions__tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {activeTabContent && (
        <div className="bottom-actions__content">
          {activeTabContent}
        </div>
      )}
    </div>
  );
};

export default BottomActions;
