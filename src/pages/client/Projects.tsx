import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Calendar, Clock, AlertCircle, CheckCircle,
  Edit3, Eye, MessageSquare, ChevronLeft, ChevronRight } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Project {
  id: string;
  name: string;
  status: string;
  album_type: string;
  page_count: number;
  created_at: string;
  submitted_at: string | null;
  admin_notes: string | null;
}

export default function ClientProjects() {
  const { t, language, isRTL } = useLanguage();
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase.
      from('projects').
      select('*').
      eq('client_id', user.id).
      order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data as Project[] || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: {[key: string]: {icon: any;color: string;bgColor: string;label: string;};} = {
      draft: {
        icon: Edit3,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: language === 'he' ? 'טיוטה' : 'Draft'
      },
      submitted: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: language === 'he' ? 'הוגש לאישור' : 'Submitted'
      },
      changes_requested: {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: language === 'he' ? 'נדרשים שינויים' : 'Changes Requested'
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: language === 'he' ? 'אושר' : 'Approved'
      },
      printed: {
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: language === 'he' ? 'הודפס' : 'Printed'
      }
    };
    return configs[status] || configs.draft;
  };

  const getAlbumTypeLabel = (type: string) => {
    const labels: {[key: string]: string;} = {
      wedding: language === 'he' ? 'אלבום חתונה' : 'Wedding Album',
      baby: language === 'he' ? 'אלבום תינוק' : 'Baby Album',
      travel: language === 'he' ? 'אלבום טיול' : 'Travel Album',
      family: language === 'he' ? 'אלבום משפחה' : 'Family Album',
      holiday: language === 'he' ? 'אלבום חגים' : 'Holiday Album',
      custom: language === 'he' ? 'אלבום מותאם אישית' : 'Custom Album'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div data-ev-id="ev_3a5591af6e" className="p-6 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div data-ev-id="ev_45dc04f390" className="mb-8">
        <h1 data-ev-id="ev_3f271d1546" className="text-3xl font-bold text-foreground">
          {language === 'he' ? `שלום ${profile?.full_name || ''}!` : `Hello ${profile?.full_name || ''}!`}
        </h1>
        <p data-ev-id="ev_17599dc5e3" className="text-muted-foreground mt-2">
          {language === 'he' ?
          'כאן תוכל לצפות בכל הפרויקטים שלך ולהמשיך לערוך אותם' :
          'Here you can view and edit all your album projects'
          }
        </p>
      </div>

      {/* Projects List */}
      {loading ?
      <div data-ev-id="ev_9ac4170658" className="flex flex-col gap-4">
          {[1, 2, 3].map((i) =>
        <div data-ev-id="ev_1677ec3f65" key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
        )}
        </div> :
      projects.length === 0 ?
      <Card className="p-12 text-center">
          <FolderOpen className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
          <h3 data-ev-id="ev_046d39f2d8" className="text-xl font-semibold mb-2">{t('no_projects')}</h3>
          <p data-ev-id="ev_27524f6c69" className="text-muted-foreground">
            {language === 'he' ?
          'כשהמנהל יצור עבורך פרויקט חדש, הוא יופיע כאן' :
          'When your manager creates a project for you, it will appear here'
          }
          </p>
        </Card> :

      <div data-ev-id="ev_7436c883fb" className="flex flex-col gap-4">
          <AnimatePresence>
            {projects.map((project, index) => {
            const statusConfig = getStatusConfig(project.status);
            const StatusIcon = statusConfig.icon;
            const canEdit = project.status === 'draft' || project.status === 'changes_requested';

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>

                  <Card hoverable className="overflow-hidden">
                    <CardContent className="p-0">
                      <div data-ev-id="ev_c11ee3ed9b" className="flex flex-col md:flex-row">
                        {/* Album Preview */}
                        <div data-ev-id="ev_a7b3f1a16f" className="w-full md:w-48 h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <div data-ev-id="ev_50db183276" className="w-24 h-32 bg-white rounded shadow-lg flex items-center justify-center">
                            <FolderOpen className="w-10 h-10 text-primary/50" />
                          </div>
                        </div>

                        {/* Project Info */}
                        <div data-ev-id="ev_7aa47e23e6" className="flex-1 p-5">
                          <div data-ev-id="ev_4b3fdcdc41" className="flex items-start justify-between mb-3">
                            <div data-ev-id="ev_918e899fc8">
                              <h3 data-ev-id="ev_67e1f46ec6" className="text-xl font-semibold">{project.name}</h3>
                              <p data-ev-id="ev_4ecdc7665e" className="text-muted-foreground">{getAlbumTypeLabel(project.album_type)}</p>
                            </div>
                            <div data-ev-id="ev_5d51400e01" className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor}`}>
                              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                              <span data-ev-id="ev_5b16c60f9c" className={`text-sm font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div data-ev-id="ev_6e7f413fe8" className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                            <div data-ev-id="ev_cc29e97abc" className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span data-ev-id="ev_8fbdfaaf3c">{formatDate(project.created_at)}</span>
                            </div>
                            <div data-ev-id="ev_a51b142273">
                              {project.page_count} {language === 'he' ? 'פריסות' : 'spreads'}
                            </div>
                          </div>

                          {/* Admin Notes (if changes requested) */}
                          {project.status === 'changes_requested' && project.admin_notes &&
                        <div data-ev-id="ev_e80b049aa5" className="mb-4">
                              <button data-ev-id="ev_6811e5cd8f"
                          onClick={() => setExpandedNotes(expandedNotes === project.id ? null : project.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">

                                <MessageSquare className="w-4 h-4" />
                                <span data-ev-id="ev_543ac544a0" className="text-sm font-medium">
                                  {language === 'he' ? 'צפה בהערות מהמנהל' : 'View admin feedback'}
                                </span>
                              </button>
                              <AnimatePresence>
                                {expandedNotes === project.id &&
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">

                                    {project.admin_notes}
                                  </motion.div>
                            }
                              </AnimatePresence>
                            </div>
                        }

                          {/* Actions */}
                          <div data-ev-id="ev_e11f3ea766" className="flex items-center gap-3">
                            {canEdit ?
                          <Link to={`/editor/${project.id}`}>
                                <Button className="gap-2">
                                  <Edit3 className="w-4 h-4" />
                                  {t('continue_editing')}
                                  <Arrow className="w-4 h-4" />
                                </Button>
                              </Link> :

                          <Link to={`/editor/${project.id}`}>
                                <Button variant="outline" className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  {language === 'he' ? 'צפה באלבום' : 'View Album'}
                                </Button>
                              </Link>
                          }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>);

          })}
          </AnimatePresence>
        </div>
      }
    </div>);

}