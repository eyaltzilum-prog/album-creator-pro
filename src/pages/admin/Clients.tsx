import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Mail, Calendar, FolderOpen, MoreVertical, Copy, Trash2, Send, UserPlus, X, Undo2, Key, User, Eye, EyeOff, ChevronDown, ChevronUp, Edit, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Client {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  project_count: number;
}

interface NewClientForm {
  email: string;
  full_name: string;
  password: string;
}

interface NewProjectForm {
  name: string;
  album_type: string;
  page_count: number;
}

interface Project {
  id: string;
  name: string;
  album_type: string;
  status: string;
  created_at: string;
}

const albumTypes = [
{ value: 'wedding', labelHe: 'חתונה', labelEn: 'Wedding' },
{ value: 'baby', labelHe: 'תינוק', labelEn: 'Baby' },
{ value: 'travel', labelHe: 'טיול', labelEn: 'Travel' },
{ value: 'family', labelHe: 'משפחה', labelEn: 'Family' },
{ value: 'holiday', labelHe: 'חגים', labelEn: 'Holiday' },
{ value: 'custom', labelHe: 'מותאם אישית', labelEn: 'Custom' }];


export default function AdminClients() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<NewClientForm>({ email: '', full_name: '', password: '' });
  const [newProject, setNewProject] = useState<NewProjectForm>({ name: '', album_type: 'wedding', page_count: 20 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Undo deletion state
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Client info modal state
  const [showClientInfoModal, setShowClientInfoModal] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Client projects state
  const [showProjectsList, setShowProjectsList] = useState(false);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), 10000)
      );

      const fetchPromise = supabase.
      from('profiles').
      select('id, email, full_name, created_at').
      eq('role', 'client').
      order('created_at', { ascending: false });

      const { data: profiles, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any;

      if (error) throw error;

      // Set clients without project counts first for faster loading
      const clientsData = (profiles || []).map((profile: any) => ({
        ...profile,
        project_count: 0
      }));
      setClients(clientsData);
      setLoading(false);

      // Then fetch project counts in background (non-blocking)
      for (const client of clientsData) {
        supabase.
        from('projects').
        select('id', { count: 'exact' }).
        eq('client_id', client.id).
        then(({ count }) => {
          setClients((prev) => prev.map((c) =>
          c.id === client.id ? { ...c, project_count: count || 0 } : c
          ));
        }).
        catch(() => {}); // Ignore errors for counts
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!supabase || !user) return;
    setError('');
    setIsSubmitting(true);

    try {
      // Longer timeout for slow database
      const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout - please try again')), 30000)
      );

      const signUpPromise = supabase.auth.signUp({
        email: newClient.email,
        password: newClient.password,
        options: {
          data: {
            full_name: newClient.full_name,
            role: 'client'
          }
        }
      });

      const { data: authData, error: authError } = (await Promise.race([signUpPromise, timeoutPromise])) as any;

      if (authError) throw authError;

      setShowAddModal(false);
      setNewClient({ email: '', full_name: '', password: '' });
      setSuccessMessage(language === 'he' ? 'לקוח נוצר בהצלחה!' : 'Client created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchClients();
    } catch (error: any) {
      setError(error.message || t('error_general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async () => {
    if (!supabase || !user || !selectedClient) return;
    setError('');
    setIsSubmitting(true);

    try {
      // Create the project
      const { data: project, error: projectError } = await supabase.
      from('projects').
      insert({
        client_id: selectedClient.id,
        created_by: user.id,
        name: newProject.name,
        album_type: newProject.album_type,
        page_count: newProject.page_count,
        status: 'draft'
      }).
      select().
      single();

      if (projectError) throw projectError;

      // Create initial spreads for the project
      const spreadsToCreate = [];

      // Cover spread
      spreadsToCreate.push({
        project_id: project.id,
        spread_index: 0,
        spread_type: 'cover',
        canvas_data: { objects: [], background: '#ffffff' }
      });

      // Interior spreads
      const numSpreads = Math.ceil(newProject.page_count / 2);
      for (let i = 1; i <= numSpreads; i++) {
        spreadsToCreate.push({
          project_id: project.id,
          spread_index: i,
          spread_type: 'interior',
          canvas_data: { objects: [], background: '#ffffff' }
        });
      }

      const { error: spreadsError } = await supabase.
      from('spreads').
      insert(spreadsToCreate);

      if (spreadsError) throw spreadsError;

      setShowProjectModal(false);
      setSelectedClient(null);
      setNewProject({ name: '', album_type: 'wedding', page_count: 20 });
      setSuccessMessage(language === 'he' ? 'פרויקט נוצר בהצלחה!' : 'Project created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchClients();
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || t('error_general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateProjectModal = (client: Client) => {
    setSelectedClient(client);
    setNewProject({
      name: `${language === 'he' ? 'אלבום' : 'Album'} - ${client.full_name || client.email}`,
      album_type: 'wedding',
      page_count: 20
    });
    setShowProjectModal(true);
    setError('');
  };

  const openDeleteModal = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
    setError('');
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    // Clear any existing undo timers
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Store the client for potential undo
    const clientToRemove = clientToDelete;
    setPendingDelete(clientToRemove);

    // Remove from list immediately (optimistic update)
    setClients((prev) => prev.filter((c) => c.id !== clientToRemove.id));

    // Close modal
    setShowDeleteModal(false);
    setClientToDelete(null);

    // Start countdown
    const UNDO_DURATION = 8;
    setUndoCountdown(UNDO_DURATION);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set timeout for actual deletion via Edge Function
    undoTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-client`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ clientId: clientToRemove.id }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete client');
        }

        setPendingDelete(null);
        setSuccessMessage(language === 'he' ? 'הלקוח נמחק לצמיתות' : 'Client permanently deleted');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error: any) {
        console.error('Error deleting client:', error);
        // Restore client on error
        setClients((prev) => [clientToRemove, ...prev]);
        setPendingDelete(null);
        setError(language === 'he' ? 'שגיאה במחיקת הלקוח' : 'Error deleting client');
      }
    }, UNDO_DURATION * 1000);
  };

  const handleUndoDelete = () => {
    if (!pendingDelete) return;

    // Clear timers
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Restore client to list
    setClients((prev) => [pendingDelete, ...prev].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));

    // Clear pending delete
    setPendingDelete(null);
    setUndoCountdown(0);

    setSuccessMessage(language === 'he' ? 'הלקוח שוחזר בהצלחה!' : 'Client restored successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.email.toLowerCase().includes(query) ||
      (client.full_name?.toLowerCase() || '').includes(query));

  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const copyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setSuccessMessage(t('link_copied'));
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const openClientInfoModal = (client: Client) => {
    setViewingClient(client);
    setShowClientInfoModal(true);
    setNewPassword('');
    setShowPasswordField(false);
    setShowPasswordText(false);
    setShowProjectsList(false);
    setClientProjects([]);
    setError('');
  };

  const fetchClientProjects = async (clientId: string) => {
    if (!supabase) return;

    setLoadingProjects(true);
    try {
      const { data, error } = await supabase.
      from('projects').
      select('id, name, album_type, status, created_at').
      eq('client_id', clientId).
      order('created_at', { ascending: false });

      if (error) throw error;
      setClientProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const toggleProjectsList = () => {
    if (!showProjectsList && viewingClient) {
      fetchClientProjects(viewingClient.id);
    }
    setShowProjectsList(!showProjectsList);
  };

  const handleDeleteProject = async () => {
    if (!supabase || !projectToDelete) return;

    setIsDeletingProject(true);
    try {
      const { error } = await supabase.
      from('projects').
      delete().
      eq('id', projectToDelete.id);

      if (error) throw error;

      // Remove from local list
      setClientProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));

      // Update client project count
      if (viewingClient) {
        setViewingClient({ ...viewingClient, project_count: viewingClient.project_count - 1 });
        setClients((prev) => prev.map((c) =>
        c.id === viewingClient.id ? { ...c, project_count: c.project_count - 1 } : c
        ));
      }

      setShowDeleteProjectModal(false);
      setProjectToDelete(null);
      setSuccessMessage(language === 'he' ? 'הפרויקט נמחק בהצלחה!' : 'Project deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting project:', error);
      setError(error.message || (language === 'he' ? 'שגיאה במחיקת הפרויקט' : 'Error deleting project'));
    } finally {
      setIsDeletingProject(false);
    }
  };

  const openProjectEditor = (projectId: string) => {
    setShowClientInfoModal(false);
    navigate(`/editor/${projectId}`);
  };

  const handleResetPassword = async () => {
    if (!viewingClient || !newPassword) return;

    if (newPassword.length < 6) {
      setError(language === 'he' ? 'הסיסמה חייבת להכיל לפחות 6 תווים' : 'Password must be at least 6 characters');
      return;
    }

    setIsResettingPassword(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-client-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            clientId: viewingClient.id,
            newPassword: newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMessage(language === 'he' ? 'הסיסמה עודכנה בהצלחה!' : 'Password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setNewPassword('');
      setShowPasswordField(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || (language === 'he' ? 'שגיאה באיפוס הסיסמה' : 'Error resetting password'));
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div data-ev-id="ev_654fdca4b2" className="flex flex-col gap-6">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage &&
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg">

            {successMessage}
          </motion.div>
        }
      </AnimatePresence>

      {/* Page Header */}
      <div data-ev-id="ev_f4d69a3eac" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div data-ev-id="ev_6636c7ae78">
          <h1 data-ev-id="ev_5ef92c7094" className="text-2xl font-bold text-foreground">{t('clients')}</h1>
          <p data-ev-id="ev_71236ae442" className="text-muted-foreground mt-1">ניהול לקוחות ופרויקטים</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          {t('add_client')}
        </Button>
      </div>

      {/* Search */}
      <div data-ev-id="ev_0e41eba895" className="relative max-w-md">
        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-muted-foreground`} />
        <input data-ev-id="ev_766bedf805"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={`${t('search')}...`}
        className={`w-full h-11 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary`} />

      </div>

      {/* Clients Grid */}
      {loading ?
      <div data-ev-id="ev_021ba9d39c" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) =>
        <div data-ev-id="ev_2e529382d9" key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        )}
        </div> :
      filteredClients.length === 0 ?
      <Card className="p-12 text-center">
          <UserPlus className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 data-ev-id="ev_e71d884855" className="text-lg font-medium mb-2">{t('no_clients')}</h3>
          <p data-ev-id="ev_3db8f1372d" className="text-muted-foreground mb-4">הוסף לקוח ראשון להתחלה</p>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            {t('add_client')}
          </Button>
        </Card> :

      <div data-ev-id="ev_958c3d7440" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredClients.map((client, index) =>
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}>

                <Card hoverable className="h-full">
                  <CardContent className="p-5">
                    {/* Header - Clickable to open client info */}
                    <div
                  data-ev-id="ev_e680e947aa"
                  className="flex items-start justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openClientInfoModal(client)}>

                      <div data-ev-id="ev_97859a4c1e" className="flex items-center gap-3">
                        <div data-ev-id="ev_90e884bdcd" className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                          {(client.full_name || client.email)[0].toUpperCase()}
                        </div>
                        <div data-ev-id="ev_41a5e82ade">
                          <h3 data-ev-id="ev_a3e9ae15e2" className="font-semibold">{client.full_name || 'ללא שם'}</h3>
                          <p data-ev-id="ev_706063eaeb" className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div data-ev-id="ev_e7551ebc07" className="flex items-center gap-4 py-3 border-t border-b border-border">
                      <div data-ev-id="ev_9838f42bbd" className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <span data-ev-id="ev_29ea83a7cf" className="text-sm">{client.project_count} פרויקטים</span>
                      </div>
                      <div data-ev-id="ev_e14be709b6" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span data-ev-id="ev_a59e0b69f9" className="text-sm">{formatDate(client.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div data-ev-id="ev_ec6c1b3748" className="flex items-center gap-2 mt-4">
                      <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => openCreateProjectModal(client)}>

                        <FolderOpen className="w-4 h-4" />
                        {t('create_project')}
                      </Button>
                      <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`${window.location.origin}/login`)}
                    title={t('copy_link')}>

                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteModal(client)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title={language === 'he' ? 'מחק לקוח' : 'Delete client'}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      }

      {/* Add Client Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('add_client')}
        size="md">

        <div data-ev-id="ev_641f64e1aa" className="flex flex-col gap-4">
          {error &&
          <div data-ev-id="ev_67cb9df6cb" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          }

          <Input
            label={t('client_name')}
            value={newClient.full_name}
            onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
            placeholder="ישראל ישראלי" />


          <Input
            label={t('email')}
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            placeholder="client@example.com" />


          <Input
            label={t('password')}
            type="password"
            value={newClient.password}
            onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
            placeholder="••••••••"
            hint="מינימום 6 תווים" />


          <div data-ev-id="ev_90ea62623c" className="flex items-center justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleAddClient}
              loading={isSubmitting}
              disabled={!newClient.email || !newClient.password}>

              {t('add_client')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title={`${t('create_project')} - ${selectedClient?.full_name || selectedClient?.email || ''}`}
        size="md">

        <div data-ev-id="ev_dc9a94b6fc" className="flex flex-col gap-4">
          {error &&
          <div data-ev-id="ev_12dce33508" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          }

          <Input
            label={t('project_name')}
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder={language === 'he' ? 'אלבום חתונה' : 'Wedding Album'} />


          <div data-ev-id="ev_f81d87a29b" className="flex flex-col gap-1.5">
            <label data-ev-id="ev_2f71d7e7b4" className="text-sm font-medium text-gray-700">{t('album_type')}</label>
            <select data-ev-id="ev_d81f314d05"
            value={newProject.album_type}
            onChange={(e) => setNewProject({ ...newProject, album_type: e.target.value })}
            className="h-10 w-full rounded-md border border-border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">

              {albumTypes.map((type) =>
              <option data-ev-id="ev_740fee6de3" key={type.value} value={type.value}>
                  {language === 'he' ? type.labelHe : type.labelEn}
                </option>
              )}
            </select>
          </div>

          <div data-ev-id="ev_72c3401206" className="flex flex-col gap-1.5">
            <label data-ev-id="ev_1374a11299" className="text-sm font-medium text-gray-700">{t('page_count')}</label>
            <select data-ev-id="ev_2e7f7a596f"
            value={newProject.page_count}
            onChange={(e) => setNewProject({ ...newProject, page_count: parseInt(e.target.value) })}
            className="h-10 w-full rounded-md border border-border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">

              {[10, 15, 20, 25, 30, 40, 50].map((count) =>
              <option data-ev-id="ev_fd6d2375f3" key={count} value={count}>
                  {count} {language === 'he' ? 'עמודים' : 'pages'}
                </option>
              )}
            </select>
          </div>

          <div data-ev-id="ev_d1f295bc0f" className="flex items-center justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowProjectModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreateProject}
              loading={isSubmitting}
              disabled={!newProject.name}>

              {t('create_project')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={language === 'he' ? 'מחיקת לקוח' : 'Delete Client'}
        size="sm">
        <div data-ev-id="ev_434cec87a9" className="flex flex-col gap-4">
          {error &&
          <div data-ev-id="ev_851bf10cd8" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          }

          <div data-ev-id="ev_31a9b36fb1" className="text-center py-4">
            <div data-ev-id="ev_644cf17a54" className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 data-ev-id="ev_942dbd5ce6" className="text-lg font-semibold mb-2">
              {clientToDelete?.full_name || clientToDelete?.email}
            </h3>
            <p data-ev-id="ev_afaa456bdd" className="text-muted-foreground text-sm">
              {language === 'he' ?
              'האם אתה בטוח שברצונך למחוק לקוח זה? כל הפרויקטים שלו יימחקו גם כן. תוכל לבטל תוך מספר שניות.' :
              'Are you sure you want to delete this client? All their projects will also be deleted. You can undo within a few seconds.'}
            </p>
          </div>

          <div data-ev-id="ev_e94d5ef1cc" className="flex items-center justify-center gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDeleteClient}
              loading={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white">
              {language === 'he' ? 'מחק לקוח' : 'Delete Client'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Client Info Modal */}
      <Modal
        isOpen={showClientInfoModal}
        onClose={() => setShowClientInfoModal(false)}
        title={language === 'he' ? 'פרטי לקוח' : 'Client Details'}
        size="md">
        {viewingClient &&
        <div data-ev-id="ev_18c16dd7a0" className="flex flex-col gap-6">
            {error &&
          <div data-ev-id="ev_cf206dee20" className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
          }

            {/* Client Avatar & Basic Info */}
            <div data-ev-id="ev_5de1b274ca" className="flex items-center gap-4 pb-4 border-b border-border">
              <div data-ev-id="ev_9460f16a3a" className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
                {(viewingClient.full_name || viewingClient.email)[0].toUpperCase()}
              </div>
              <div data-ev-id="ev_13712547fb">
                <h3 data-ev-id="ev_332b916cc0" className="text-xl font-semibold">{viewingClient.full_name || (language === 'he' ? 'ללא שם' : 'No name')}</h3>
                <p data-ev-id="ev_8936c3c800" className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {viewingClient.email}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div data-ev-id="ev_a0a289785f" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_e0c4774726" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div data-ev-id="ev_e521334796">
                  <p data-ev-id="ev_5c79c4bcfe" className="text-xs text-muted-foreground">{language === 'he' ? 'תאריך הצטרפות' : 'Created'}</p>
                  <p data-ev-id="ev_04394bf7dd" className="font-medium text-sm">{formatDate(viewingClient.created_at)}</p>
                </div>
              </div>
              <button data-ev-id="ev_e31e1a2e34"
            onClick={toggleProjectsList}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left w-full">

                <FolderOpen className="w-5 h-5 text-primary" />
                <div data-ev-id="ev_4504bc3220" className="flex-1">
                  <p data-ev-id="ev_533f1ea60a" className="text-xs text-muted-foreground">{language === 'he' ? 'פרויקטים' : 'Projects'}</p>
                  <p data-ev-id="ev_5d207c3c36" className="font-medium text-sm">{viewingClient.project_count}</p>
                </div>
                {showProjectsList ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>

            {/* Projects List (Expandable) */}
            <AnimatePresence>
              {showProjectsList &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">

                  <div data-ev-id="ev_ae516b82db" className="border border-border rounded-lg p-3 bg-muted/30">
                    <h4 data-ev-id="ev_2b48bd27db" className="font-medium text-sm mb-3 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {language === 'he' ? 'פרויקטים' : 'Projects'}
                    </h4>
                    
                    {loadingProjects ?
                <div data-ev-id="ev_c73c0b413c" className="flex items-center justify-center py-4">
                        <div data-ev-id="ev_bf665b6daa" className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div> :
                clientProjects.length === 0 ?
                <p data-ev-id="ev_90a55f9eca" className="text-sm text-muted-foreground text-center py-4">
                        {language === 'he' ? 'אין פרויקטים' : 'No projects'}
                      </p> :

                <div data-ev-id="ev_3428b6e5f0" className="flex flex-col gap-2">
                        {clientProjects.map((project) =>
                  <div data-ev-id="ev_fa5902d738"
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-border">

                            <div data-ev-id="ev_15fd8b8ff1" className="flex-1 min-w-0">
                              <p data-ev-id="ev_688ffee7a7" className="font-medium text-sm truncate">{project.name}</p>
                              <p data-ev-id="ev_0741ae4108" className="text-xs text-muted-foreground">
                                {formatDate(project.created_at)} • {project.album_type}
                              </p>
                            </div>
                            <div data-ev-id="ev_8163817ea3" className="flex items-center gap-1 ml-2">
                              <button data-ev-id="ev_9f053b2ead"
                      onClick={() => openProjectEditor(project.id)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title={language === 'he' ? 'ערוך פרויקט' : 'Edit project'}>

                                <Edit className="w-4 h-4" />
                              </button>
                              <button data-ev-id="ev_83d7fe7194"
                      onClick={() => {
                        setProjectToDelete(project);
                        setShowDeleteProjectModal(true);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={language === 'he' ? 'מחק פרויקט' : 'Delete project'}>

                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                  )}
                      </div>
                }
                  </div>
                </motion.div>
            }
            </AnimatePresence>

            {/* Reset Password Section */}
            <div data-ev-id="ev_1f387a834b" className="border-t border-border pt-4">
              <div data-ev-id="ev_b7bc5e8285" className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <h4 data-ev-id="ev_54e475f0c0" className="font-medium">{language === 'he' ? 'איפוס סיסמה' : 'Reset Password'}</h4>
              </div>

              {!showPasswordField ?
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPasswordField(true)}>

                  <Key className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'שנה סיסמה' : 'Change Password'}
                </Button> :

            <div data-ev-id="ev_7cc6b7107c" className="flex flex-col gap-3">
                  <div data-ev-id="ev_b96e397ca1" className="relative">
                    <input data-ev-id="ev_05c084e1d5"
                type={showPasswordText ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={language === 'he' ? 'סיסמה חדשה...' : 'New password...'}
                className={`w-full h-11 px-4 ${isRTL ? 'pl-11' : 'pr-11'} rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary`} />

                    <button data-ev-id="ev_340f4379c0"
                type="button"
                onClick={() => setShowPasswordText(!showPasswordText)}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-muted-foreground hover:text-foreground`}>

                      {showPasswordText ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p data-ev-id="ev_54ffdf35a0" className="text-xs text-muted-foreground">
                    {language === 'he' ? 'מינימום 6 תווים' : 'Minimum 6 characters'}
                  </p>
                  <div data-ev-id="ev_1a581d0d2e" className="flex gap-2">
                    <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setShowPasswordField(false);
                    setNewPassword('');
                    setError('');
                  }}>

                      {t('cancel')}
                    </Button>
                    <Button
                  className="flex-1"
                  onClick={handleResetPassword}
                  loading={isResettingPassword}
                  disabled={!newPassword || newPassword.length < 6}>

                      {language === 'he' ? 'עדכן סיסמה' : 'Update Password'}
                    </Button>
                  </div>
                </div>
            }
            </div>

            {/* Close Button */}
            <div data-ev-id="ev_921c3c1b8c" className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowClientInfoModal(false)}>
                {language === 'he' ? 'סגור' : 'Close'}
              </Button>
            </div>
          </div>
        }
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal
        isOpen={showDeleteProjectModal}
        onClose={() => setShowDeleteProjectModal(false)}
        title={language === 'he' ? 'מחיקת פרויקט' : 'Delete Project'}
        size="sm">
        <div data-ev-id="ev_5f2c4e936c" className="flex flex-col gap-4">
          <div data-ev-id="ev_7b9b947697" className="text-center py-4">
            <div data-ev-id="ev_aa5a1907e0" className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 data-ev-id="ev_2b8c3bb537" className="text-lg font-semibold mb-2">
              {projectToDelete?.name}
            </h3>
            <p data-ev-id="ev_0d4658f71d" className="text-muted-foreground text-sm">
              {language === 'he' ?
              'האם אתה בטוח שברצונך למחוק פרויקט זה? פעולה זו אינה ניתנת לביטול.' :
              'Are you sure you want to delete this project? This action cannot be undone.'}
            </p>
          </div>

          <div data-ev-id="ev_89db0fb236" className="flex items-center justify-center gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteProjectModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDeleteProject}
              loading={isDeletingProject}
              className="bg-red-500 hover:bg-red-600 text-white">
              {language === 'he' ? 'מחק פרויקט' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Undo Delete Toast */}
      <AnimatePresence>
        {pendingDelete &&
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[320px]">

            <div data-ev-id="ev_3d721818a8" className="flex items-center gap-3 flex-1">
              <div data-ev-id="ev_07eb914abb" className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div data-ev-id="ev_14784dee3b">
                <p data-ev-id="ev_652b33036c" className="font-medium text-sm">
                  {language === 'he' ? 'הלקוח נמחק' : 'Client deleted'}
                </p>
                <p data-ev-id="ev_d70a8b77d9" className="text-gray-400 text-xs">
                  {pendingDelete.full_name || pendingDelete.email}
                </p>
              </div>
            </div>
            
            <button data-ev-id="ev_a3a0d4c23b"
          onClick={handleUndoDelete}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">

              <Undo2 className="w-4 h-4" />
              {language === 'he' ? 'בטל' : 'Undo'}
            </button>
            
            <div data-ev-id="ev_98cf1b06ab" className="flex items-center gap-2 text-gray-400 text-sm">
              <div data-ev-id="ev_99c5f36f8f" className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center font-mono text-xs">
                {undoCountdown}
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}