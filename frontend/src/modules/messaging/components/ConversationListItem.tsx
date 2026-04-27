import React from "react";
import { useTranslation } from "react-i18next";
import type { ConversationSummary } from "../services/messaging";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface Props {
  conversation: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationListItem: React.FC<Props> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b ${
        isActive ? "bg-blue-50" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {conversation.counterparty.avatar_url ? (
            <img
              src={conversation.counterparty.avatar_url}
              alt={conversation.counterparty.display_name || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 font-bold">
              {(conversation.counterparty.display_name || "U").charAt(0)}
            </span>
          )}
        </div>
        {conversation.unread_count > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {conversation.unread_count}
          </div>
        )}
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {conversation.counterparty.display_name ||
              t("common:messaging.unknown_user")}
          </h3>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(conversation.last_message_at), {
              addSuffix: true,
              locale: ro,
            })}
          </span>
        </div>
        <p className="text-xs text-gray-600 truncate mt-0.5">
          {conversation.listing.title}
        </p>
        <p
          className={`text-sm truncate mt-1 ${conversation.unread_count > 0 ? "font-bold text-gray-900" : "text-gray-500"}`}
        >
          {conversation.last_message?.body || t("common:messaging.no_messages")}
        </p>
      </div>
    </div>
  );
};
