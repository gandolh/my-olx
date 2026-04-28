import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, AlertCircle, Phone, Smartphone } from "lucide-react";
import { usePhoneVerify } from "../hooks/usePhoneVerify";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { toast } from "sonner";
import { Dialog } from "@base-ui/react/dialog";

interface PhoneVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PhoneVerifyModal: React.FC<PhoneVerifyModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const { request, verify } = usePhoneVerify();
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request.mutateAsync(phone);
      setStep("code");
      setResendCountdown(60);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 429) {
        toast.error(t("phoneVerify.errorRateLimit"));
      } else {
        toast.error(t("common.error"));
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verify.mutateAsync(code);
      toast.success(t("phoneVerify.success"));
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(t("phoneVerify.errorInvalidCode"));
    }
  };

  useEffect(() => {
    if (code.length === 6 && step === "code") {
      handleVerifyCode({ preventDefault: () => {} } as React.FormEvent);
    }
  }, [code, step]);

  const isDev = import.meta.env.DEV;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Popup className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              {t("phoneVerify.title")}
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {isDev && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-100">
              <AlertCircle className="h-4 w-4" />
              <span>{t("phoneVerify.devHint")}</span>
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t("phoneVerify.stepPhone")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("phoneVerify.phoneHelp")}
                </p>
              </div>

              <FormField
                label={t("phoneVerify.phoneLabel")}
                name="phone"
                type="tel"
                placeholder={t("phoneVerify.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />

              <SubmitButton
                isLoading={request.isPending}
                className="w-full py-3"
              >
                {t("phoneVerify.sendCode")}
              </SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t("phoneVerify.stepCode")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("phoneVerify.codeSentTo")}{" "}
                  <span className="font-medium text-gray-900">{phone}</span>
                </p>
              </div>

              <FormField
                label={t("phoneVerify.codeLabel")}
                name="code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 6) setCode(val);
                }}
                required
                autoFocus
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />

              <SubmitButton
                isLoading={verify.isPending}
                className="w-full py-3"
              >
                {t("phoneVerify.verifyCode")}
              </SubmitButton>

              <button
                type="button"
                onClick={() =>
                  resendCountdown === 0 &&
                  handleRequestCode({
                    preventDefault: () => {},
                  } as React.FormEvent)
                }
                disabled={resendCountdown > 0 || request.isPending}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 transition-colors py-2"
              >
                {resendCountdown > 0
                  ? t("phoneVerify.resendCode", { seconds: resendCountdown })
                  : t("phoneVerify.resendReady")}
              </button>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PhoneVerifyModal;
