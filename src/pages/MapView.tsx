import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SchoolMap } from '@/components/map/SchoolMap';
import { sampleSchools, rwandaDistricts, rwandaProvinces, School } from '@/data/rwandaSchools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, MapPin, School as SchoolIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type VerificationStatus = 'All' | 'Verified' | 'Pending' | 'Unverified' | 'Rejected';
type SchoolType = 'All' | 'Public' | 'Private';

export default function MapView() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<SchoolType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = sampleSchools.filter((school) => {
    if (statusFilter !== 'All' && school.verificationStatus !== statusFilter) return false;
    if (districtFilter !== 'All' && school.district !== districtFilter) return false;
    if (typeFilter !== 'All' && school.schoolType !== typeFilter) return false;
    if (searchQuery && !school.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const allDistricts = Object.values(rwandaDistricts).flat().sort();

  const clearFilters = () => {
    setStatusFilter('All');
    setDistrictFilter('All');
    setTypeFilter('All');
    setSearchQuery('');
  };

  const hasFilters = statusFilter !== 'All' || districtFilter !== 'All' || typeFilter !== 'All' || searchQuery;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header with Filters */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Map View</h1>
              <p className="text-muted-foreground">
                {filteredSchools.length} schools displayed
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Input
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />

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
              <SelectTrigger className="w-40">
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

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as SchoolType)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Map */}
          <div className="lg:col-span-3">
            <SchoolMap
              schools={filteredSchools}
              onSchoolSelect={setSelectedSchool}
              height="100%"
            />
          </div>

          {/* Side Panel */}
          <div className="bg-card rounded-xl border p-4 overflow-y-auto">
            {selectedSchool ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">School Details</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedSchool(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <SchoolIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedSchool.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedSchool.id}</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'status-badge inline-block',
                      selectedSchool.verificationStatus === 'Verified' && 'status-verified',
                      selectedSchool.verificationStatus === 'Pending' && 'status-pending',
                      selectedSchool.verificationStatus === 'Unverified' && 'status-unverified',
                      selectedSchool.verificationStatus === 'Rejected' && 'status-rejected'
                    )}
                  >
                    {selectedSchool.verificationStatus}
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Province</span>
                      <span className="font-medium">{selectedSchool.province}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">District</span>
                      <span className="font-medium">{selectedSchool.district}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Sector</span>
                      <span className="font-medium">{selectedSchool.sector}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{selectedSchool.schoolType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{selectedSchool.educationLevel}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Coordinates</span>
                      <span className="font-mono text-xs">
                        {selectedSchool.coordinates.lat.toFixed(4)}, {selectedSchool.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                    {selectedSchool.studentCount && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Students</span>
                        <span className="font-medium">{selectedSchool.studentCount}</span>
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Select a School</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a marker on the map to view school details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
