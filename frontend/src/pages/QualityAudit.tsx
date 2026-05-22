import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';

export default function QualityAudit() {
  const { schools } = useData();
  const total = schools.length;
  const withCoords = schools.filter((s) => !!s.coordinates).length;
  const completeness = total > 0 ? Math.round((withCoords / total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quality Assurance & Audit</h1>
          <p className="text-muted-foreground">
            Prototype dashboard summarizing completeness metrics and providing sampling tools.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Completeness</CardTitle>
              <CardDescription>Schools with valid coordinates.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completeness}%</p>
              <p className="text-xs text-muted-foreground">
                {withCoords} of {total} schools.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Duplicates (simulated)</CardTitle>
              <CardDescription>Potential duplicate school entries.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Prototype placeholder.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sample for Review</CardTitle>
              <CardDescription>Randomly selected schools for manual QA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline">
                Draw 5-school sample (simulated)
              </Button>
              <p className="text-xs text-muted-foreground">
                In a full system this would generate a sample and assign it to validators.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

