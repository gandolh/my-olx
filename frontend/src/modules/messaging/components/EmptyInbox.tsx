import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';

export const EmptyInbox: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('common:messaging.empty_inbox_title')}
      </h3>
      <p className="text-gray-500 max-w-xs">
        {t('common:messaging.empty_inbox_description')}
      </p>
    </div>
  );
};
