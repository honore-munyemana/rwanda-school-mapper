import { useState, useEffect, useRef, useMemo, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  GraduationCap,
  User,
  FileText,
  History,
  Clock,
  Trash2,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResultItem {
  id: string;
  category: 'schools' | 'users' | 'reports' | 'audits' | 'recent';
  title: string;
  subtitle?: string;
  data: any;
}

export function GlobalSearch() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<{
    schools: any[];
    users: any[];
    reports: any[];
    audits: any[];
  }>({
    schools: [],
    users: [],
    reports: [],
    audits: []
  });

  const [recentSearches, setRecentSearches] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ssevms-recent-searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce (400ms) logic for API call
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ schools: [], users: [], reports: [], audits: [] });
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      if (!token) return;

      fetch(`http://localhost:5000/search?q=${encodeURIComponent(query.trim())}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Search failed');
          return res.json();
        })
        .then((data) => {
          setResults({
            schools: data.schools || [],
            users: data.users || [],
            reports: data.reports || [],
            audits: data.audits || []
          });
          setSelectedIndex(-1);
        })
        .catch((err) => {
          console.error('Search error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, token]);

  // Flatten active items for keyboard navigation index tracking
  const flatItems = useMemo((): SearchResultItem[] => {
    const items: SearchResultItem[] = [];

    // Show recent searches when input is focused but empty/short
    if (!query || query.trim().length < 2) {
      recentSearches.forEach((rs, index) => {
        items.push({
          id: `recent-${index}-${rs.id || rs.title}`,
          category: 'recent',
          title: rs.title,
          subtitle: rs.subtitle || rs.category.toUpperCase(),
          data: rs
        });
      });
      return items;
    }

    if (results.schools && results.schools.length > 0) {
      results.schools.forEach((s) => {
        items.push({
          id: `school-${s.id}`,
          category: 'schools',
          title: s.name,
          subtitle: `${s.district} • ${s.school_type || 'Unknown Type'} • ${s.status || 'Unverified'}`,
          data: s
        });
      });
    }

    if (results.users && results.users.length > 0) {
      results.users.forEach((u) => {
        items.push({
          id: `user-${u.id}`,
          category: 'users',
          title: u.name,
          subtitle: `${u.email} • ${u.role.toUpperCase()}`,
          data: u
        });
      });
    }

    if (results.reports && results.reports.length > 0) {
      results.reports.forEach((r, idx) => {
        items.push({
          id: `report-${idx}`,
          category: 'reports',
          title: r.title,
          subtitle: r.description,
          data: r
        });
      });
    }

    if (results.audits && results.audits.length > 0) {
      results.audits.forEach((a) => {
        items.push({
          id: `audit-${a.id}`,
          category: 'audits',
          title: `${a.school_name} Proximity Audit`,
          subtitle: `Validator: ${a.verifier_name || a.verifier_email} • Result: ${a.result.toUpperCase()}`,
          data: a
        });
      });
    }

    return items;
  }, [query, results, recentSearches]);

  // Store select search item in localStorage as recent search
  const saveToRecent = (item: SearchResultItem) => {
    let recentItem = {
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
      id: item.id,
      data: item.data
    };

    // Filter out duplicates
    const filtered = recentSearches.filter(
      (x) => !(x.title === recentItem.title && x.category === recentItem.category)
    );

    const updated = [recentItem, ...filtered].slice(0, 5); // Keep up to 5
    setRecentSearches(updated);
    localStorage.setItem('ssevms-recent-searches', JSON.stringify(updated));
  };

  const clearRecentSearches = (e: any) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('ssevms-recent-searches');
    setSelectedIndex(-1);
  };

  // Perform navigation to appropriate page
  const handleItemSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);

    if (item.category !== 'recent') {
      saveToRecent(item);
    } else {
      // Re-save to push to top of list
      saveToRecent({ ...item, category: item.data.category });
    }

    const itemData = item.data;
    const itemCategory = item.category === 'recent' ? item.data.category : item.category;

    switch (itemCategory) {
      case 'schools':
        navigate('/schools', {
          state: {
            searchQuery: itemData.name || itemData.title,
            selectedSchoolId: itemData.id
          }
        });
        break;
      case 'users':
        navigate('/users', {
          state: {
            searchTerm: itemData.email || itemData.name
          }
        });
        break;
      case 'reports':
        navigate('/reports', {
          state: {
            reportType: itemData.type,
            selectedSchoolId: itemData.school_id
          }
        });
        break;
      case 'audits':
        navigate('/audit', {
          state: {
            searchTerm: itemData.school_name || itemData.title
          }
        });
        break;
      default:
        break;
    }
  };

  // Keyboard navigation keydown handler
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
        handleItemSelect(flatItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9BAD]/40 group-focus-within:text-[#C4622D] transition-colors" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Query National Database (Schools, Reports, Users)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 h-11 bg-black/20 dark:bg-black/20 light:bg-black/5 border-white/5 dark:border-white/5 light:border-black/10 focus-visible:ring-1 focus-visible:ring-[#C4622D]/50 rounded-lg font-mono text-xs text-[#EEE8DC] dark:text-[#EEE8DC] light:text-foreground placeholder:text-[#8A9BAD]/30"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-[#C4622D]" />
          </div>
        )}
      </div>

      {isOpen && (flatItems.length > 0 || (query.trim().length >= 2 && !loading)) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl p-2 max-h-[450px] overflow-y-auto font-sans">
          
          {/* Recent Searches Header / Actions */}
          {(!query || query.trim().length < 2) && recentSearches.length > 0 && (
            <div className="flex justify-between items-center px-3 py-1.5 border-b border-border/30 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Recent Searches
              </span>
              <button
                onClick={clearRecentSearches}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          )}

          {/* Grouped results view */}
          {flatItems.length > 0 ? (
            <div className="space-y-3">
              {/* Categorize rendering visually */}
              {['recent', 'schools', 'users', 'reports', 'audits'].map((category) => {
                const categoryItems = flatItems.filter((item) => item.category === category);
                if (categoryItems.length === 0) return null;

                const categoryLabels: Record<string, string> = {
                  recent: 'Recent Activity',
                  schools: 'Schools Registry',
                  users: 'Users (Admin Restricted)',
                  reports: 'Reports & Export',
                  audits: 'Audit Trails & Logs'
                };

                return (
                  <div key={category} className="space-y-1">
                    {category !== 'recent' && (
                      <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70 bg-muted/20 rounded-md">
                        {categoryLabels[category]}
                      </div>
                    )}
                    {categoryItems.map((item) => {
                      const overallIndex = flatItems.findIndex((x) => x.id === item.id);
                      const isSelected = overallIndex === selectedIndex;

                      let Icon = GraduationCap;
                      if (item.category === 'users') Icon = User;
                      if (item.category === 'reports') Icon = FileText;
                      if (item.category === 'audits') Icon = History;
                      if (item.category === 'recent') {
                        const actualCategory = item.data.category;
                        if (actualCategory === 'users') Icon = User;
                        if (actualCategory === 'reports') Icon = FileText;
                        if (actualCategory === 'audits') Icon = History;
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer text-foreground hover:bg-muted/80',
                            isSelected && 'bg-muted shadow-sm ring-1 ring-[#C4622D]/35'
                          )}
                        >
                          <div className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md border",
                            isSelected ? "bg-[#C4622D]/10 border-[#C4622D]/40 text-[#C4622D]" : "bg-muted/40 border-border/40 text-muted-foreground"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                              {item.title}
                              {item.category === 'schools' && item.data.is_own_submission && (
                                <span className="bg-[#C4622D]/10 text-[#C4622D] border border-[#C4622D]/20 text-[9px] px-1 rounded font-mono font-normal">
                                  Mine
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <div className="text-[10px] text-muted-foreground truncate font-light">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            query.trim().length >= 2 && !loading && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
                <AlertCircle className="h-6 w-6 text-muted-foreground/60" />
                <p className="font-mono text-xs uppercase tracking-widest">No matching records found</p>
                <p className="text-[10px] font-mono font-light">Refine your query (e.g. name, district, type)</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
