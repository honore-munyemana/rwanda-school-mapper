import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { sampleSchools, rwandaDistricts, School } from '@/data/rwandaSchools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  MapPin, 
  Eye,
  Pencil,
  Trash2,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type VerificationStatus = 'All' | 'Verified' | 'Pending' | 'Unverified' | 'Rejected';

const statusStyles: Record<string, string> = {
  Verified: 'bg-success/10 text-success border-success/20',
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Unverified: 'bg-muted text-muted-foreground border-border',
  Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function SchoolsRegistry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const filteredSchools = sampleSchools.filter((school) => {
    if (statusFilter !== 'All' && school.verificationStatus !== statusFilter) return false;
    if (districtFilter !== 'All' && school.district !== districtFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        school.name.toLowerCase().includes(query) ||
        school.id.toLowerCase().includes(query) ||
        school.district.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const allDistricts = Object.values(rwandaDistricts).flat().sort();

  const clearFilters = () => {
    setStatusFilter('All');
    setDistrictFilter('All');
    setSearchQuery('');
  };

  const hasFilters = statusFilter !== 'All' || districtFilter !== 'All' || searchQuery;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Schools Registry</h1>
            <p className="text-muted-foreground">
              Manage and track all registered schools
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VerificationStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Unverified">Unverified</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Districts</SelectItem>
              {allDistricts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredSchools.length} of {sampleSchools.length} schools
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">School Name</TableHead>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">District</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Level</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.sector}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{school.id}</TableCell>
                  <TableCell>{school.district}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {school.schoolType}
                    </Badge>
                  </TableCell>
                  <TableCell>{school.educationLevel}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border',
                      statusStyles[school.verificationStatus]
                    )}>
                      {school.verificationStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {school.lastUpdated}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedSchool(school)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MapPin className="mr-2 h-4 w-4" />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* School Detail Dialog */}
        <Dialog open={!!selectedSchool} onOpenChange={() => setSelectedSchool(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedSchool?.name}</DialogTitle>
              <DialogDescription>
                {selectedSchool?.id} • {selectedSchool?.district}, {selectedSchool?.province}
              </DialogDescription>
            </DialogHeader>
            {selectedSchool && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <span className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border',
                    statusStyles[selectedSchool.verificationStatus]
                  )}>
                    {selectedSchool.verificationStatus}
                  </span>
                  <Badge variant="outline">{selectedSchool.schoolType}</Badge>
                  <Badge variant="outline">{selectedSchool.educationLevel}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Province</p>
                    <p className="font-medium">{selectedSchool.province}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">District</p>
                    <p className="font-medium">{selectedSchool.district}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sector</p>
                    <p className="font-medium">{selectedSchool.sector}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">GPS Coordinates</p>
                    <p className="font-mono text-sm">
                      {selectedSchool.coordinates.lat.toFixed(6)}, {selectedSchool.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                  {selectedSchool.studentCount && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="font-medium">{selectedSchool.studentCount}</p>
                    </div>
                  )}
                  {selectedSchool.teacherCount && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Teachers</p>
                      <p className="font-medium">{selectedSchool.teacherCount}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date Added</p>
                    <p className="font-medium">{selectedSchool.dateAdded}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{selectedSchool.lastUpdated}</p>
                  </div>
                </div>

                {selectedSchool.rejectionReason && (
                  <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive mb-1">Rejection Reason</p>
                    <p className="text-sm text-muted-foreground">{selectedSchool.rejectionReason}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button className="flex-1">
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit School
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
