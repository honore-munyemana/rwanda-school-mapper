import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Trophy,
  Users,
  Map as MapIcon,
  Medal,
  Star,
  TrendingUp,
  MessageSquare,
  Award,
  Crown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommunityReport {
  type: 'missing' | 'correction';
  schoolName: string;
  message: string;
}

const mapperLeaderboard = [
  { name: 'Honore Munyemana', points: 1240, submissions: 42, rank: 1, avatar: 'HM' },
  { name: 'Jean Pierre', points: 980, submissions: 35, rank: 2, avatar: 'JP' },
  { name: 'Clarisse Umutoni', points: 850, submissions: 28, rank: 3, avatar: 'CU' },
  { name: 'Marie Louise', points: 720, submissions: 22, rank: 4, avatar: 'ML' },
];

const verifierLeaderboard = [
  { name: 'Dr. Alphonse', points: 2100, validations: 156, rank: 1, avatar: 'DA' },
  { name: 'Sarah G.', points: 1850, validations: 132, rank: 2, avatar: 'SG' },
  { name: 'Eric K.', points: 1420, validations: 98, rank: 3, avatar: 'EK' },
];

export default function CommunityEngagement() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [form, setForm] = useState<CommunityReport>({
    type: 'missing',
    schoolName: '',
    message: '',
  });

  const submitReport = () => {
    if (!form.schoolName.trim() || !form.message.trim()) return;
    setReports((prev) => [...prev, form]);
    setForm({ ...form, schoolName: '', message: '' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Community & Gamification
            </h1>
            <p className="text-muted-foreground">
              National volunteer engagement portal and performance rankings.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-xl px-4 py-1.5 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-bold gap-2">
              <Star className="h-4 w-4 fill-yellow-500" /> Season 3 Active
            </Badge>
          </div>
        </div>

        {/* Performance Overview (New Section) */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-xl border-dashed border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-primary tracking-widest">Global Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">2,482</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-dashed border-info/30 bg-info/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-info tracking-widest">Active Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">348</div>
              <p className="text-xs text-muted-foreground mt-1">Participating mappers & citizens</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-dashed border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-accent tracking-widest">Data Accuracy Reward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">15,000 RWF</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly prize for top validator</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* National Leaderboard (New Component Implementation) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl shadow-lg border-primary/10 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      National Leaderboard
                    </CardTitle>
                    <CardDescription className="text-xs">Top performing mappers based on verified submissions.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="xs" className="h-8 text-[10px] font-bold uppercase rounded-lg">Mappers</Button>
                    <Button variant="ghost" size="xs" className="h-8 text-[10px] font-bold uppercase rounded-lg text-muted-foreground">Verifiers</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mapperLeaderboard.map((user) => (
                    <div key={user.rank} className={cn(
                      "flex items-center gap-4 p-4 transition-colors",
                      user.rank === 1 ? "bg-yellow-500/5 hover:bg-yellow-500/10" : "hover:bg-muted/50"
                    )}>
                      <div className="w-8 font-black text-center text-muted-foreground italic">
                        {user.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500 mx-auto" /> : `#${user.rank}`}
                      </div>
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarFallback className={cn(
                          "font-bold",
                          user.rank === 1 ? "bg-yellow-500 text-white" : "bg-primary/10"
                        )}>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                          {user.submissions} Submissions • {user.points} XP
                        </p>
                      </div>
                      <div className="hidden sm:block w-32">
                        <Progress value={(user.points / 1500) * 100} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-1">
                        {user.rank <= 3 && (
                          <Medal className={cn(
                            "h-4 w-4",
                            user.rank === 1 ? "text-yellow-500" :
                              user.rank === 2 ? "text-slate-400" : "text-amber-600"
                          )} />
                        )}
                        <Badge variant="secondary" className="text-[10px] h-5 rounded-md">Elite</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-3 bg-muted/20 border-t flex justify-center">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">View Full Rankings →</Button>
              </div>
            </Card>

            {/* Recent Global Activity */}
            <Card className="rounded-xl border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" /> Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { user: "Jean P.", msg: "reached 'Local Scout' badge in Northern Province!", time: "2h ago" },
                  { user: "Sarah G.", msg: "achieved 100% accuracy on last 50 validations!", time: "5h ago" }
                ].map((a, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 animate-pulse" />
                    <p><span className="font-bold">{a.user}</span> {a.msg} <span className="text-muted-foreground text-[10px] ml-2">{a.time}</span></p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Feedback Form (Existing logic improved) */}
          <div className="space-y-6">
            <Card className="rounded-xl shadow-md border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Feedback Portal
                </CardTitle>
                <CardDescription>Report missing schools or data inaccuracies directly to the Ministry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School name / Subject</Label>
                  <Input
                    id="school-name"
                    className="rounded-lg h-10"
                    placeholder="Enter school name"
                    value={form.schoolName}
                    onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details / Description</Label>
                  <Textarea
                    id="message"
                    className="rounded-lg min-h-[120px]"
                    placeholder="Describe the issue or provide details about the missing school..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <Button className="w-full h-11 rounded-lg shadow-md" onClick={submitReport}>
                  Submit Report to Ministry
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3">
                {reports.length === 0 ? (
                  <div className="p-8 text-center border-dashed border-2 rounded-xl">
                    <p className="text-sm text-muted-foreground italic">No feedback submitted in this session.</p>
                  </div>
                ) : (
                  reports.map((r, idx) => (
                    <div key={idx} className="bg-card border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm truncate">{r.schoolName}</p>
                        <Badge variant="secondary" className="text-[8px] h-4">Pending</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{r.message}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
