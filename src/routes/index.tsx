import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Activity,
  Bot,
  ChevronRight,
  CircleDot,
  Cpu,
  Database,
  Filter,
  Layers,
  Mic,
  MicOff,
  Play,
  Plus,
  Radio,
  Search,
  Settings,
  Terminal,
  Upload,
  Video,
  Webhook,
  Zap,
} from "lucide-react";

import thumbGrasp from "@/assets/thumb-grasp.jpg";
import thumbQuadruped from "@/assets/thumb-quadruped.jpg";
import thumbNav from "@/assets/thumb-nav.jpg";
import thumbHumanoid from "@/assets/thumb-humanoid.jpg";
import thumbCrosswalk from "@/assets/thumb-crosswalk.jpg";
import thumbJaywalk from "@/assets/thumb-jaywalk.jpg";
import thumbBiking from "@/assets/thumb-biking.jpg";
import clipCrosswalkAsset from "@/assets/clip-crosswalk.mp4.asset.json";
import clipJaywalkAsset from "@/assets/clip-jaywalk.mp4.asset.json";
import clipBikingAsset from "@/assets/clip-biking.mp4.asset.json";

const clipCrosswalkVideo = clipCrosswalkAsset.url;
const clipJaywalkVideo = clipJaywalkAsset.url;
const clipBikingVideo = clipBikingAsset.url;

export const Route = createFileRoute("/")({
  component: Index,
});

type Clip = {
  id: string;
  title: string;
  robot: string;
  session: string;
  duration: string;
  fps: number;
  size: string;
  captured: string;
  tags: string[];
  thumb: string;
  video?: string;
  status: "indexed" | "embedding" | "queued";
};

const CLIPS: Clip[] = [
  {
    id: "clip_01H8Z9",
    title: "Bin-pick / cluttered blocks / arm-04",
    robot: "arm-04",
    session: "sess_2041",
    duration: "02:14",
    fps: 60,
    size: "412 MB",
    captured: "2h ago",
    tags: ["grasp", "manipulation", "bin-pick"],
    thumb: thumbGrasp,
    status: "indexed",
  },
  {
    id: "clip_01H8YB",
    title: "Warehouse traversal — narrow aisle",
    robot: "spot-02",
    session: "sess_2038",
    duration: "07:41",
    fps: 30,
    size: "1.2 GB",
    captured: "5h ago",
    tags: ["locomotion", "quadruped", "navigation"],
    thumb: thumbQuadruped,
    status: "indexed",
  },
  {
    id: "clip_01H8XR",
    title: "AMR corridor run w/ lidar overlay",
    robot: "amr-11",
    session: "sess_2035",
    duration: "04:02",
    fps: 30,
    size: "684 MB",
    captured: "yesterday",
    tags: ["slam", "lidar", "indoor"],
    thumb: thumbNav,
    status: "embedding",
  },
  {
    id: "clip_01H8W2",
    title: "Bimanual tabletop rearrangement",
    robot: "humanoid-01",
    session: "sess_2029",
    duration: "03:27",
    fps: 60,
    size: "922 MB",
    captured: "2d ago",
    tags: ["bimanual", "manipulation", "policy-v3"],
    thumb: thumbHumanoid,
    status: "indexed",
  },
  {
    id: "clip_01H8V7",
    title: "Kids crossing at signalized intersection",
    robot: "av-07",
    session: "sess_2027",
    duration: "05:18",
    fps: 30,
    size: "1.4 GB",
    captured: "3d ago",
    tags: ["pedestrian", "crosswalk", "urban", "vru"],
    thumb: thumbCrosswalk,
    video: clipCrosswalkVideo,
    status: "indexed",
  },
  {
    id: "clip_01H8U3",
    title: "Children jaywalking — mid-block, suburban",
    robot: "av-07",
    session: "sess_2024",
    duration: "02:52",
    fps: 30,
    size: "812 MB",
    captured: "3d ago",
    tags: ["pedestrian", "jaywalk", "vru", "edge-case"],
    thumb: thumbJaywalk,
    video: clipJaywalkVideo,
    status: "indexed",
  },
  {
    id: "clip_01H8T1",
    title: "Child cyclist crossing lane — residential",
    robot: "av-09",
    session: "sess_2019",
    duration: "04:06",
    fps: 30,
    size: "1.1 GB",
    captured: "4d ago",
    tags: ["cyclist", "vru", "residential", "yield"],
    thumb: thumbBiking,
    video: clipBikingVideo,
    status: "embedding",
  },
];

