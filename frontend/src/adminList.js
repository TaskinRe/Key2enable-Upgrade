// File: adminList.js

const raw = import.meta.env.VITE_ADMIN_EMAILS || '';
export const ADMIN_EMAILS = raw.split(',').map(email => email.trim()).filter(Boolean);
