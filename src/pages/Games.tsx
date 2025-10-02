import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { deleteGameSession, GameSession, getGameSessions, saveGameSession } from "@/lib/storage";
import { Gamepad2, Link2, Plus, Trash2, ExternalLink, Trophy, Share2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_SUGGESTED: { title: string; url: string }[] = [
	{ title: "PaperGames (Connect 4, Tic Tac Toe, etc.)", url: "https://papergames.io/" },
	{ title: "Tanggle (Co-op puzzles)", url: "https://tanggle.io/" },
	{ title: "Skribbl.io (Draw & Guess)", url: "https://skribbl.io/" },
];

function inferGameKey(url: string): GameSession['gameKey'] {
	try {
		const u = new URL(url);
		if (u.hostname.includes('papergames.io')) return 'papergames';
		if (u.hostname.includes('tanggle.io')) return 'tanggle';
		if (u.hostname.includes('skribbl.io')) return 'skribbl';
		return 'other';
	} catch {
		return 'other';
	}
}

async function shareOrCopy(link: string, title?: string) {
	try {
		// Removed navigator.share to block native share dialogs/redirects
		await navigator.clipboard.writeText(link);
		toast.success('Room link copied to clipboard');
	} catch (e) {
		await navigator.clipboard.writeText(link);
		toast.success('Room link copied to clipboard');
	}
}

function formatDateTimeLocal(d: Date) {
	const pad = (n: number) => String(n).padStart(2, '0');
	const yyyy = d.getFullYear();
	const mm = pad(d.getMonth() + 1);
	const dd = pad(d.getDate());
	const hh = pad(d.getHours());
	const mi = pad(d.getMinutes());
	return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

const Games = () => {
	const { couple, currentUser } = useCoupleContext();
	const coupleId = couple?.id || "";

	const [sessions, setSessions] = useState<GameSession[]>([]);
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [roomLink, setRoomLink] = useState("");
	const [winnerId, setWinnerId] = useState<string>("");
	const [playedAtInput, setPlayedAtInput] = useState<string>(formatDateTimeLocal(new Date()));
	const [activeUrl, setActiveUrl] = useState<string>("");
	const [customGameUrl, setCustomGameUrl] = useState<string>(""); // New state for custom URL input
	const [iframeLoading, setIframeLoading] = useState(false); // New state for iframe loading

	// table controls
	const [pageSize, setPageSize] = useState<number>(10);
	const [page, setPage] = useState<number>(1);
	const [dateFilter, setDateFilter] = useState<string>(""); // yyyy-mm-dd

	useEffect(() => {
		if (!coupleId) return;
		getGameSessions(coupleId).then(setSessions);
	}, [coupleId]);

	useEffect(() => {
		if (currentUser) setWinnerId(currentUser.id);
	}, [currentUser]);

	const canSave = useMemo(() => !!coupleId && !!title.trim() && !!url.trim(), [coupleId, title, url]);

	const participants = useMemo(() => {
		const ids: string[] = [];
		if (couple?.memberA?.id) ids.push(couple.memberA.id);
		if (couple?.memberB?.id) ids.push(couple.memberB.id);
		return ids.filter(Boolean);
	}, [couple]);

	const handleAddSession = async () => {
		if (!canSave) return;
		const playedISO = playedAtInput ? new Date(playedAtInput).toISOString() : new Date().toISOString();
		const newSession: GameSession = {
			id: crypto.randomUUID(),
			coupleId,
			title: title.trim(),
			url: url.trim(),
			roomLink: roomLink.trim() || undefined,
			playedAt: playedISO,
			gameKey: inferGameKey(url.trim()),
			winnerId: winnerId || undefined,
			participants,
		};
		await saveGameSession(newSession);
		const updated = await getGameSessions(coupleId);
		setSessions(updated);
		setActiveUrl(newSession.url);
		setTitle("");
		setUrl("");
		setRoomLink("");
		setPlayedAtInput(formatDateTimeLocal(new Date()));
	};

	const handleDelete = async (id: string) => {
		await deleteGameSession(id);
		const updated = await getGameSessions(coupleId);
		setSessions(updated);
	};

	const openSuggested = (s: { title: string; url: string }) => {
		setTitle(s.title);
		setUrl(s.url);
		setActiveUrl(s.url);
	};

	const handleOpenCustomGame = () => {
		if (!customGameUrl.trim()) return;
		setActiveUrl(customGameUrl.trim());
		setCustomGameUrl(""); // Clear the input field
	};

	// Set iframe loading state when URL changes
	useEffect(() => {
		if (activeUrl) {
			setIframeLoading(true);
		}
	}, [activeUrl]);

	const stats = useMemo(() => {
		const byGame: Record<string, number> = {};
		const byPlayer: Record<string, number> = {};
		sessions.forEach((s) => {
			const key = s.gameKey || 'other';
			byGame[key] = (byGame[key] || 0) + 1;
			if (s.winnerId) byPlayer[s.winnerId] = (byPlayer[s.winnerId] || 0) + 1;
		});
		return { byGame, byPlayer, total: sessions.length };
	}, [sessions]);

	const nameForUser = (userId?: string) => {
		if (!userId) return '—';
		if (userId === couple?.memberA?.id) return couple?.memberA?.name || 'Partner A';
		if (userId === couple?.memberB?.id) return couple?.memberB?.name || 'Partner B';
		return 'Guest';
	};

	// table filtering + pagination
	const filteredSessions = useMemo(() => {
		if (!dateFilter) return sessions;
		return sessions.filter((s) => new Date(s.playedAt).toISOString().slice(0, 10) === dateFilter);
	}, [sessions, dateFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, filteredSessions.length);
	const pageRows = filteredSessions.slice(startIndex, endIndex);

	useEffect(() => {
		// reset to page 1 when filters/pageSize change
		setPage(1);
	}, [dateFilter, pageSize]);

  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-6">
					<div className="flex justify-center mb-3">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <Gamepad2 className="h-8 w-8 text-white animate-heartbeat" />
            </div>
          </div>
					<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-1">Play Together</h1>
					<p className="text-base text-muted-foreground max-w-2xl mx-auto">
						Suggested games | Add a game | Embedded window | Games table
          </p>
        </div>

				{/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center shadow-gentle">
            <CardContent className="pt-4">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
							<div className="text-lg font-bold text-foreground">{stats.total}</div>
							<p className="text-xs text-muted-foreground">Total games</p>
            </CardContent>
          </Card>
					<Card className="text-center shadow-gentle"><CardContent className="pt-4"><div className="text-lg font-bold">{stats.byGame.papergames || 0}</div><p className="text-xs text-muted-foreground">PaperGames</p></CardContent></Card>
					<Card className="text-center shadow-gentle"><CardContent className="pt-4"><div className="text-lg font-bold">{stats.byGame.tanggle || 0}</div><p className="text-xs text-muted-foreground">Tanggle</p></CardContent></Card>
					<Card className="text-center shadow-gentle"><CardContent className="pt-4"><div className="text-lg font-bold">{stats.byGame.skribbl || 0}</div><p className="text-xs text-muted-foreground">Skribbl</p></CardContent></Card>
				</div>

				{/* Row 1: Suggested | Add a game (include date) */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<Card className="shadow-gentle">
						<CardHeader>
							<CardTitle>Suggested games</CardTitle>
							<CardDescription>Click to auto-fill URL and open (embedding depends on site policy)</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-2">
								{DEFAULT_SUGGESTED.map((s) => (
									<Button key={s.url} variant="secondary" className="justify-between" onClick={() => openSuggested(s)}>
										<span className="truncate">{s.title}</span>
										<span className="text-xs text-muted-foreground truncate">{s.url}</span>
									</Button>
								))}
							</div>
							<div className="mt-4 space-y-2">
								<label className="text-sm text-muted-foreground">Or enter a custom URL</label>
								<div className="flex gap-2">
									<Input
										value={customGameUrl}
										onChange={(e) => setCustomGameUrl(e.target.value)}
										placeholder="https://your-favorite-game.com/"
									/>
									<Button onClick={handleOpenCustomGame} disabled={!customGameUrl.trim()} className="gap-2">
										<Link2 className="h-4 w-4" />
										Open
									</Button>
								</div>
							</div>
            </CardContent>
          </Card>

					<Card className="shadow-gentle">
						<CardHeader>
							<CardTitle>Add a game</CardTitle>
							<CardDescription>Provide title, URL, date, optional room, and winner</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-1">
								<label className="text-sm text-muted-foreground">Title</label>
								<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Connect 4 showdown" />
							</div>
							<div className="space-y-1">
								<label className="text-sm text-muted-foreground">Game URL</label>
								<Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://papergames.io/…" />
							</div>
							<div className="space-y-1">
								<label className="text-sm text-muted-foreground">Date & time</label>
								<Input type="datetime-local" value={playedAtInput} onChange={(e) => setPlayedAtInput(e.target.value)} />
							</div>
							<div className="space-y-1">
								<label className="text-sm text-muted-foreground">Room Link (optional)</label>
								<div className="flex gap-2">
									<Input value={roomLink} onChange={(e) => setRoomLink(e.target.value)} placeholder="Paste room/invite link" />
									{roomLink && (
										<>
											<Button type="button" variant="outline" onClick={() => shareOrCopy(roomLink, title)} className="gap-2">
												<Share2 className="h-4 w-4" />
												Share
											</Button>
											<Button type="button" variant="secondary" onClick={() => { navigator.clipboard.writeText(roomLink); toast.success('Copied'); }} className="gap-2">
												<Copy className="h-4 w-4" />
												Copy
											</Button>
										</>
									)}
								</div>
							</div>
							<div className="space-y-1">
								<label className="text-sm text-muted-foreground">Winner (tap a name)</label>
								<div className="flex gap-2">
									<Button type="button" variant={winnerId === couple?.memberA?.id ? "default" : "outline"} onClick={() => setWinnerId(couple?.memberA?.id || "")}>
										{nameForUser(couple?.memberA?.id)}
									</Button>
									<Button type="button" variant={winnerId === couple?.memberB?.id ? "default" : "outline"} onClick={() => setWinnerId(couple?.memberB?.id || "")}>
										{nameForUser(couple?.memberB?.id)}
									</Button>
									<Button type="button" variant={winnerId ? "outline" : "default"} onClick={() => setWinnerId("")}>Unspecified</Button>
								</div>
							</div>
							<div className="flex gap-2">
								<Button onClick={handleAddSession} disabled={!canSave} className="gap-2">
									<Plus className="h-4 w-4" />
									Add & Open
								</Button>
								{url && (
									<Button variant="outline" onClick={() => setActiveUrl(url)} className="gap-2">
										<Link2 className="h-4 w-4" />
										Open Only
									</Button>
								)}
							</div>
            </CardContent>
          </Card>
        </div>

				{/* Row 2: Embedded window (large) */}
				<Card className="shadow-romantic mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">Embedded window</CardTitle>
						<CardDescription>Some sites may block embedding; use room link to open in a new tab</CardDescription>
              </CardHeader>
              <CardContent>
						<div className="aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden border relative flex items-center justify-center">
							{iframeLoading && (
								<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
								</div>
							)}
							{activeUrl ? (
								<iframe
									key={activeUrl} // Key to force remount on URL change
									title="Embedded Game"
									src={activeUrl}
									className="w-full h-full"
									allow="fullscreen; autoplay; clipboard-read; clipboard-write"
									loading="lazy" // Lazy load iframe
									onLoad={() => setIframeLoading(false)} // Turn off loading when iframe content loads
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-muted-foreground">
									Select or add a game to start
								</div>
							)}
						</div>
              </CardContent>
            </Card>

				{/* Row 3: Games table (page size + date filter) */}
				<Card className="shadow-gentle">
					<CardHeader>
						<CardTitle>Games table</CardTitle>
						<CardDescription>Control entries per page or search by date</CardDescription>
              </CardHeader>
              <CardContent>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Show</span>
								<Select value={String(pageSize)} onValueChange={(v) => setPageSize(parseInt(v))}>
									<SelectTrigger className="w-[100px]"><SelectValue placeholder="10" /></SelectTrigger>
									<SelectContent>
										<SelectItem value="10">10</SelectItem>
										<SelectItem value="25">25</SelectItem>
										<SelectItem value="50">50</SelectItem>
										<SelectItem value="100">100</SelectItem>
									</SelectContent>
								</Select>
								<span className="text-sm text-muted-foreground">entries</span>
							</div>
							<div className="flex items-center gap-2">
								<label className="text-sm text-muted-foreground">Date</label>
								<Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
								{dateFilter && (
									<Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>Clear</Button>
								)}
							</div>
						</div>

						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Game</TableHead>
										<TableHead>Room</TableHead>
										<TableHead>When</TableHead>
										<TableHead>Winner</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pageRows.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="text-center text-muted-foreground">No sessions found</TableCell>
										</TableRow>
									)}
									{pageRows.map((s) => (
										<TableRow key={s.id} className="hover:bg-accent/40">
											<TableCell className="max-w-[220px]">
												<div className="font-medium truncate">{s.title}</div>
												<div className="text-xs text-muted-foreground truncate">{s.url}</div>
											</TableCell>
											<TableCell className="whitespace-nowrap text-sm text-muted-foreground">{s.gameKey || 'other'}</TableCell>
											<TableCell className="max-w-[280px]">
												{s.roomLink ? (
													<div className="flex items-center gap-2">
														<Button size="sm" variant="link" onClick={() => setActiveUrl(s.roomLink!)} className="text-primary hover:underline inline-flex items-center gap-1 p-0 h-auto">
															<ExternalLink className="h-3 w-3" />
															<span className="truncate">Open room</span>
														</Button>
														<Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(s.roomLink!); toast.success('Copied room link'); }} className="gap-1">
															<Share2 className="h-3 w-3" />
															Copy Link
														</Button>
														<Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(s.roomLink!); toast.success('Copied'); }} className="gap-1">
															<Copy className="h-3 w-3" />
															Copy
														</Button>
													</div>
												) : (
													<span className="text-muted-foreground">—</span>
												)}
											</TableCell>
											<TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(s.playedAt).toLocaleString()}</TableCell>
											<TableCell className="whitespace-nowrap text-sm">{nameForUser(s.winnerId)}</TableCell>
											<TableCell className="text-right space-x-2">
												<Button size="sm" variant="outline" onClick={() => setActiveUrl(s.url)} className="gap-2">
													<Link2 className="h-4 w-4" />
													Open
												</Button>
												<Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)} className="gap-2">
													<Trash2 className="h-4 w-4" />
													Delete
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Pagination footer */}
						<div className="flex items-center justify-between mt-3 text-sm">
							<div className="text-muted-foreground">
								Showing {filteredSessions.length === 0 ? 0 : startIndex + 1}-{endIndex} of {filteredSessions.length}
							</div>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="gap-1">
									<ChevronLeft className="h-4 w-4" />
									Prev
								</Button>
								<div className="text-muted-foreground">Page {currentPage} of {totalPages}</div>
								<Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="gap-1">
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
              </CardContent>
            </Card>
      </div>
    </div>
  );
};

export default Games;