type Match = {
  clipId: string;
  timestamp: string;
  score: number;
  snippet: string;
};

const MATCHES: Match[] = [
  {
    clipId: "clip_01H8V7",
    timestamp: "01:23",
    score: 0.96,
    snippet: "Four children step off curb into crosswalk on green walk signal; robot yields.",
  },
  {
    clipId: "clip_01H8U3",
    timestamp: "00:38",
    score: 0.92,
    snippet: "Three kids dart across mid-block, no crosswalk — emergency brake engaged.",
  },
  {
    clipId: "clip_01H8T1",
    timestamp: "02:11",
    score: 0.9,
    snippet: "Helmeted child cyclist crosses lane from right; predicted trajectory intersects path.",
  },
  {
    clipId: "clip_01H8Z9",
    timestamp: "00:47",
    score: 0.94,
    snippet: "Gripper closes on red block after two failed approach attempts.",
  },
  {
    clipId: "clip_01H8W2",
    timestamp: "01:12",
    score: 0.89,
    snippet: "Left arm regrasps object after slip detected by tactile sensor.",
  },
  {
    clipId: "clip_01H8YB",
    timestamp: "03:58",
    score: 0.81,
    snippet: "Quadruped pauses, replans path around unexpected obstacle.",
  },
];

const NAV = [
  { label: "Library", icon: Video, active: true, count: 1247 },
  { label: "Ingest", icon: Upload },
  { label: "Search", icon: Search },
  { label: "Datasets", icon: Layers },
  { label: "Robots", icon: Bot, count: 12 },
  { label: "Webhooks", icon: Webhook },
  { label: "API keys", icon: Terminal },
  { label: "Settings", icon: Settings },
];

