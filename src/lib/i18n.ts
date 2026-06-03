// Internationalization configuration
export type Language = 'he' | 'en';

export interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  he: {
    // Common
    app_name: 'יוצר האלבומים',
    loading: 'טוען...',
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'ערוך',
    add: 'הוסף',
    search: 'חיפוש',
    close: 'סגור',
    back: 'חזרה',
    next: 'הבא',
    previous: 'הקודם',
    submit: 'שלח',
    confirm: 'אישור',
    yes: 'כן',
    no: 'לא',
    
    // Auth
    login: 'התחברות',
    logout: 'יציאה',
    email: 'אימייל',
    password: 'סיסמה',
    forgot_password: 'שכחת סיסמה?',
    login_title: 'ברוכים הבאים',
    login_subtitle: 'התחבר לחשבון שלך',
    login_error: 'שגיאה בהתחברות',
    invalid_credentials: 'אימייל או סיסמה שגויים',
    
    // Navigation
    dashboard: 'לוח בקרה',
    clients: 'לקוחות',
    assets: 'נכסי עיצוב',
    reviews: 'אישורים',
    settings: 'הגדרות',
    my_projects: 'הפרויקטים שלי',
    
    // Dashboard
    active_clients: 'לקוחות פעילים',
    pending_review: 'ממתינים לאישור',
    ready_to_print: 'מוכנים להדפסה',
    recent_submissions: 'הגשות אחרונות',
    view_all: 'צפה בהכל',
    
    // Clients
    add_client: 'הוסף לקוח',
    client_name: 'שם הלקוח',
    client_email: 'אימייל הלקוח',
    create_project: 'צור פרויקט',
    send_link: 'שלח קישור',
    copy_link: 'העתק קישור',
    link_copied: 'הקישור הועתק',
    
    // Projects
    new_project: 'פרויקט חדש',
    project_name: 'שם הפרויקט',
    album_type: 'סוג אלבום',
    page_count: 'מספר עמודים',
    status: 'סטטוס',
    created_at: 'תאריך יצירה',
    continue_editing: 'המשך עריכה',
    view_feedback: 'צפה בהערות',
    
    // Status
    status_draft: 'טיוטה',
    status_submitted: 'הוגש',
    status_changes_requested: 'נדרשים שינויים',
    status_approved: 'אושר',
    status_printed: 'הודפס',
    
    // Album Types
    album_wedding: 'חתונה',
    album_baby: 'תינוק',
    album_travel: 'טיול',
    album_family: 'משפחה',
    album_holiday: 'חגים',
    album_custom: 'מותאם אישית',
    
    // Editor
    photos: 'תמונות',
    templates: 'תבניות',
    backgrounds: 'רקעים',
    clipart: 'קליפארט',
    text: 'טקסט',
    layers: 'שכבות',
    
    upload_photos: 'העלאת תמונות',
    drag_photos: 'גרור תמונות לכאן',
    or_click: 'או לחץ לבחירה',
    
    auto_layout: 'עיצוב אוטומטי',
    shuffle: 'ערבב',
    add_spread: 'הוסף פריסה',
    cover: 'כריכה',
    spread: 'פריסה',
    
    // Element Settings
    position: 'מיקום',
    size: 'גודל',
    rotation: 'סיבוב',
    opacity: 'שקיפות',
    effects: 'אפקטים',
    delete_element: 'מחק אלמנט',
    
    // Preview & Export
    preview: 'תצוגה מקדימה',
    export: 'ייצוא',
    submit_for_review: 'שלח לאישור',
    export_pdf: 'ייצוא PDF',
    export_images: 'ייצוא תמונות',
    print_ready: 'מוכן להדפסה',
    
    // Review
    approve: 'אשר',
    request_changes: 'בקש שינויים',
    add_notes: 'הוסף הערות',
    admin_notes: 'הערות מנהל',
    download_pdf: 'הורד PDF',
    
    // Messages
    changes_saved: 'השינויים נשמרו',
    project_submitted: 'הפרויקט הוגש בהצלחה',
    project_approved: 'הפרויקט אושר',
    changes_requested_msg: 'נשלחה בקשה לשינויים',
    
    // Empty States
    no_projects: 'אין פרויקטים עדיין',
    no_clients: 'אין לקוחות עדיין',
    no_assets: 'אין נכסים בקטגוריה זו',
    no_photos: 'אין תמונות בפרויקט',
    
    // Errors
    error_general: 'אירעה שגיאה',
    error_load: 'שגיאה בטעינת הנתונים',
    error_save: 'שגיאה בשמירת הנתונים',
    try_again: 'נסה שוב',
  },
  
  en: {
    // Common
    app_name: 'Album Maker',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    forgot_password: 'Forgot password?',
    login_title: 'Welcome',
    login_subtitle: 'Sign in to your account',
    login_error: 'Login error',
    invalid_credentials: 'Invalid email or password',
    
    // Navigation
    dashboard: 'Dashboard',
    clients: 'Clients',
    assets: 'Design Assets',
    reviews: 'Reviews',
    settings: 'Settings',
    my_projects: 'My Projects',
    
    // Dashboard
    active_clients: 'Active Clients',
    pending_review: 'Pending Review',
    ready_to_print: 'Ready to Print',
    recent_submissions: 'Recent Submissions',
    view_all: 'View All',
    
    // Clients
    add_client: 'Add Client',
    client_name: 'Client Name',
    client_email: 'Client Email',
    create_project: 'Create Project',
    send_link: 'Send Link',
    copy_link: 'Copy Link',
    link_copied: 'Link Copied',
    
    // Projects
    new_project: 'New Project',
    project_name: 'Project Name',
    album_type: 'Album Type',
    page_count: 'Page Count',
    status: 'Status',
    created_at: 'Created At',
    continue_editing: 'Continue Editing',
    view_feedback: 'View Feedback',
    
    // Status
    status_draft: 'Draft',
    status_submitted: 'Submitted',
    status_changes_requested: 'Changes Requested',
    status_approved: 'Approved',
    status_printed: 'Printed',
    
    // Album Types
    album_wedding: 'Wedding',
    album_baby: 'Baby',
    album_travel: 'Travel',
    album_family: 'Family',
    album_holiday: 'Holiday',
    album_custom: 'Custom',
    
    // Editor
    photos: 'Photos',
    templates: 'Templates',
    backgrounds: 'Backgrounds',
    clipart: 'Clip Art',
    text: 'Text',
    layers: 'Layers',
    
    upload_photos: 'Upload Photos',
    drag_photos: 'Drag photos here',
    or_click: 'or click to select',
    
    auto_layout: 'Auto Layout',
    shuffle: 'Shuffle',
    add_spread: 'Add Spread',
    cover: 'Cover',
    spread: 'Spread',
    
    // Element Settings
    position: 'Position',
    size: 'Size',
    rotation: 'Rotation',
    opacity: 'Opacity',
    effects: 'Effects',
    delete_element: 'Delete Element',
    
    // Preview & Export
    preview: 'Preview',
    export: 'Export',
    submit_for_review: 'Submit for Review',
    export_pdf: 'Export PDF',
    export_images: 'Export Images',
    print_ready: 'Print Ready',
    
    // Review
    approve: 'Approve',
    request_changes: 'Request Changes',
    add_notes: 'Add Notes',
    admin_notes: 'Admin Notes',
    download_pdf: 'Download PDF',
    
    // Messages
    changes_saved: 'Changes saved',
    project_submitted: 'Project submitted successfully',
    project_approved: 'Project approved',
    changes_requested_msg: 'Change request sent',
    
    // Empty States
    no_projects: 'No projects yet',
    no_clients: 'No clients yet',
    no_assets: 'No assets in this category',
    no_photos: 'No photos in this project',
    
    // Errors
    error_general: 'An error occurred',
    error_load: 'Error loading data',
    error_save: 'Error saving data',
    try_again: 'Try again',
  },
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let result: string | Translations = translations[lang];
  
  for (const k of keys) {
    if (typeof result === 'object' && result !== null && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }
  
  return typeof result === 'string' ? result : key;
}

export function t(lang: Language, key: string): string {
  return getTranslation(lang, key);
}

export const DEFAULT_LANGUAGE: Language = 'he';
