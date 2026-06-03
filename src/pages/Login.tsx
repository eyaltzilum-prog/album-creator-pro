import { useState, FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function Login() {
  const { user, profile, loading, signIn } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (user && profile && !loading) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/projects" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(t('invalid_credentials'));
      }
    } catch (err) {
      setError(t('login_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-ev-id="ev_0e180f41cc" className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      {/* Language Toggle */}
      <button data-ev-id="ev_87c7a20ec8"
      onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
      className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow`}>

        <Globe className="w-4 h-4" />
        {language === 'he' ? 'English' : 'עברית'}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md">

        <div data-ev-id="ev_b155833b32" className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div data-ev-id="ev_0e073cafc3" className="flex flex-col items-center mb-8">
            <div data-ev-id="ev_90a654bd84" className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 data-ev-id="ev_1c672d982b" className="text-2xl font-bold text-foreground">{t('login_title')}</h1>
            <p data-ev-id="ev_6bae41559e" className="text-muted-foreground mt-1">{t('login_subtitle')}</p>
          </div>

          {/* Form */}
          <form data-ev-id="ev_e38e53b001" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error &&
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">

                {error}
              </motion.div>
            }

            <div data-ev-id="ev_431c39d6b9" className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-muted-foreground`} />
              <input data-ev-id="ev_78d2561db1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email')}
              required
              className={`w-full h-12 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`} />

            </div>

            <div data-ev-id="ev_91b2ccc7d8" className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-muted-foreground`} />
              <input data-ev-id="ev_35969b6705"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              required
              className={`w-full h-12 ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`} />

              <button data-ev-id="ev_5a04de9856"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-muted-foreground hover:text-foreground transition-colors`}>

                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full mt-2">

              {t('login')}
            </Button>
          </form>

          {/* Forgot Password */}
          <div data-ev-id="ev_dc08f6ba18" className="mt-6 text-center">
            <button data-ev-id="ev_9210f5b733" className="text-sm text-primary hover:underline">
              {t('forgot_password')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p data-ev-id="ev_9f07ae5bab" className="text-center text-muted-foreground text-sm mt-6">
          {t('app_name')} &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>);

}