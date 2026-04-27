import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ShieldCheck, Phone, Mail, User } from "lucide-react";
import PhoneVerifyModal from "../../auth/components/PhoneVerifyModal";

export function SettingsPage() {
  const { user } = useAuth();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  return (
    <main className="mt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1
          className="text-3xl font-black mb-8"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Setările contului
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Section: Profile */}
            <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-on-surface">
                  Informații Profil
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Nume afișat
                  </label>
                  <div className="bg-surface-container text-on-surface px-4 py-3 rounded-lg border border-outline-variant">
                    {user?.display_name || user?.email?.split("@")[0] || "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Adresa de email
                  </label>
                  <div className="flex items-center gap-2 bg-surface-container text-on-surface px-4 py-3 rounded-lg border border-outline-variant">
                    <Mail className="w-4 h-4 text-outline" />
                    <span>{user?.email}</span>
                    {user?.email_verified && (
                      <span className="ml-auto bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Verificat
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Phone Verification */}
            <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-on-surface">
                  Verificare Telefon
                </h2>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">
                      {user?.phone || "Niciun număr adăugat"}
                    </span>
                    {user?.phone_verified ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Verificat
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Neverificat
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Numărul tău de telefon este folosit pentru a confirma
                    autenticitatea contului și pentru a primi notificări
                    importante.
                  </p>
                </div>

                {!user?.phone_verified && (
                  <button
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="w-full md:w-auto px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Verifică telefonul
                  </button>
                )}
              </div>

              {user?.phone_verified && (
                <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-on-surface-variant">
                    Contul tău are insigna de{" "}
                    <strong>Vânzător Verificat</strong>. Aceasta crește
                    încrederea cumpărătorilor în anunțurile tale.
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant shadow-sm">
              <h3 className="font-bold text-on-surface mb-4">Suport</h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Ai nevoie de ajutor cu setările contului tău?
              </p>
              <button className="w-full py-2.5 rounded-full border-2 border-outline-variant text-sm font-bold hover:bg-surface-container transition-colors">
                Contactează Echipa
              </button>
            </section>
          </div>
        </div>
      </div>

      <PhoneVerifyModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
      />
    </main>
  );
}
