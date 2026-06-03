import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, ArrowLeft, ArrowRight, Eye, LayoutTemplate, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DashboardStats {
  activeClients: number;
  pendingReview: number;
  readyToPrint: number;
}

interface RecentSubmission {
  id: string;
  project_name: string;
  client_name: string;
  submitted_at: string;
  status: string;
}

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({ activeClients: 0, pendingReview: 0, readyToPrint: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!supabase) return;

    try {
      // Fetch stats
      const [clientsRes, pendingRes, approvedRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'client'),
      supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'submitted'),
      supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'approved')]
      );

      setStats({
        activeClients: clientsRes.count || 0,
        pendingReview: pendingRes.count || 0,
        readyToPrint: approvedRes.count || 0
      });

      // Fetch recent submissions
      const { data: submissions } = await supabase.
      from('projects').
      select('id, name, status, submitted_at, client_id').
      eq('status', 'submitted').
      order('submitted_at', { ascending: false }).
      limit(5);

      if (submissions) {
        // Fetch client profiles separately
        const clientIds = submissions.map((s) => s.client_id);
        const { data: profiles } = await supabase.
        from('profiles').
        select('id, full_name, email').
        in('id', clientIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        setRecentSubmissions(submissions.map((s: any) => ({
          id: s.id,
          project_name: s.name,
          client_name: profileMap.get(s.client_id)?.full_name || profileMap.get(s.client_id)?.email || 'Unknown',
          submitted_at: s.submitted_at,
          status: s.status
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} דקות`;
    if (diffHours < 24) return `${diffHours} שעות`;
    return `${diffDays} ימים`;
  };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div data-ev-id="ev_4855065a1a" className="flex flex-col gap-6">
      {/* Page Header */}
      <div data-ev-id="ev_7472914f54">
        <h1 data-ev-id="ev_79c9fb58d0" className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
        <p data-ev-id="ev_36dadfedb0" className="text-muted-foreground mt-1">סקירה כללית של המערכת</p>
      </div>

      {/* Stats Cards */}
      <div data-ev-id="ev_27deaedcf5" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>

          <Card variant="elevated" className="relative overflow-hidden">
            <div data-ev-id="ev_1da5fc2e58" className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <CardContent className="p-6">
              <div data-ev-id="ev_a145637417" className="flex items-center justify-between">
                <div data-ev-id="ev_a7d2bde548">
                  <p data-ev-id="ev_0830a144d9" className="text-sm text-muted-foreground">{t('active_clients')}</p>
                  <p data-ev-id="ev_7edae65ce4" className="text-3xl font-bold mt-1">{stats.activeClients}</p>
                </div>
                <div data-ev-id="ev_48e595a7ef" className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>

          <Card variant="elevated" className="relative overflow-hidden">
            <div data-ev-id="ev_d5a48c9b1e" className="absolute top-0 left-0 w-full h-1 bg-warning" />
            <CardContent className="p-6">
              <div data-ev-id="ev_0469ba5e60" className="flex items-center justify-between">
                <div data-ev-id="ev_6c2b3d9071">
                  <p data-ev-id="ev_e8cd367e1c" className="text-sm text-muted-foreground">{t('pending_review')}</p>
                  <p data-ev-id="ev_4d3cd099ff" className="text-3xl font-bold mt-1">{stats.pendingReview}</p>
                </div>
                <div data-ev-id="ev_1354782f1e" className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>

          <Card variant="elevated" className="relative overflow-hidden">
            <div data-ev-id="ev_dd6e88cf03" className="absolute top-0 left-0 w-full h-1 bg-success" />
            <CardContent className="p-6">
              <div data-ev-id="ev_19d64a504c" className="flex items-center justify-between">
                <div data-ev-id="ev_d78727856c">
                  <p data-ev-id="ev_52d5619d0a" className="text-sm text-muted-foreground">{t('ready_to_print')}</p>
                  <p data-ev-id="ev_d6815831a7" className="text-3xl font-bold mt-1">{stats.readyToPrint}</p>
                </div>
                <div data-ev-id="ev_1ef7afa06f" className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}>
        <Card>
          <CardHeader>
            <CardTitle>פעולות מהירות</CardTitle>
          </CardHeader>
          <CardContent>
            <div data-ev-id="ev_fd6a71b6b9" className="flex flex-wrap gap-3">
              <Link to="/admin/templates/builder">
                <Button variant="outline" className="gap-2">
                  <LayoutTemplate className="w-4 h-4" />
                  <span data-ev-id="ev_ae8bcf69ae">בונה תבניות</span>
                </Button>
              </Link>
              <Link to="/admin/clients">
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span data-ev-id="ev_c73265798d">ניהול לקוחות</span>
                </Button>
              </Link>
              <Link to="/admin/assets">
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span data-ev-id="ev_7010afce9c">העלאת נכסים</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <CardTitle>{t('recent_submissions')}</CardTitle>
            <Link to="/admin/reviews">
              <Button variant="ghost" size="sm" className="gap-2">
                {t('view_all')}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ?
            <div data-ev-id="ev_15869f33f6" className="p-8 text-center text-muted-foreground">
                {t('loading')}
              </div> :
            recentSubmissions.length === 0 ?
            <div data-ev-id="ev_362827ed82" className="p-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p data-ev-id="ev_fceb662ec3">אין הגשות חדשות</p>
              </div> :

            <ul data-ev-id="ev_e6e47d10b5" className="divide-y divide-border">
                {recentSubmissions.map((submission) =>
              <li data-ev-id="ev_4381595f60" key={submission.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div data-ev-id="ev_68079ae6e6" className="flex items-center justify-between">
                      <div data-ev-id="ev_6df815511b" className="flex items-center gap-4">
                        <div data-ev-id="ev_b55baccc54" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div data-ev-id="ev_3f73ae0223">
                          <p data-ev-id="ev_30b4bcd543" className="font-medium">{submission.client_name}</p>
                          <p data-ev-id="ev_1c6cf83283" className="text-sm text-muted-foreground">{submission.project_name}</p>
                        </div>
                      </div>
                      <div data-ev-id="ev_5e6072f99b" className="flex items-center gap-4">
                        <span data-ev-id="ev_a321ccfb01" className="text-sm text-muted-foreground">
                          לפני {formatTimeAgo(submission.submitted_at)}
                        </span>
                        <Link to={`/admin/reviews?project=${submission.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            {t('reviews')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </li>
              )}
              </ul>
            }
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}