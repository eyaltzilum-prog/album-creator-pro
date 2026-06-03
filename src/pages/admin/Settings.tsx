import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Palette, Bell, Shield, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminSettings() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || ''
  });

  const tabs = [
  { id: 'profile', icon: User, label: language === 'he' ? 'פרופיל' : 'Profile' },
  { id: 'language', icon: Globe, label: language === 'he' ? 'שפה' : 'Language' },
  { id: 'appearance', icon: Palette, label: language === 'he' ? 'מראה' : 'Appearance' },
  { id: 'notifications', icon: Bell, label: language === 'he' ? 'התראות' : 'Notifications' },
  { id: 'security', icon: Shield, label: language === 'he' ? 'אבטחה' : 'Security' }];


  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div data-ev-id="ev_f5164d5d7e" className="flex flex-col gap-6">
      {/* Page Header */}
      <div data-ev-id="ev_2fac1a5f4c">
        <h1 data-ev-id="ev_162faafc2c" className="text-2xl font-bold text-foreground">{t('settings')}</h1>
        <p data-ev-id="ev_363d71c529" className="text-muted-foreground mt-1">ניהול הגדרות המערכת</p>
      </div>

      <div data-ev-id="ev_ba71af3bbe" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav data-ev-id="ev_c5f77775ad" className="flex flex-col gap-1">
              {tabs.map((tab) =>
              <button data-ev-id="ev_9e02025761"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-start ${
              activeTab === tab.id ?
              'bg-primary text-white' :
              'hover:bg-muted text-foreground'}`
              }>

                  <tab.icon className="w-5 h-5" />
                  <span data-ev-id="ev_951a6bc338">{tab.label}</span>
                </button>
              )}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div data-ev-id="ev_3ca32877fc" className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === 'profile' &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>

              <Card>
                <CardHeader>
                  <CardTitle>פרטי פרופיל</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Input
                  label="שם מלא"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />

                  <Input
                  label="אימייל"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled
                  hint="לא ניתן לשנות את האימייל" />

                  <div data-ev-id="ev_b12e9c2d1c" className="flex justify-end pt-4">
                    <Button onClick={handleSave} loading={isSaving} className="gap-2">
                      <Save className="w-4 h-4" />
                      {t('save')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          }

          {/* Language Settings */}
          {activeTab === 'language' &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>

              <Card>
                <CardHeader>
                  <CardTitle>הגדרות שפה</CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-ev-id="ev_cf8f731926" className="flex flex-col gap-4">
                    <p data-ev-id="ev_0d304d35d2" className="text-muted-foreground">בחר את שפת הממשק המועדפת:</p>
                    <div data-ev-id="ev_47d6cce194" className="grid grid-cols-2 gap-4">
                      <button data-ev-id="ev_d3a0cee34a"
                    onClick={() => setLanguage('he')}
                    className={`p-6 rounded-xl border-2 transition-colors ${
                    language === 'he' ?
                    'border-primary bg-primary/5' :
                    'border-border hover:border-primary/50'}`
                    }>

                        <div data-ev-id="ev_29d4bb9bde" className="text-4xl mb-2">עב</div>
                        <div data-ev-id="ev_403832b9d6" className="font-medium">עברית</div>
                        <div data-ev-id="ev_1032c0a7dd" className="text-sm text-muted-foreground">Hebrew (RTL)</div>
                      </button>
                      <button data-ev-id="ev_bdfa896a70"
                    onClick={() => setLanguage('en')}
                    className={`p-6 rounded-xl border-2 transition-colors ${
                    language === 'en' ?
                    'border-primary bg-primary/5' :
                    'border-border hover:border-primary/50'}`
                    }>

                        <div data-ev-id="ev_c274337c22" className="text-4xl mb-2">EN</div>
                        <div data-ev-id="ev_470559a7dc" className="font-medium">English</div>
                        <div data-ev-id="ev_f6a2bcd30a" className="text-sm text-muted-foreground">English (LTR)</div>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          }

          {/* Appearance Settings */}
          {activeTab === 'appearance' &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>

              <Card>
                <CardHeader>
                  <CardTitle>הגדרות מראה</CardTitle>
                </CardHeader>
                <CardContent>
                  <p data-ev-id="ev_35f8e4bbad" className="text-muted-foreground">הגדרות מראה יהיו זמינות בקרוב.</p>
                </CardContent>
              </Card>
            </motion.div>
          }

          {/* Notifications Settings */}
          {activeTab === 'notifications' &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>

              <Card>
                <CardHeader>
                  <CardTitle>הגדרות התראות</CardTitle>
                </CardHeader>
                <CardContent>
                  <p data-ev-id="ev_501f8786a4" className="text-muted-foreground">הגדרות התראות יהיו זמינות בקרוב.</p>
                </CardContent>
              </Card>
            </motion.div>
          }

          {/* Security Settings */}
          {activeTab === 'security' &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>

              <Card>
                <CardHeader>
                  <CardTitle>הגדרות אבטחה</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div data-ev-id="ev_e524660cfe">
                    <h4 data-ev-id="ev_b28c70c301" className="font-medium mb-2">שינוי סיסמה</h4>
                    <Button variant="outline">שנה סיסמה</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          }
        </div>
      </div>
    </div>);

}