'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function RegisterPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    displayName: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // 尝试读取 remote-user cookie 预填用户名
    const match = document.cookie.match(/(?:^|;\s*)remote-user=([^;]+)/);
    if (match) {
      const value = decodeURIComponent(match[1]);
      setFormData(prev => (prev.username ? prev : { ...prev, username: value }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: t('register.form.passwordMismatch') });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ username: '', password: '', confirmPassword: '', email: '', displayName: '' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch {
      setMessage({ type: 'error', text: t('messages.networkError') });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('register.title')}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{t('register.subtitle')}</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">{t('register.form.username')}</label>
              <input id="username" name="username" type="text" required value={formData.username} onChange={handleChange} className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder={t('register.form.usernamePlaceholder')} />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">{t('register.form.displayName')}</label>
              <input id="displayName" name="displayName" type="text" value={formData.displayName} onChange={handleChange} className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder={t('register.form.displayNamePlaceholder')} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('register.form.email')}</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder={t('register.form.emailPlaceholder')} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('register.form.password')}</label>
              <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder={t('register.form.passwordPlaceholder')} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t('register.form.confirmPassword')}</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder={t('register.form.confirmPasswordPlaceholder')} />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors">
              {loading ? t('register.form.submitting') : t('register.form.submit')}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>{t('register.footer.requirement')}</p>
        </div>
      </div>
    </div>
  );
}
