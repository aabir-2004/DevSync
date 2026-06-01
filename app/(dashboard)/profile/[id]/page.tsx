"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getReputationLevel } from "@/lib/reputation";
import Avatar from "@/components/shared/Avatar";
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  FileText, 
  Trophy, 
  Settings, 
  Calendar, 
  Activity, 
  Loader2 
} from "lucide-react";

interface ProfileUser {
  id: string;
  name: string;
  role: string;
  batch: string | null;
  bio: string | null;
  created_at: string;
  avatar_url: string | null;
  reputation: number;
}

interface Achievement {
  id: string;
  badge_key: string;
  earned_at: string;
}

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const supabase = createClient();
  const { id: paramId } = use(params);

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Custom stats
  const [stats, setStats] = useState({
    resources: 0,
    blogs: 0,
    dsa: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch Current User
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, [supabase]);

  // Fetch Profile details
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        let targetId = paramId;
        
        // If route is /profile/me, we fetch current user's profile
        if (paramId === "me") {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            router.push("/auth/login");
            return;
          }
          targetId = user.id;
        }

        // Fetch User profile
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", targetId)
          .single();

        if (userError || !userData) {
          throw new Error("Profile not found.");
        }

        setProfile(userData);

        // Fetch User achievements
        const { data: achData } = await supabase
          .from("achievements")
          .select("*")
          .eq("user_id", targetId);
        
        setAchievements(achData || []);

        // Fetch counts metrics
        const [resCount, blogCount, dsaCount] = await Promise.all([
          supabase.from("resources").select("*", { count: "exact", head: true }).eq("author_id", targetId),
          supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("author_id", targetId).eq("status", "published"),
          supabase.from("dsa_progress").select("*", { count: "exact", head: true }).eq("user_id", targetId).eq("status", "solved"),
        ]);

        setStats({
          resources: resCount.count || 0,
          blogs: blogCount.count || 0,
          dsa: dsaCount.count || 0,
        });

      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [paramId, router, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="premium-card rounded-3xl p-10 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          Profile not found
        </p>
        <Link href="/" className="text-xs text-primary font-bold hover:underline mt-2">
          Back to Home
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const reputationLevel = getReputationLevel(profile.reputation);

  // Map achievement keys to beautiful badges details
  const getBadgeDetails = (key: string) => {
    const badges: Record<string, { title: string; desc: string; color: string }> = {
      first_blog: { 
        title: "Technical Author", 
        desc: "Published your first technical blog post", 
        color: "bg-primary-100 text-primary-950 dark:bg-primary-950/40 dark:text-primary-300 border-primary-200" 
      },
      first_resource: { 
        title: "Key Contributor", 
        desc: "Contributed your first shared learning resource", 
        color: "bg-blue-100 text-blue-950 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200" 
      },
      first_thread: { 
        title: "Inquisitive Mind", 
        desc: "Started your first forum discussion thread", 
        color: "bg-purple-100 text-purple-950 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200" 
      },
      ten_helpful: { 
        title: "Cohort Mentor", 
        desc: "Received 10 upvotes on discussion comments", 
        color: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200" 
      },
      streak_7: { 
        title: "Dedicated Learner", 
        desc: "Completed learning tasks for 7 consecutive days", 
        color: "bg-orange-100 text-orange-950 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200" 
      },
    };

    return badges[key] || { 
      title: key.replace("_", " ").toUpperCase(), 
      desc: "Unlocked special cohort milestone.", 
      color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200" 
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Overview Card */}
      <div className="premium-card rounded-3xl p-6 md:p-8 bg-gradient-to-tr from-white via-white to-orange-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-primary-950/10 shadow-md relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary-100/40 blur-3xl dark:bg-primary-950/20" />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="flex-shrink-0">
            <Avatar 
              name={profile.name} 
              src={profile.avatar_url} 
              size="xl" 
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                {profile.name}
              </h1>
              
              <span className="inline-flex items-center justify-center bg-primary-50 text-primary dark:bg-primary-950/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary-100/50">
                {profile.role.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-zinc-500">
              {profile.batch && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4.5 w-4.5 text-zinc-400" />
                  {profile.batch}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-zinc-400" />
                Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>

            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed pt-1.5">
              {profile.bio || "This developer hasn't composed a bio yet."}
            </p>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="sm:self-start inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 hover:border-primary px-4 py-2 text-xs font-bold text-zinc-600 hover:text-primary dark:border-zinc-800 dark:hover:border-primary dark:text-zinc-400 dark:hover:text-primary transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
            >
              <Settings className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
          )}
        </div>
      </div>

      {/* Gamification Reputation Metrics Card */}
      <div className="premium-card rounded-3xl p-6 shadow-md">
        <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5 mb-4">
          <Activity className="h-4.5 w-4.5 text-primary" />
          <span>Reputation & Level tier</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* XP details */}
          <div className="text-center md:text-left space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Reputation Score
            </p>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-3xl font-extrabold text-primary font-mono">
                {profile.reputation}
              </span>
              <span className="text-xs font-bold text-zinc-400">XP</span>
            </div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Cohort Tier: <span className="text-primary">{reputationLevel.name}</span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-500">Level Progress</span>
              {reputationLevel.nextPoints ? (
                <span className="text-zinc-950 dark:text-zinc-50">
                  {profile.reputation} / {reputationLevel.nextPoints} XP
                </span>
              ) : (
                <span className="text-primary font-bold">Max Tier Reached 🏆</span>
              )}
            </div>
            
            <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200/20">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500 ease-out" 
                style={{ width: `${reputationLevel.percent}%` }}
              />
            </div>
            
            {reputationLevel.nextPoints && (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Solve problems and contribute to reach the next tier.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Stats Counter Rows */}
      <div className="grid grid-cols-3 gap-4">
        {/* Resources Counter */}
        <div className="premium-card rounded-2xl p-4 text-center space-y-1">
          <BookOpen className="h-5 w-5 text-blue-500 mx-auto" />
          <p className="text-lg font-black text-zinc-900 dark:text-white font-mono">
            {stats.resources}
          </p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase">
            Shared Notes
          </p>
        </div>

        {/* Blogs Counter */}
        <div className="premium-card rounded-2xl p-4 text-center space-y-1">
          <FileText className="h-5 w-5 text-primary mx-auto" />
          <p className="text-lg font-black text-zinc-900 dark:text-white font-mono">
            {stats.blogs}
          </p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase">
            Tech Blogs
          </p>
        </div>

        {/* DSA Counter */}
        <div className="premium-card rounded-2xl p-4 text-center space-y-1">
          <Trophy className="h-5 w-5 text-green-500 mx-auto" />
          <p className="text-lg font-black text-zinc-900 dark:text-white font-mono">
            {stats.dsa}
          </p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase">
            DSA Solved
          </p>
        </div>
      </div>

      {/* Achievements section */}
      <div className="premium-card rounded-3xl p-6 shadow-md">
        <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5 mb-4">
          <Award className="h-4.5 w-4.5 text-primary" />
          <span>Earned Achievements ({achievements.length})</span>
        </h3>

        {achievements.length === 0 ? (
          <p className="text-center py-6 text-xs text-zinc-400">
            No achievements unlocked yet. Share a note or write a post to start earning badges!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const details = getBadgeDetails(ach.badge_key);
              return (
                <div 
                  key={ach.id} 
                  className={`flex items-start gap-3 rounded-2xl p-4.5 border ${details.color}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 dark:bg-zinc-900/50 flex-shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-snug">
                      {details.title}
                    </h4>
                    <p className="text-[10px] opacity-80 leading-normal mt-0.5">
                      {details.desc}
                    </p>
                    <span className="text-[8px] opacity-60 block mt-2">
                      Earned: {new Date(ach.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
