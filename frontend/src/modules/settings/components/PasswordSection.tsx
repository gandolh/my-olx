import React, { useState } from 'react';
import { useChangePassword } from '../hooks/useProfile';
import { FormField } from '@/modules/auth/components/FormField';
import { SubmitButton } from '@/modules/auth/components/SubmitButton';

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Parolele noi nu coincid');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Parola a fost schimbată cu succes!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'A apărut o eroare la schimbarea parolei');
    }
  };

  return (
    <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
      <h3 className="text-xl font-semibold mb-6">Securitate</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Parola actuală"
          id="current_password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <FormField
          label="Parola nouă"
          id="new_password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <FormField
          label="Confirmă parola nouă"
          id="confirm_password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-error text-sm">{error}</p>
        )}

        <div className="pt-2">
          <SubmitButton
            isLoading={changePasswordMutation.isPending}
            className="w-full md:w-auto"
          >
            Schimbă parola
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
