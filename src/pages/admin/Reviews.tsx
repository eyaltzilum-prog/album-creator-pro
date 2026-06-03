import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, CheckCircle, XCircle, MessageSquare, Download,
  Clock, User, Calendar, ChevronDown, ChevronUp } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ProjectSubmission {
  id: string;
  name: string;
  status: string;
  submitted_at: string;
  client: {
    id: string;
    full_name: string | null;
    email: string;
  };
  page_count: number;
  album_type: string;
}

export default function AdminReviews() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('submitted');

  useEffect(() => {
    fetchProjects();
  }, [filterStatus]);

  const fetchProjects = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      let query = supabase
        .from('projects')
        .select('id, name, status, submitted_at, page_count, album_type, client_id')
        .order('submitted_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch client profiles separately
        const clientIds = [...new Set(data.map(p => p.client_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', clientIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        setProjects(
          data.map((p: any) => ({
            ...p,
            client: profileMap.get(p.client_id) || { id: p.client_id, full_name: null, email: 'Unknown' },
          }))
        );
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: string) => {
    if (!supabase || !user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.
      from('projects').
      update({
        status: 'approved',
        approved_at: new Date().toISOString()
      }).
      eq('id', projectId);

      if (error) throw error;

      // Create submission record
      await supabase.from('submissions').insert({
        project_id: projectId,
        submitted_by: selectedProject?.client.id,
        reviewed_by: user.id,
        status: 'approved',
        reviewed_at: new Date().toISOString()
      });

      setShowReviewModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error approving project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async (projectId: string) => {
    if (!supabase || !user || !reviewNotes.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.
      from('projects').
      update({
        status: 'changes_requested',
        admin_notes: reviewNotes
      }).
      eq('id', projectId);

      if (error) throw error;

      // Create submission record
      await supabase.from('submissions').insert({
        project_id: projectId,
        submitted_by: selectedProject?.client.id,
        reviewed_by: user.id,
        status: 'changes_requested',
        admin_notes: reviewNotes,
        reviewed_at: new Date().toISOString()
      });

      setShowReviewModal(false);
      setReviewNotes('');
      fetchProjects();
    } catch (error) {
      console.error('Error requesting changes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: {[key: string]: string;} = {
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      changes_requested: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      printed: 'bg-blue-100 text-blue-800'
    };
    const labels: {[key: string]: string;} = {
      submitted: language === 'he' ? 'הוגש' : 'Submitted',
      approved: language === 'he' ? 'אושר' : 'Approved',
      changes_requested: language === 'he' ? 'נדרשים שינויים' : 'Changes Requested',
      draft: language === 'he' ? 'טיוטה' : 'Draft',
      printed: language === 'he' ? 'הודפס' : 'Printed'
    };
    return (
      <span data-ev-id="ev_1da8a90916" className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>);

  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlbumTypeLabel = (type: string) => {
    const labels: {[key: string]: string;} = {
      wedding: language === 'he' ? 'חתונה' : 'Wedding',
      baby: language === 'he' ? 'תינוק' : 'Baby',
      travel: language === 'he' ? 'טיול' : 'Travel',
      family: language === 'he' ? 'משפחה' : 'Family',
      holiday: language === 'he' ? 'חגים' : 'Holiday',
      custom: language === 'he' ? 'מותאם אישית' : 'Custom'
    };
    return labels[type] || type;
  };

  return (
    <div data-ev-id="ev_6a46fdcba3" className="flex flex-col gap-6">
      {/* Page Header */}
      <div data-ev-id="ev_bb79e749cf">
        <h1 data-ev-id="ev_8f5fbeb4f6" className="text-2xl font-bold text-foreground">{t('reviews')}</h1>
        <p data-ev-id="ev_7065d446d9" className="text-muted-foreground mt-1">סקירה ואישור אלבומים שהוגשו</p>
      </div>

      {/* Filter Tabs */}
      <div data-ev-id="ev_f70c9ef48d" className="flex gap-2 border-b border-border pb-4">
        {['submitted', 'changes_requested', 'approved', 'all'].map((status) =>
        <Button
          key={status}
          variant={filterStatus === status ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilterStatus(status)}>

            {status === 'submitted' && 'ממתינים לאישור'}
            {status === 'changes_requested' && 'נדרשים שינויים'}
            {status === 'approved' && 'אושרו'}
            {status === 'all' && 'הכל'}
          </Button>
        )}
      </div>

      {/* Projects List */}
      {loading ?
      <div data-ev-id="ev_2bfd6b383f" className="flex flex-col gap-4">
          {[1, 2, 3].map((i) =>
        <div data-ev-id="ev_bddf841394" key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        )}
        </div> :
      projects.length === 0 ?
      <Card className="p-12 text-center">
          <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 data-ev-id="ev_8cbd8d4d87" className="text-lg font-medium mb-2">אין אלבומים לסקירה</h3>
          <p data-ev-id="ev_17aa84f2ae" className="text-muted-foreground">כל האלבומים שיוגשו יופיעו כאן</p>
        </Card> :

      <div data-ev-id="ev_242455119b" className="flex flex-col gap-4">
          <AnimatePresence>
            {projects.map((project, index) =>
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}>

                <Card hoverable>
                  <CardContent className="p-5">
                    <div data-ev-id="ev_f343150361" className="flex items-center justify-between">
                      <div data-ev-id="ev_f62cb4be8e" className="flex items-center gap-4">
                        <div data-ev-id="ev_032d29d9e7" className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div data-ev-id="ev_1e89abea96">
                          <div data-ev-id="ev_5fb1316770" className="flex items-center gap-2">
                            <h3 data-ev-id="ev_17eb84931a" className="font-semibold">{project.name}</h3>
                            {getStatusBadge(project.status)}
                          </div>
                          <p data-ev-id="ev_8afd56c737" className="text-sm text-muted-foreground">
                            {project.client?.full_name || project.client?.email}
                          </p>
                          <div data-ev-id="ev_bbbef90302" className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span data-ev-id="ev_486cc73b56">{getAlbumTypeLabel(project.album_type)}</span>
                            <span data-ev-id="ev_ff1b3c177f">•</span>
                            <span data-ev-id="ev_6200842f59">{project.page_count} עמודים</span>
                            <span data-ev-id="ev_d386502ecb">•</span>
                            <span data-ev-id="ev_ae96082628">{formatDate(project.submitted_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div data-ev-id="ev_dd389ee04c" className="flex items-center gap-2">
                        <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowReviewModal(true);
                      }}>

                          <Eye className="w-4 h-4" />
                          צפה וסקור
                        </Button>
                        {project.status === 'approved' &&
                    <Button variant="primary" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            הורד PDF
                          </Button>
                    }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      }

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`סקירת אלבום: ${selectedProject?.name || ''}`}
        size="xl">

        {selectedProject &&
        <div data-ev-id="ev_98524901a8" className="flex flex-col gap-6">
            {/* Project Info */}
            <div data-ev-id="ev_2f0c133ba6" className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div data-ev-id="ev_c693a6bba9">
                <p data-ev-id="ev_703832642e" className="text-sm text-muted-foreground">לקוח</p>
                <p data-ev-id="ev_7c837779f2" className="font-medium">{selectedProject.client?.full_name || selectedProject.client?.email}</p>
              </div>
              <div data-ev-id="ev_fc9ddf6918">
                <p data-ev-id="ev_831ded9e01" className="text-sm text-muted-foreground">סוג אלבום</p>
                <p data-ev-id="ev_dfd1de4b48" className="font-medium">{getAlbumTypeLabel(selectedProject.album_type)}</p>
              </div>
              <div data-ev-id="ev_55a28ce8c2">
                <p data-ev-id="ev_32a352b585" className="text-sm text-muted-foreground">מספר עמודים</p>
                <p data-ev-id="ev_3ef0aedf32" className="font-medium">{selectedProject.page_count}</p>
              </div>
              <div data-ev-id="ev_5d9ec715a9">
                <p data-ev-id="ev_9724c9ed4f" className="text-sm text-muted-foreground">תאריך הגשה</p>
                <p data-ev-id="ev_e395f288d3" className="font-medium">{formatDate(selectedProject.submitted_at)}</p>
              </div>
            </div>

            {/* Album Preview Placeholder */}
            <div data-ev-id="ev_39f4371988" className="aspect-[2/1] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div data-ev-id="ev_0179914e45" className="text-center">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p data-ev-id="ev_fb9ce74186" className="text-muted-foreground">תצוגה מקדימה של האלבום</p>
              </div>
            </div>

            {/* Review Notes */}
            {selectedProject.status === 'submitted' &&
          <div data-ev-id="ev_d5d6a9cd77">
                <label data-ev-id="ev_746afa776e" className="block text-sm font-medium mb-2">הערות ללקוח (אופציונלי)</label>
                <textarea data-ev-id="ev_e1fa76d91e"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="הוסף הערות אם נדרשים שינויים..."
            className="w-full h-32 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary" />

              </div>
          }

            {/* Actions */}
            <div data-ev-id="ev_6d9838fb10" className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setShowReviewModal(false)}>
                {t('close')}
              </Button>

              {selectedProject.status === 'submitted' &&
            <div data-ev-id="ev_3f479a9f65" className="flex items-center gap-3">
                  <Button
                variant="outline"
                onClick={() => handleRequestChanges(selectedProject.id)}
                loading={isSubmitting}
                disabled={!reviewNotes.trim()}
                className="gap-2">

                    <XCircle className="w-4 h-4" />
                    {t('request_changes')}
                  </Button>
                  <Button
                onClick={() => handleApprove(selectedProject.id)}
                loading={isSubmitting}
                className="gap-2">

                    <CheckCircle className="w-4 h-4" />
                    {t('approve')}
                  </Button>
                </div>
            }

              {selectedProject.status === 'approved' &&
            <Button className="gap-2">
                  <Download className="w-4 h-4" />
                  {t('download_pdf')}
                </Button>
            }
            </div>
          </div>
        }
      </Modal>
    </div>);

}