function Index() {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [selected, setSelected] = useState<string | null>("clip_01H8Z9");
  const inputRef = useRef<HTMLInputElement>(null);

  const activeClip = useMemo(
    () => CLIPS.find((c) => c.id === selected) ?? CLIPS[0],
    [selected],
  );

  const showResults = query.trim().length > 0;

  return (
    <div className="min-h-screen text-foreground">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <TopBar />
          <div className="mx-auto max-w-[1400px] px-8 py-8 space-y-8">
            <Header />
            <SearchBar
              value={query}
              onChange={setQuery}
              listening={listening}
              onToggleListen={() => {
                setListening((v) => !v);
                inputRef.current?.focus();
              }}
              inputRef={inputRef}
            />

            {showResults ? (
              <ResultsPanel query={query} />
            ) : (
              <>
                <StatsRow />
                <div className="grid grid-cols-12 gap-6">
                  <section className="col-span-12 xl:col-span-8 space-y-4">
                    <SectionHeader
                      eyebrow="library"
                      title="Recent captures"
                      hint="1,247 clips · 3.4 TB indexed"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {CLIPS.map((c) => (
                        <ClipCard
                          key={c.id}
                          clip={c}
                          selected={selected === c.id}
                          onSelect={() => setSelected(c.id)}
                        />
                      ))}
                    </div>
                  </section>
                  <aside className="col-span-12 xl:col-span-4 space-y-6">
                    <IngestPanel />
                    <ClipDetail clip={activeClip} />
                    <IntegrationsPanel />
                  </aside>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------ Layout parts ------------------------------ */

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/70 backdrop-blur">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="relative h-7 w-7 rounded-md bg-primary/15 border border-primary/40 grid place-items-center glow-cyan">
          <Cpu className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-[13px] font-semibold tracking-tight">KINESIS</div>
          <div className="font-mono text-[10px] text-muted-foreground">v0.4.1-alpha</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        <div className="px-2 pt-2 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          workspace
        </div>
        {NAV.map((item) => (
          <button
            key={item.label}
            className={`w-full group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
            {item.count && (
              <span className="ml-auto font-mono text-[10px] text-muted-foreground group-hover:text-foreground">
                {item.count.toLocaleString()}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <div className="panel rounded-md p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
              <span className="relative rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              cluster
            </span>
          </div>
          <div className="font-mono text-[11px] text-foreground/90">
            us-west-2 · healthy
          </div>
          <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-muted-foreground">
            <div><span className="text-primary">12</span> gpu</div>
            <div><span className="text-primary">3</span> nodes</div>
            <div><span className="text-primary">98%</span> up</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-6 lg:px-8 bg-background/40 backdrop-blur">
      <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
        <span className="text-foreground">workspace</span>
        <ChevronRight className="h-3 w-3" />
        <span>robotics-lab</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-primary">library</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill icon={Radio} label="ingest" value="live" />
        <StatusPill icon={Activity} label="index" value="2 pending" />
        <button className="ml-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-3.5 w-3.5" />
          New capture
        </button>
      </div>
    </div>
  );
}

function StatusPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Radio;
  label: string;
  value: string;
}) {
  return (
    <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-card/40 font-mono text-[10px]">
      <Icon className="h-3 w-3 text-primary" />
      <span className="text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function Header() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-mono text-[11px] text-primary">
        <CircleDot className="h-3 w-3" />
        <span className="uppercase tracking-[0.2em]">video ops · v0.4</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
        Every robot session,{" "}
        <span className="text-primary text-glow">searchable by meaning</span>.
      </h1>
      <p className="text-muted-foreground max-w-2xl text-[15px] leading-relaxed">
        Push footage from any robot over REST or S3-compatible storage. Ask for what happened in plain
        English — or by voice — and jump to the exact frame.
      </p>
    </div>
  );
}

/* ------------------------------ Search ------------------------------ */

function SearchBar({
  value,
  onChange,
  listening,
  onToggleListen,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  listening: boolean;
  onToggleListen: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const suggestions = [
    "kids crossing at a green light",
    "child jaywalking mid-block",
    "child on a bike crossing the lane",
    "clips where the gripper slipped",
    "quadruped avoiding an obstacle",
  ];

  return (
    <div className="space-y-3">
      <div className="panel rounded-xl p-2 flex items-center gap-2 glow-cyan">
        <div className="pl-3 pr-1 text-primary">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Ask: "show me every failed grasp on arm-04 after the last policy push"'
          className="flex-1 bg-transparent outline-none py-3 text-[15px] placeholder:text-muted-foreground/70"
        />
        <button
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          type="button"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
        </button>
        <button
          onClick={onToggleListen}
          type="button"
          className={`relative inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-medium transition-colors ${
            listening
              ? "bg-primary text-primary-foreground"
              : "border border-border text-foreground hover:border-primary/40"
          }`}
        >
          {listening ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          {listening ? "Listening…" : "Voice"}
          {listening && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          )}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Zap className="h-3.5 w-3.5" />
          Search
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          try
        </span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className="px-2.5 py-1 rounded-full border border-border bg-card/40 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Results ------------------------------ */

function ResultsPanel({ query }: { query: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            semantic results · 47ms
          </div>
          <h2 className="mt-1 text-xl font-semibold">
            {MATCHES.length} moments matched{" "}
            <span className="text-muted-foreground font-normal">for</span>{" "}
            <span className="text-primary">"{query}"</span>
          </h2>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          model: <span className="text-foreground">video-clip-v2</span> · top-k 3
        </div>
      </div>
      <div className="space-y-3">
        {MATCHES.map((m) => {
          const clip = CLIPS.find((c) => c.id === m.clipId)!;
          return (
            <div
              key={m.clipId + m.timestamp}
              className="panel rounded-lg p-3 flex gap-4 hover:border-primary/40 transition-colors group"
            >
              <div className="relative w-48 aspect-video rounded-md overflow-hidden bg-muted shrink-0">
                <ClipMedia clip={clip} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/80 text-primary">
                  ▸ {m.timestamp}
                </div>
                <button className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                </button>
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <span className="text-primary">{clip.id}</span>
                  <span>·</span>
                  <span>{clip.robot}</span>
                  <span>·</span>
                  <span>{clip.session}</span>
                </div>
                <div className="mt-1 text-sm font-medium">{clip.title}</div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {m.snippet}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {clip.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end justify-between py-1">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  match
                </div>
                <div className="font-mono text-2xl text-primary text-glow leading-none">
                  {m.score.toFixed(2)}
                </div>
                <button className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
                  copy uri →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Stats ------------------------------ */

function StatsRow() {
  const stats = [
    { label: "clips indexed", value: "1,247", delta: "+38 today", icon: Video },
    { label: "hours of footage", value: "412h", delta: "+2.1h today", icon: Database },
    { label: "avg query latency", value: "47ms", delta: "p95 · 112ms", icon: Zap },
    { label: "active robots", value: "12", delta: "3 streaming now", icon: Bot },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="panel rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </span>
            <s.icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight">
            {s.value}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {s.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Section header ------------------------------ */

function SectionHeader({
  eyebrow,
  title,
  hint,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {eyebrow}
        </div>
        <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      </div>
      {hint && (
        <div className="font-mono text-[11px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

/* ------------------------------ Clip card ------------------------------ */

function ClipCard({
  clip,
  selected,
  onSelect,
}: {
  clip: Clip;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left panel rounded-lg overflow-hidden transition-all group ${
        selected ? "border-primary/60 glow-cyan" : "hover:border-primary/30"
      }`}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <ClipMedia
          clip={clip}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <StatusDot status={clip.status} />
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/80 text-muted-foreground uppercase tracking-widest">
            {clip.status}
          </span>
        </div>
        <div className="absolute top-2 right-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/80 text-primary">
          {clip.duration}
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
          <div className="font-mono text-[10px] text-muted-foreground">
            <span className="text-primary">{clip.robot}</span> · {clip.fps}fps · {clip.size}
          </div>
        </div>
      </div>
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-primary">{clip.id}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{clip.captured}</span>
        </div>
        <div className="text-sm font-medium leading-snug">{clip.title}</div>
        <div className="flex flex-wrap gap-1.5">
          {clip.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

function StatusDot({ status }: { status: Clip["status"] }) {
  return _StatusDot({ status });
}
function _StatusDot({ status }: { status: Clip["status"] }) {
  const color =
    status === "indexed"
      ? "bg-primary"
      : status === "embedding"
        ? "bg-chart-3"
        : "bg-muted-foreground";
  return (
    <span className="relative flex h-2 w-2">
      {status !== "queued" && (
        <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-60`} />
      )}
      <span className={`relative rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

/* ------------------------------ Ingest panel ------------------------------ */

function IngestPanel() {
  return (
    <div className="panel rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            ingest
          </div>
          <h3 className="mt-1 text-base font-semibold">Push a session</h3>
        </div>
        <button className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
          docs →
        </button>
      </div>
      <div className="rounded-md border border-dashed border-border p-5 text-center hover:border-primary/50 transition-colors cursor-pointer">
        <Upload className="h-6 w-6 mx-auto text-primary" />
        <div className="mt-2 text-sm">Drop .mp4 / .mov / .mkv</div>
        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
          or paste s3:// uri · up to 20 GB
        </div>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          curl
        </div>
        <pre className="font-mono text-[11px] leading-relaxed rounded-md bg-background/60 border border-border p-3 overflow-x-auto text-foreground/90">
{`curl -X POST https://api.kinesis.dev/v1/clips \\
  -H "Authorization: Bearer $KINESIS_KEY" \\
  -F "robot=arm-04" \\
  -F "session=sess_2041" \\
  -F "file=@run.mp4"`}
        </pre>
      </div>
    </div>
  );
}

/* ------------------------------ Clip detail ------------------------------ */

function ClipDetail({ clip }: { clip: Clip }) {
  return (
    <div className="panel rounded-lg overflow-hidden">
      <div className="relative aspect-video bg-muted">
        <ClipMedia clip={clip} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute inset-0 grid place-items-center">
          <button className="h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center glow-cyan">
            <Play className="h-5 w-5 fill-current" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/50">
          <div className="h-full w-[34%] bg-primary" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-primary">{clip.id}</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            captured {clip.captured}
          </span>
        </div>
        <div className="text-sm font-medium">{clip.title}</div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
          <MetaCell label="robot" value={clip.robot} />
          <MetaCell label="session" value={clip.session} />
          <MetaCell label="duration" value={clip.duration} />
          <MetaCell label="fps" value={String(clip.fps)} />
          <MetaCell label="size" value={clip.size} />
          <MetaCell label="status" value={clip.status} accent />
        </div>
      </div>
    </div>
  );
}

function MetaCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded border border-border p-2">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={accent ? "text-primary" : "text-foreground"}>{value}</div>
    </div>
  );
}

/* ------------------------------ Integrations ------------------------------ */

function IntegrationsPanel() {
  const events = [
    { event: "clip.indexed", target: "https://ci.acme.dev/hooks/kinesis", status: "200" },
    { event: "clip.uploaded", target: "slack · #robotics-runs", status: "200" },
    { event: "search.match", target: "notion · Failure log", status: "200" },
  ];
  return (
    <div className="panel rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          webhooks
        </div>
        <button className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
          + add
        </button>
      </div>
      <div className="space-y-1.5">
        {events.map((e) => (
          <div
            key={e.event}
            className="flex items-center gap-2 font-mono text-[11px] py-1.5 px-2 rounded border border-border/60 bg-background/40"
          >
            <span className="text-primary">{e.event}</span>
            <span className="text-muted-foreground truncate flex-1">→ {e.target}</span>
            <span className="text-primary/80">{e.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
