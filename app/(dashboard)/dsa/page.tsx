"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Trophy, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Flame, 
  BookOpen, 
  Plus, 
  Loader2, 
  Layers, 
  ChevronDown, 
  ChevronUp
} from "lucide-react";
import Tag from "@/components/shared/Tag";

interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  platform: "leetcode" | "codeforces" | "codechef" | "gfg" | "other";
  external_url: string;
  week_number: number;
  is_weekly: boolean;
}

interface Progress {
  problem_id: string;
  status: "attempted" | "solved";
}

export default function DSAPage() {
  const supabase = createClient();
  
  // Database States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, "attempted" | "solved">>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("student");
  
  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Seed sample data list
  const SAMPLE_PROBLEMS = [
    { title: "Two Sum", topic: "Arrays", difficulty: "easy", platform: "leetcode", external_url: "https://leetcode.com/problems/two-sum/", week_number: 1, is_weekly: false },
    { title: "Container With Most Water", topic: "Arrays", difficulty: "medium", platform: "leetcode", external_url: "https://leetcode.com/problems/container-with-most-water/", week_number: 1, is_weekly: false },
    { title: "Longest Substring Without Repeating Characters", topic: "Strings", difficulty: "medium", platform: "leetcode", external_url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", week_number: 2, is_weekly: false },
    { title: "Valid Parentheses", topic: "Strings", difficulty: "easy", platform: "leetcode", external_url: "https://leetcode.com/problems/valid-parentheses/", week_number: 2, is_weekly: false },
    { title: "Reverse Linked List", topic: "Linked Lists", difficulty: "easy", platform: "leetcode", external_url: "https://leetcode.com/problems/reverse-linked-list/", week_number: 3, is_weekly: false },
    { title: "Merge k Sorted Lists", topic: "Linked Lists", difficulty: "hard", platform: "leetcode", external_url: "https://leetcode.com/problems/merge-k-sorted-lists/", week_number: 3, is_weekly: false },
    { title: "Invert Binary Tree", topic: "Trees", difficulty: "easy", platform: "leetcode", external_url: "https://leetcode.com/problems/invert-binary-tree/", week_number: 4, is_weekly: true },
    { title: "Maximum Depth of Binary Tree", topic: "Trees", difficulty: "easy", platform: "leetcode", external_url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", week_number: 4, is_weekly: true },
    { title: "Binary Tree Level Order Traversal", topic: "Trees", difficulty: "medium", platform: "leetcode", external_url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", week_number: 4, is_weekly: true },
    { title: "Clone Graph", topic: "Graphs", difficulty: "medium", platform: "leetcode", external_url: "https://leetcode.com/problems/clone-graph/", week_number: 6, is_weekly: false },
    { title: "Number of Islands", topic: "Graphs", difficulty: "medium", platform: "leetcode", external_url: "https://leetcode.com/problems/number-of-islands/", week_number: 6, is_weekly: false },
    { title: "Climbing Stairs", topic: "Dynamic Programming", difficulty: "easy", platform: "leetcode", external_url: "https://leetcode.com/problems/climbing-stairs/", week_number: 8, is_weekly: false },
    { title: "Longest Common Subsequence", topic: "Dynamic Programming", difficulty: "medium", platform: "leetcode", external_url: "https://leetcode.com/problems/longest-common-subsequence/", week_number: 8, is_weekly: false }
  ];

  // Load problems & user details
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch session user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Fetch user profile role
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profile) setUserRole(profile.role);

          // Fetch user progress
          const { data: userProgress } = await supabase
            .from("dsa_progress")
            .select("problem_id, status")
            .eq("user_id", user.id);
          
          if (userProgress) {
            const pMap: Record<string, "attempted" | "solved"> = {};
            userProgress.forEach((p) => {
              pMap[p.problem_id] = p.status as "attempted" | "solved";
            });
            setProgressMap(pMap);
          }
        }

        // Fetch problems
        const { data: dsaProblems } = await supabase
          .from("dsa_problems")
          .select("*")
          .order("week_number", { ascending: true })
          .order("title", { ascending: true });

        if (dsaProblems && dsaProblems.length > 0) {
          setProblems(dsaProblems as Problem[]);
          
          // Auto-expand all topics initially
          const uniqueTopics = Array.from(new Set(dsaProblems.map(p => p.topic)));
          const exp: Record<string, boolean> = {};
          uniqueTopics.forEach(t => { exp[t] = true; });
          setExpandedTopics(exp);
        } else {
          // If database contains no problems, we will offer seeding
          setProblems([]);
        }
      } catch (err) {
        console.error("Failed to load DSA problems:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  // Seeding trigger
  const handleSeedProblems = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("dsa_problems").insert(SAMPLE_PROBLEMS);
      if (error) throw error;
      
      // Reload problems
      const { data: dsaProblems } = await supabase
        .from("dsa_problems")
        .select("*")
        .order("week_number", { ascending: true });
      
      if (dsaProblems) {
        setProblems(dsaProblems as Problem[]);
        const uniqueTopics = Array.from(new Set(dsaProblems.map(p => p.topic)));
        const exp: Record<string, boolean> = {};
        uniqueTopics.forEach(t => { exp[t] = true; });
        setExpandedTopics(exp);
      }
    } catch (err) {
      console.error("Error seeding problems:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle problem status
  const handleStatusChange = async (problemId: string, currentStatus: "attempted" | "solved" | "unsolved", newStatus: "attempted" | "solved" | "unsolved") => {
    if (!userId) return;
    setIsUpdating(problemId);
    
    try {
      if (newStatus === "unsolved") {
        // Delete progress
        const { error } = await supabase
          .from("dsa_progress")
          .delete()
          .eq("user_id", userId)
          .eq("problem_id", problemId);
        
        if (error) throw error;
        
        setProgressMap(prev => {
          const updated = { ...prev };
          delete updated[problemId];
          return updated;
        });
      } else {
        // Upsert progress
        const { error } = await supabase
          .from("dsa_progress")
          .upsert({
            user_id: userId,
            problem_id: problemId,
            status: newStatus,
            solved_at: newStatus === "solved" ? new Date().toISOString() : null
          }, { onConflict: "user_id,problem_id" });
        
        if (error) throw error;
        
        setProgressMap(prev => ({
          ...prev,
          [problemId]: newStatus
        }));
      }
    } catch (err) {
      console.error("Error updating DSA progress:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Filter problems in memory
  const getFilteredProblems = () => {
    return problems.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = selectedTopic === "all" || p.topic === selectedTopic;
      const matchesDifficulty = selectedDifficulty === "all" || p.difficulty === selectedDifficulty;
      return matchesSearch && matchesTopic && matchesDifficulty;
    });
  };

  const filteredList = getFilteredProblems();
  const uniqueTopics = Array.from(new Set(problems.map(p => p.topic)));

  // Calculate statistics
  const totalCount = problems.length;
  const solvedCount = Object.values(progressMap).filter(v => v === "solved").length;
  const attemptedCount = Object.values(progressMap).filter(v => v === "attempted").length;
  const completionRate = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const difficultyStats = {
    easy: {
      total: problems.filter(p => p.difficulty === "easy").length,
      solved: problems.filter(p => p.difficulty === "easy" && progressMap[p.id] === "solved").length
    },
    medium: {
      total: problems.filter(p => p.difficulty === "medium").length,
      solved: problems.filter(p => p.difficulty === "medium" && progressMap[p.id] === "solved").length
    },
    hard: {
      total: problems.filter(p => p.difficulty === "hard").length,
      solved: problems.filter(p => p.difficulty === "hard" && progressMap[p.id] === "solved").length
    }
  };

  const toggleTopicExpand = (topic: string) => {
    setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary flex items-center justify-center shadow-inner">
            <Trophy className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              DSA Progression
            </h2>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
              Solve batch curated sheets, track status, and compete on the leaderboard.
            </p>
          </div>
        </div>

        {problems.length === 0 && !isLoading && (
          <button
            onClick={handleSeedProblems}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-900 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Seed Cohort Sheet</span>
          </button>
        )}
      </div>

      {/* Progress Metrics Widget */}
      {problems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Progress circular */}
          <div className="premium-card rounded-2xl p-5 border border-zinc-150/80 dark:border-zinc-800/80 flex items-center gap-5 md:col-span-2">
            <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
              <svg className="absolute h-full w-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-zinc-100 dark:stroke-zinc-850"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-primary transition-all duration-700 ease-out"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - completionRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <span className="text-base font-black text-zinc-900 dark:text-white">
                  {completionRate}%
                </span>
                <p className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">Solved</p>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sheet Progress</h3>
              <p className="text-lg font-black text-zinc-900 dark:text-white">
                {solvedCount} of {totalCount} Problems
              </p>
              <p className="text-[10px] text-zinc-500 font-medium">
                {attemptedCount} currently in attempted status. Keep it up!
              </p>
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="premium-card rounded-2xl p-5 border border-zinc-150/80 dark:border-zinc-800/80 md:col-span-2 flex flex-col justify-center space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Difficulty Splits</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] font-bold text-green-500 uppercase">Easy</p>
                <p className="text-base font-black text-zinc-900 dark:text-white mt-1">
                  {difficultyStats.easy.solved}/{difficultyStats.easy.total}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-500 uppercase">Medium</p>
                <p className="text-base font-black text-zinc-900 dark:text-white mt-1">
                  {difficultyStats.medium.solved}/{difficultyStats.medium.total}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase">Hard</p>
                <p className="text-base font-black text-zinc-900 dark:text-white mt-1">
                  {difficultyStats.hard.solved}/{difficultyStats.hard.total}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Options */}
      {problems.length > 0 && (
        <div className="premium-card rounded-2xl p-4 border border-zinc-150/80 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem title..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all font-semibold"
            />
          </div>

          {/* Topic Select */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
          >
            <option value="all">All Topics</option>
            {uniqueTopics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          {/* Difficulty Select */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      )}

      {/* Main List */}
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        </div>
      ) : problems.length === 0 ? (
        <div className="premium-card rounded-3xl p-12 text-center border border-zinc-150/80 dark:border-zinc-800/80">
          <BookOpen className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No DSA sheets uploaded yet
          </h3>
          <p className="text-xs text-zinc-400 font-semibold max-w-sm mx-auto mb-4">
            Click seed button below to populate the sheet with essential problems.
          </p>
          <button
            onClick={handleSeedProblems}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-900 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Seed Sample Problem Set</span>
          </button>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="premium-card rounded-3xl p-10 text-center border border-zinc-150/80 dark:border-zinc-800/80 text-xs text-zinc-450 font-bold">
          No problems match your filter query.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Grouped by Topic */}
          {uniqueTopics
            .filter(t => selectedTopic === "all" || t === selectedTopic)
            .map((topic) => {
              const topicProblems = filteredList.filter(p => p.topic === topic);
              if (topicProblems.length === 0) return null;
              
              const isExpanded = expandedTopics[topic] ?? true;

              return (
                <div key={topic} className="premium-card rounded-2xl border border-zinc-150/80 dark:border-zinc-800/80 overflow-hidden">
                  {/* Topic Group Header */}
                  <button
                    onClick={() => toggleTopicExpand(topic)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-850/60 font-black text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wide cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <span>{topic} ({topicProblems.length})</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {/* Problems Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 bg-zinc-50/10">
                            <th className="py-2.5 px-5">Status</th>
                            <th>Problem</th>
                            <th>Difficulty</th>
                            <th>Week</th>
                            <th>Platform</th>
                            <th className="text-right px-5">Solve</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850">
                          {topicProblems.map((p) => {
                            const status = (progressMap[p.id] || "unsolved") as "attempted" | "solved" | "unsolved";
                            
                            // Color mapping for difficulty
                            const diffColor = p.difficulty === "easy" 
                              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                              : p.difficulty === "medium"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                              : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400";

                            return (
                              <tr key={p.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors">
                                {/* Checkbox / Status toggle */}
                                <td className="py-3 px-5">
                                  {isUpdating === p.id ? (
                                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handleStatusChange(
                                          p.id, 
                                          status, 
                                          status === "solved" ? "unsolved" : "solved"
                                        )}
                                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                                          status === "solved"
                                            ? "bg-green-500 border-green-500 text-white shadow-sm"
                                            : "border-zinc-350 bg-white hover:border-primary dark:bg-zinc-900 dark:border-zinc-700"
                                        }`}
                                      >
                                        {status === "solved" && <CheckCircle2 className="h-3.5 w-3.5" />}
                                      </button>
                                      
                                      {status === "unsolved" && (
                                        <button
                                          onClick={() => handleStatusChange(p.id, status, "attempted")}
                                          className="text-[9px] font-bold text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                                        >
                                          Mark Attempted
                                        </button>
                                      )}
                                      
                                      {status === "attempted" && (
                                        <div className="flex items-center gap-1">
                                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                          <span className="text-[9px] font-bold text-amber-500">Attempted</span>
                                          <button
                                            onClick={() => handleStatusChange(p.id, status, "unsolved")}
                                            className="text-[8px] font-medium text-zinc-400 hover:text-red-500 cursor-pointer ml-1"
                                          >
                                            (Clear)
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Problem Title & Weekly Challenge Badge */}
                                <td className="font-extrabold text-zinc-900 dark:text-zinc-150">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span>{p.title}</span>
                                    {p.is_weekly && (
                                      <span className="bg-primary-50 text-primary dark:bg-primary-950/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                        <Flame className="h-3 w-3 fill-primary-400" />
                                        Weekly
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Difficulty Tag */}
                                <td>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${diffColor}`}>
                                    {p.difficulty}
                                  </span>
                                </td>

                                {/* Week */}
                                <td className="font-semibold text-zinc-400">
                                  Week {p.week_number}
                                </td>

                                {/* Platform */}
                                <td>
                                  <span className="text-[10px] font-bold text-zinc-550 uppercase dark:text-zinc-400">
                                    {p.platform}
                                  </span>
                                </td>

                                {/* Platform Link */}
                                <td className="text-right px-5">
                                  <a
                                    href={p.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      if (status === "unsolved") {
                                        handleStatusChange(p.id, "unsolved", "attempted");
                                      }
                                    }}
                                    className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-zinc-200 hover:border-primary text-zinc-400 hover:text-primary transition-all dark:border-zinc-800"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
