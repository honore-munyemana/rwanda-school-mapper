import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { sampleSchools, School } from '@/data/rwandaSchools';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VerificationQueue() {
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingSchools = sampleSchools.filter(s => s.verificationStatus === 'Pending');
  const unverifiedSchools = sampleSchools.filter(s => s.verificationStatus === 'Unverified');
  const verifiedSchools = sampleSchools.filter(s => s.verificationStatus === 'Verified');
  const rejectedSchools = sampleSchools.filter(s => s.verificationStatus === 'Rejected');

  const handleApprove = (school: School) => {
    toast.success(`${school.name} has been verified!`);
  };

  const handleReject = (school: School) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    toast.error(`${school.name} has been rejected`);
    setRejectionReason('');
  };

  const SchoolVerificationCard = ({ school, showActions = true }: { school: School; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{school.name}</CardTitle>
              <CardDescription>{school.district}, {school.sector}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="flex-shrink-0">
            {school.schoolType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">ID</p>
            <p className="font-mono text-xs mt-0.5">{school.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Level</p>
            <p className="font-medium mt-0.5">{school.educationLevel}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Coordinates</p>
            <p className="font-mono text-xs mt-0.5">
              {school.coordinates.lat.toFixed(4)}, {school.coordinates.lng.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium mt-0.5">{school.dateAdded}</p>
          </div>
        </div>

        {school.addedBy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <span>Added by:</span>
            <span className="font-medium text-foreground">{school.addedBy}</span>
          </div>
        )}

        {school.rejectionReason && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
              <AlertTriangle className="h-4 w-4" />
              Rejection Reason
            </div>
            <p className="text-sm text-muted-foreground">{school.rejectionReason}</p>
          </div>
        )}

        {showActions && school.verificationStatus === 'Pending' && (
          <div className="space-y-3 pt-2">
            <Textarea
              placeholder="Rejection reason (required if rejecting)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleReject(school)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => handleApprove(school)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        )}

        {showActions && school.verificationStatus === 'Unverified' && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Map
            </Button>
            <Button className="flex-1">
              Start Validation
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verification Queue</h1>
          <p className="text-muted-foreground">
            Review and validate school submissions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl">{pendingSchools.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-muted-foreground">
            <CardHeader className="pb-2">
              <CardDescription>Unverified</CardDescription>
              <CardTitle className="text-3xl">{unverifiedSchools.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardDescription>Verified</CardDescription>
              <CardTitle className="text-3xl">{verifiedSchools.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl">{rejectedSchools.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingSchools.length})
            </TabsTrigger>
            <TabsTrigger value="unverified" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Unverified ({unverifiedSchools.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Verified ({verifiedSchools.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedSchools.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingSchools.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold">All caught up!</h3>
                <p className="text-muted-foreground">No pending schools to review</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingSchools.map((school) => (
                  <SchoolVerificationCard key={school.id} school={school} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unverified" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {unverifiedSchools.map((school) => (
                <SchoolVerificationCard key={school.id} school={school} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {verifiedSchools.map((school) => (
                <SchoolVerificationCard key={school.id} school={school} showActions={false} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {rejectedSchools.map((school) => (
                <SchoolVerificationCard key={school.id} school={school} showActions={false} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
