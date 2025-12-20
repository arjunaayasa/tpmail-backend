// Domain entity matching backend
export interface Domain {
    id: string;
    domain: string;
    imap_host: string;
    imap_port: number;
    imap_user: string;
    active: boolean;
    created_at: string;
}

// Dashboard stats
export interface DashboardStats {
    total_domains: number;
    active_domains: number;
    total_emails: number;
    active_emails: number;
    total_messages: number;
}

// Auth
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    expires_in: number;
}

// Domain CRUD
export interface CreateDomainRequest {
    domain: string;
    imap_host: string;
    imap_port: number;
    imap_user: string;
    imap_password: string;
}

export interface UpdateDomainRequest {
    domain?: string;
    imap_host?: string;
    imap_port?: number;
    imap_user?: string;
    imap_password?: string;
    active?: boolean;
}

// IMAP Test
export interface ImapTestRequest {
    host: string;
    port: number;
    user: string;
    password: string;
}

export interface ImapTestResponse {
    success: boolean;
    message: string;
}
