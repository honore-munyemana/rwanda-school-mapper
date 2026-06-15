/** @deprecated Legacy localStorage registration — routes redirect to /login. Retained for reference only. */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { AuthRole, saveUser } from '@/routes/auth';
import { toast } from 'sonner';
import { rwandaDistricts } from '@/data/rwandaSchools';

export default function SignUp() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [organization, setOrganization] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<AuthRole>('Public User');
    const [province, setProvince] = useState<string>('');
    const [district, setDistrict] = useState<string>('');

    const provinces = Object.keys(rwandaDistricts);
    const districts = province ? rwandaDistricts[province as keyof typeof rwandaDistricts] : [];

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName || !email || !password || !phone || !organization || !province || !district) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const newUser = {
            id: `user_${Date.now()}`,
            fullName,
            email,
            phone,
            organization,
            password, // In a real app, this would be hashed on the server
            role,
            areaProvince: province,
            areaDistrict: district,
        };

        saveUser(newUser);
        toast.success('Account created successfully! Please sign in.');
        navigate('/signin');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
                    <CardDescription>
                        Create your account for SSEVMS.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="+250..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organization">Organization</Label>
                                <Input
                                    id="organization"
                                    placeholder="e.g., REB, District"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repeat password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">System Role</Label>
                            <Select value={role} onValueChange={(v) => setRole(v as AuthRole)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Administrator</SelectItem>
                                    <SelectItem value="Verifier">Verifier</SelectItem>
                                    <SelectItem value="Public User">Public User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                            <Label className="text-sm font-semibold">Area of Responsibility (Geographic)</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="province" className="text-xs">Province</Label>
                                    <Select value={province} onValueChange={(v) => { setProvince(v); setDistrict(''); }}>
                                        <SelectTrigger id="province">
                                            <SelectValue placeholder="Select Province" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map(p => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="district" className="text-xs">District</Label>
                                    <Select value={district} onValueChange={setDistrict} disabled={!province}>
                                        <SelectTrigger id="district">
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full h-12 rounded-xl">Register Account</Button>
                        <div className="text-sm text-center">
                            Already have an account?{' '}
                            <Link to="/signin" className="text-primary font-medium hover:underline">
                                Sign In
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
