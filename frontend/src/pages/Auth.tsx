import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/context/UserContext';

export default function Auth() {
  const { currentUser, login, register, toggleMfa, session } = useUser();
  const [loginEmail, setLoginEmail] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    role: 'mapper' as const,
    organization: '',
  });
  const [area, setArea] = useState<string>('Kigali City');

  const handleLogin = () => {
    if (!loginEmail.trim()) return;
    login(loginEmail, 'viewer');
  };

  const handleRegister = () => {
    if (!registerForm.email.trim() || !registerForm.name.trim()) return;
    register({
      name: registerForm.name,
      email: registerForm.email,
      role: registerForm.role,
      avatar: undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Access & Authentication</h1>
          <p className="text-muted-foreground">
            Prototype flows for registration, login, geographic responsibility, and MFA simulation.
          </p>
        </div>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="security">Security & MFA</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Use your email to start a prototype session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    placeholder="user@ssevms.gov.rw"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleLogin}>Login (Prototype)</Button>
                {currentUser && (
                  <p className="text-sm text-muted-foreground">
                    Logged in as <span className="font-medium">{currentUser.name}</span> (
                    {currentUser.role})
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register New User</CardTitle>
                <CardDescription>
                  Academic prototype – captures key fields and assigns a role and geographic responsibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full name</Label>
                  <Input
                    id="reg-name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={registerForm.role}
                    onValueChange={(value) =>
                      setRegisterForm({ ...registerForm, role: value as typeof registerForm.role })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mapper">Mapper</SelectItem>
                      <SelectItem value="validator">Validator</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Area of responsibility</Label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kigali City">Kigali City</SelectItem>
                      <SelectItem value="Eastern Province">Eastern Province</SelectItem>
                      <SelectItem value="Western Province">Western Province</SelectItem>
                      <SelectItem value="Northern Province">Northern Province</SelectItem>
                      <SelectItem value="Southern Province">Southern Province</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Prototype: stored in memory as part of the user profile.
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button onClick={handleRegister}>Register & Login</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & MFA (Simulated)</CardTitle>
                <CardDescription>
                  Configure multi-factor authentication and session behaviour for this prototype.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Multi-factor authentication</p>
                    <p className="text-xs text-muted-foreground">
                      Toggle to simulate MFA being required on each login.
                    </p>
                  </div>
                  <Switch checked={!!session?.mfaEnabled} onCheckedChange={toggleMfa} />
                </div>
                {session && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Last active: {new Date(session.lastActiveAt).toLocaleString()}</p>
                    <p>Session expires at: {new Date(session.expiresAt).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

