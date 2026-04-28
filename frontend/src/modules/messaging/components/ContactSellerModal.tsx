import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { messagingService } from "../services/messaging";
import { useNavigate } from "@/lib/router";

interface Props {
  listingId: string;
  sellerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSellerModal: React.FC<Props> = ({
  listingId,
  sellerName,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      const { conversation } = await messagingService.startConversation(
        listingId,
        message,
      );
      onClose();
      navigate(`/mesaje/${conversation.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t("common:errors.generic"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {t("common:messaging.contact_seller_title", { name: sellerName })}
            </Dialog.Title>
            <Dialog.Close className="p-1 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("common:messaging.contact_placeholder")}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              disabled={isSending}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg"
                disabled={isSending}
              >
                {t("common:actions.cancel")}
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {isSending
                  ? t("common:actions.sending")
                  : t("common:actions.send")}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
