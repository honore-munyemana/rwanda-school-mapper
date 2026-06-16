import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useTheme, Theme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop, RotateCcw, Palette, Settings } from 'lucide-react';

// Live dashboard mock preview for visual feedback on theme selection
function ThemePreview({ activeTheme }: { activeTheme: 'light' | 'dark' }) {
  const isDark = activeTheme === 'dark';
  return (
    <div className={`w-full rounded-xl border p-5 font-sans transition-all duration-300 shadow-lg ${
      isDark 
        ? 'bg-[#0F1923] border-white/10 text-[#EEE8DC]' 
        : 'bg-[#F8F9FA] border-gray-200 text-gray-800'
    }`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b pb-3 mb-4 border-current/10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#3D7A5C]" />
          <span className="text-[10px] font-mono tracking-wider font-bold">SSEVMS_KIGALI_HQ</span>
        </div>
        <div className="h-2 w-12 rounded bg-[#C4622D]" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Sidebar Mock */}
        <div className={`col-span-1 rounded-lg p-3 border flex flex-col gap-2 ${
          isDark ? 'bg-[#0A0F14] border-white/5' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="h-2 w-10 rounded bg-[#C4622D]/80" />
          <div className="h-2 w-full rounded bg-current/10" />
          <div className="h-2 w-full rounded bg-current/10" />
          <div className="h-2 w-full rounded bg-current/10" />
        </div>

        {/* Content area mock */}
        <div className="col-span-2 flex flex-col gap-3">
          {/* Stats card mock */}
          <div className={`rounded-lg p-3 border ${
            isDark ? 'bg-[#141C25] border-white/5' : 'bg-white border-gray-200'
          }`}>
            <div className="h-1.5 w-12 rounded bg-current/20 mb-2" />
            <div className="h-4 w-8 rounded bg-[#D4A847]" />
          </div>
          
          {/* Map mock */}
          <div className={`rounded-lg h-20 border flex flex-col items-center justify-center text-[9px] font-mono relative overflow-hidden ${
            isDark ? 'bg-black/20 border-white/5' : 'bg-gray-200 border-gray-300'
          }`}>
            <span className="opacity-40 z-10 font-bold uppercase tracking-wider">Interactive Radar Map</span>
            <div className="absolute top-1/2 left-1/4 h-2 w-2 rounded-full bg-[#3D7A5C] shadow-lg animate-pulse" />
            <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-[#C4622D] shadow-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SystemSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const isAdmin = user?.role === 'admin';

  // Determine current effective theme (light or dark) for the preview rendering
  const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme;
  };

  const currentPreviewTheme = getEffectiveTheme(theme);

  const appearanceContent = (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Selector Card */}
      <Card className="bg-[#141C25]/80 border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C4622D]" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#C4622D]" />
            <CardTitle>Theme Selector</CardTitle>
          </div>
          <CardDescription>Customize your application visual interface preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3">
            <Label className="text-xs uppercase tracking-widest text-[#8A9BAD] font-bold">Select Preference</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className={`h-14 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all ${
                  theme === 'light' 
                    ? 'bg-[#C4622D] text-white hover:bg-[#C4622D]/90' 
                    : 'border-white/10 hover:bg-white/5 text-[#8A9BAD] hover:text-white'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Light</span>
              </Button>

              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className={`h-14 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#C4622D] text-white hover:bg-[#C4622D]/90' 
                    : 'border-white/10 hover:bg-white/5 text-[#8A9BAD] hover:text-white'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Dark</span>
              </Button>

              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className={`h-14 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all ${
                  theme === 'system' 
                    ? 'bg-[#C4622D] text-white hover:bg-[#C4622D]/90' 
                    : 'border-white/10 hover:bg-white/5 text-[#8A9BAD] hover:text-white'
                }`}
              >
                <Laptop className="h-4 w-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest">System</span>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Reset to Defaults</span>
              <span className="text-[10px] text-[#8A9BAD]">Revert back to standard OS themes.</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme('system')}
              className="border-white/10 hover:bg-white/5 text-[#8A9BAD] hover:text-white flex items-center gap-2 rounded-xl"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Reset</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="bg-[#141C25]/80 border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4A847]" />
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <CardDescription>Live visual preview showing elements in the effective theme.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <ThemePreview activeTheme={currentPreviewTheme} />
        </CardContent>
      </Card>
    </div>
  );

  const adminContent = (
    <Card className="bg-[#141C25]/80 border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C4622D]" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#C4622D]" />
          <CardTitle>Maintenance & Deployment</CardTitle>
        </div>
        <CardDescription>Scoping options for national rollout (simulated).</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/10 px-4 py-3">
          <div>
            <Label className="text-sm font-medium text-white">Maintenance mode</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, end-users would see a read-only banner.
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/10 px-4 py-3">
          <div>
            <Label className="text-sm font-medium text-white">National deployment</Label>
            <p className="text-xs text-muted-foreground">
              Toggle to indicate rollout beyond pilot districts.
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal visual experience {isAdmin ? 'and system deployment settings.' : '.'}
          </p>
        </div>

        {isAdmin ? (
          <Tabs defaultValue="appearance" className="w-full space-y-6">
            <TabsList className="bg-black/20 border border-white/5 p-1 rounded-xl w-fit">
              <TabsTrigger 
                value="appearance" 
                className="rounded-lg px-6 py-2 text-xs uppercase tracking-widest font-black data-[state=active]:bg-[#C4622D] data-[state=active]:text-white text-[#8A9BAD] transition-all"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-lg px-6 py-2 text-xs uppercase tracking-widest font-black data-[state=active]:bg-[#C4622D] data-[state=active]:text-white text-[#8A9BAD] transition-all"
              >
                System Config
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {appearanceContent}
            </TabsContent>

            <TabsContent value="admin" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {adminContent}
            </TabsContent>
          </Tabs>
        ) : (
          appearanceContent
        )}
      </div>
    </DashboardLayout>
  );
}
