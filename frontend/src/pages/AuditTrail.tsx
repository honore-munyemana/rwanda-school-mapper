import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    History,
    User,
    Calendar,
    Shield,
    Database,
    FileEdit,
    Globe,
    MoreHorizontal,
    Search,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'LOGIN';
    module: string;
    details: string;
    ip: string;
}

const auditLogs: AuditLog[] = [
    {
        id: 'LOG-001',
        timestamp: '2026-02-26 14:20:15',
        user: 'Administrator (AdminAlpha)',
        action: 'VERIFY',
        module: 'Schools Registry',
        details: 'Verified Lycée de Kigali (ID: SCH-28491)',
        ip: '192.168.1.45',
    },
    {
        id: 'LOG-002',
        timestamp: '2026-02-26 13:05:42',
        user: 'Verifier Beta',
        action: 'UPDATE',
        module: 'Mobile Collection',
        details: 'Updated infrastructure data for Green Hills Academy',
        ip: '10.0.4.12',
    },
    {
        id: 'LOG-003',
        timestamp: '2026-02-26 11:30:00',
        user: 'Public Guest',
        action: 'CREATE',
        module: 'Community Engagement',
        details: 'Submitted report for potential missing school in Nyagatare',
        ip: '105.12.88.23',
    },
    {
        id: 'LOG-004',
        timestamp: '2026-02-26 09:15:22',
        user: 'Administrator (AdminAlpha)',
        action: 'UPDATE',
        module: 'System Settings',
        details: 'Modified National Validation Threshold from 85% to 90%',
        ip: '192.168.1.45',
    },
    {
        id: 'LOG-005',
        timestamp: '2026-02-25 16:45:10',
        user: 'Mapper Gamma',
        action: 'DELETE',
        module: 'Data Integration',
        details: 'Removed duplicate OSM building footprint (Node: 99421)',
        ip: '10.0.5.88',
    },
];

const actionStyles: Record<string, string> = {
    CREATE: 'bg-primary/10 text-primary border-primary/20',
    UPDATE: 'bg-info/10 text-info border-info/20',
    DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
    VERIFY: 'bg-success/10 text-success border-success/20',
    LOGIN: 'bg-muted text-muted-foreground border-border',
};

export default function AuditTrail() {
    return (
        <DashboardLayout>
            <div className="space-y-6 pb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <History className="h-6 w-6 text-primary" />
                            System Audit Trail
                        </h1>
                        <p className="text-muted-foreground">
                            Traceability and governance logs for all national mapping activities.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl">
                            <Shield className="mr-2 h-4 w-4" />
                            Security Report
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-1">
                            <Database className="h-3.5 w-3.5" /> Total Logs
                        </div>
                        <div className="text-2xl font-bold">12,842</div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-1">
                            <User className="h-3.5 w-3.5" /> Unique Users
                        </div>
                        <div className="text-2xl font-bold">48</div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-1">
                            <FileEdit className="h-3.5 w-3.5" /> Verify Actions
                        </div>
                        <div className="text-2xl font-bold text-success">1,204</div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm text-destructive">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-1">
                            <AlertCircle className="h-3.5 w-3.5" /> Security Alerts
                        </div>
                        <div className="text-2xl font-bold">0 Active</div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
                    <div className="p-4 border-b bg-muted/30 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by user or action..." className="pl-9 rounded-lg" />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg h-10 px-3">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-lg h-10 px-3 ml-auto">
                            <Calendar className="mr-2 h-4 w-4" />
                            Custom Range
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold">Timestamp</TableHead>
                                <TableHead className="font-bold">Actor</TableHead>
                                <TableHead className="font-bold">Action</TableHead>
                                <TableHead className="font-bold">Module</TableHead>
                                <TableHead className="font-bold">Description</TableHead>
                                <TableHead className="font-bold">Source IP</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditLogs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/30">
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {log.timestamp}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <span className="font-medium text-sm">{log.user}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-5 font-bold tracking-wider", actionStyles[log.action])}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {log.module}
                                    </TableCell>
                                    <TableCell className="text-sm text-foreground/80 max-w-md truncate">
                                        {log.details}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {log.ip}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="p-4 border-t bg-muted/10">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-primary font-bold">
                            <Globe className="mr-2 h-3.5 w-3.5" />
                            View Full System Log API Response
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
