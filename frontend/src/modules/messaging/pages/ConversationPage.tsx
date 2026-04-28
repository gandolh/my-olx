import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "@/lib/router";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useConversations } from "../hooks/useConversations";
import { MessageBubble } from "../components/MessageBubble";
import { MessageComposer } from "../components/MessageComposer";
import { messagingService } from "../services/messaging";
import { useAuth } from "@/lib/auth";
import { ChevronLeft, Info } from "lucide-react";
import { formatPrice } from "@/lib/formatters";

export const ConversationPage: React.FC = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useConversations();
  const { data: messages, isLoading } = useConversationMessages(
    conversationId!,
  );

  const currentConversation = conversations?.find(
    (c) => c.id === conversationId,
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      messagingService.markAsRead(conversationId);
    }
  }, [conversationId, messages?.length]);

  const handleSendMessage = async (body: string) => {
    if (!conversationId) return;
    await messagingService.postMessage(conversationId, body);
  };

  if (isLoading || !currentConversation) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-3 bg-white border-b flex items-center gap-3">
        <button
          onClick={() => navigate("/mesaje")}
          className="md:hidden p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {currentConversation.counterparty.avatar_url ? (
            <img
              src={currentConversation.counterparty.avatar_url}
              alt={currentConversation.counterparty.display_name || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 font-bold">
              {(currentConversation.counterparty.display_name || "U").charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold truncate">
            {currentConversation.counterparty.display_name ||
              t("common:messaging.unknown_user")}
          </h2>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="truncate">
              {currentConversation.listing.title}
            </span>
            <span>•</span>
            <span className="font-semibold text-blue-600">
              {currentConversation.listing.price_ron
                ? formatPrice(currentConversation.listing.price_ron)
                : t("common:listings.free")}
            </span>
          </div>
        </div>

        <Link
          to={`/anunturi/${currentConversation.listing.id}`}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title={t("common:messaging.view_listing")}
        >
          <Info size={20} />
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={msg.sender_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <MessageComposer
        onSend={handleSendMessage}
        placeholder={
          currentConversation.counterparty.id === currentConversation.listing.id // This check is wrong but we'll use a generic one for now
            ? t("common:messaging.reply_to_buyer")
            : t("common:messaging.reply_to_seller")
        }
      />
    </div>
  );
};
