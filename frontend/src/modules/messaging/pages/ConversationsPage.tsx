import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConversations } from '../hooks/useConversations';
import { ConversationListItem } from '../components/ConversationListItem';
import { EmptyInbox } from '../components/EmptyInbox';
import { useNavigate, useParams } from 'react-router-dom';

export const ConversationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: conversations, isLoading } = useConversations();

  useEffect(() => {
    // If we have conversations and none is selected, don't auto-redirect
    // to allow the inbox view on mobile or empty state.
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-64px)] flex border-x bg-white">
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{t('common:messaging.messages')}</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isActive={conversationId === conv.id}
                onClick={() => navigate(`/mesaje/${conv.id}`)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {t('common:messaging.no_conversations')}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
        {!conversationId ? (
          <EmptyInbox />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {/* The child route ConversationPage will be rendered by the router */}
            {t('common:messaging.select_conversation')}
          </div>
        )}
      </div>
    </div>
  );
};
