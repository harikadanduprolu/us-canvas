import { useEffect, useMemo, useRef, useState } from 'react';
import { useCoupleContext } from '@/contexts/CoupleContext';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, X, Send, Smile, Paperclip } from 'lucide-react';
import { ChatMessage, getLocalMessages, saveLocalMessage } from '@/lib/storage';
import { toast } from 'sonner';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Common emojis for quick access
const QUICK_EMOJIS = ['❤️', '😍', '😘', '🥰', '😊', '😂', '🤗', '😉', '💕', '💖', '🌹', '💋', '🔥', '✨', '🎉', '👍', '👏', '🙌'];

export default function ChatWidget() {
	const { couple, currentUser, isLoading } = useCoupleContext();
	const coupleId = couple?.id || '';
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [text, setText] = useState('');
	const [showEmojis, setShowEmojis] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const channelRef = useRef<any>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const hasBeenManuallyClosedRef = useRef(false); // Track if user manually closed chat
	const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
	const audioRef = useRef(new Audio('/sounds/notification.mp3'));

	// Only log when data changes
	useEffect(() => {
		if (couple && currentUser) {
			console.log('ChatWidget data updated:', { 
				coupleId, 
				currentUser: currentUser?.name, 
				couple: couple?.name,
				memberA: couple?.memberA?.name,
				memberB: couple?.memberB?.name
			});
		}
	}, [couple, currentUser, coupleId]);

	// Auto-open chat when couple is loaded and not currently open, only once after initial load
	/*
	useEffect(() => {
		if (couple && !isLoading && !hasBeenManuallyClosedRef.current && !open) {
			console.log('ChatWidget: Couple detected and loaded, opening chat automatically.');
			setOpen(true);
		}
	}, [couple, isLoading]); 
	*/

	const nowIso = () => new Date().toISOString();
	const cutoffIso = useMemo(() => new Date(Date.now() - ONE_DAY_MS).toISOString(), []);

	// Convert string ID to UUID format if needed
	const toUUID = (id: string): string => {
		if (!id) return '';
		// If already UUID format, return as-is
		if (id.includes('-') && id.length === 36) return id;
		// If not UUID, try to convert or generate
		try {
			return crypto.randomUUID();
		} catch {
			return id;
		}
	};

	const loadHistory = async () => {
		if (!coupleId) {
			console.log('No coupleId, skipping loadHistory');
			return;
		}
		
		console.log('Loading chat history for coupleId:', coupleId);
		const cutoff = cutoffIso;
		
		// Always try to load from localStorage first for immediate display
		console.log('Loading from localStorage first...');
		const local = await getLocalMessages(coupleId);
		const localPruned = local.filter((m) => m.createdAt >= cutoff);
		console.log('Found local messages:', localPruned.length);
		
		if (localPruned.length > 0) {
			setMessages(localPruned);
		}
		
		// Then try Supabase if configured
		if (hasSupabaseConfig) {
			try {
				console.log('Also loading from Supabase...');
				const { data, error } = await (supabase as any)
					.from('messages')
					.select('id,couple_id,sender_id,sender_name,text,created_at')
					.eq('couple_id', coupleId)
					.gte('created_at', cutoff)
					.order('created_at', { ascending: true });
				
				if (!error && data && data.length > 0) {
					const mapped: ChatMessage[] = data.map((m: any) => ({
						id: m.id,
						coupleId: m.couple_id,
						senderId: m.sender_id,
						senderName: m.sender_name,
						text: m.text,
						createdAt: m.created_at,
					}));
					console.log('Loaded messages from Supabase:', mapped.length);
					
					// Merge with local messages, removing duplicates
					const allMessages = [...localPruned];
					mapped.forEach(supabaseMsg => {
						if (!allMessages.find(localMsg => localMsg.id === supabaseMsg.id)) {
							allMessages.push(supabaseMsg);
						}
					});
					
					// Sort by creation time
					allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
					setMessages(allMessages);
				} else if (error) {
					console.log('Supabase error, using localStorage only:', error);
					// Keep using localStorage messages
				}
			} catch (err) {
				console.error('Failed to load messages from Supabase:', err);
				// Keep using localStorage messages
			}
		}
	};

	const pruneOld = async () => {
		if (!coupleId) return;
		const cutoff = cutoffIso;
		if (hasSupabaseConfig) {
			try {
				await (supabase as any)
					.from('messages')
					.delete()
					.lt('created_at', cutoff)
					.eq('couple_id', coupleId);
			} catch {}
		} else {
			const local = await getLocalMessages(coupleId);
			const keep = local.filter((m) => m.createdAt >= cutoff);
			localStorage.setItem('lovable_chat_messages', JSON.stringify(keep));
		}
	};

	useEffect(() => {
		console.log('ChatWidget useEffect triggered, coupleId:', coupleId);
		if (coupleId) {
			setMessages([]); // Clear messages to ensure a fresh load for the new couple
			loadHistory();
			pruneOld();
		} else {
			console.log('No coupleId available, skipping message loading and clearing messages');
			setMessages([]); // Clear messages if no coupleId
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [coupleId, currentUser?.id]);

	// Also load messages when the chat opens (if needed - might be redundant after above fix)
	useEffect(() => {
		if (open && coupleId) { // Removed messages.length === 0 condition
			console.log('Chat opened, loading messages (if not already loaded by coupleId change)...');
			loadHistory();
		}
	}, [open, coupleId]);

	useEffect(() => {
		console.log('Realtime useEffect triggered. coupleId:', coupleId, 'hasSupabaseConfig:', hasSupabaseConfig, 'currentUser?.id:', currentUser?.id);
		if (!coupleId || !hasSupabaseConfig) {
			console.log('Skipping realtime subscription: coupleId or Supabase not configured.');
			return;
		}
		
		console.log(`Subscribing to chat:${coupleId}`);
		// subscribe to realtime inserts for this couple
		const channel = (supabase as any).channel(`chat:${coupleId}`)
			.on('postgres_changes', { 
				event: 'INSERT', 
				schema: 'public', 
				table: 'messages', 
				filter: `couple_id=eq.${coupleId}` 
			}, (payload: any) => {
				console.log('Realtime message received:', payload);
				const m = payload.new;
				const newMessage: ChatMessage = {
					id: m.id,
					coupleId: m.couple_id,
					senderId: m.sender_id,
					senderName: m.sender_name,
					text: m.text,
					createdAt: m.created_at,
				};
				setMessages((prev) => {
					// Avoid duplicates
					if (prev.find(msg => msg.id === newMessage.id)) {
						console.log('Duplicate message received, skipping:', newMessage.id);
						return prev;
					}
					console.log('Adding new realtime message to state:', newMessage);
					return [...prev, newMessage];
				});
				// Show notification if message is from partner
				if (m.sender_id !== currentUser?.id) {
					if (!open) {
						setHasUnreadMessages(true);
						// Play notification sound
						audioRef.current.play().catch(e => console.error("Error playing sound:", e));
					}
					if ('Notification' in window && Notification.permission === 'granted') {
						try {
							new Notification(`${m.sender_name}`, { body: m.text });
						} catch {}
					}
				}
			})
			.subscribe();
		channelRef.current = channel;
		
		const unsubscribe = () => {
			console.log(`Unsubscribing from chat:${coupleId}`);
			try { (supabase as any).removeChannel(channel); } catch (e) { console.error('Error removing channel:', e); }
		};
		
		return unsubscribe;
	}, [coupleId, currentUser?.id]);

	useEffect(() => {
		// autoscroll when new messages
		if (!open) return;
		const el = listRef.current;
		if (el) {
			setTimeout(() => {
				el.scrollTop = el.scrollHeight;
			}, 100);
		}
	}, [messages, open]);

	// Clear unread messages when chat opens
	useEffect(() => {
		if (open && hasUnreadMessages) {
			setHasUnreadMessages(false);
		}
	}, [open, hasUnreadMessages]);

	const send = async () => {
		console.log('Send function called');
		console.log('Current state:', { text, coupleId, currentUser, isTyping });
		
		const trimmedText = text.trim();
		if (!trimmedText) {
			console.log('No text to send');
			return;
		}
		
		if (!coupleId) {
			console.log('No couple ID');
			return;
		}
		
		if (!currentUser) {
			console.log('No current user');
			return;
		}
		
		if (isTyping) {
			console.log('Already sending a message');
			return;
		}
		
		console.log('All checks passed, creating message');
		setIsTyping(true);
		
		const msg: ChatMessage = {
			id: crypto.randomUUID(),
			coupleId,
			senderId: currentUser.id,
			senderName: currentUser.name,
			text: trimmedText,
			createdAt: new Date().toISOString(),
		};
		
		console.log('Created message:', msg);
		
		// Clear input first
		setText('');
		setShowEmojis(false);
		
		// Add to UI immediately
		setMessages((prev) => {
			console.log('Adding message to UI, current messages:', prev.length);
			const newMessages = [...prev, msg];
			console.log('New messages array:', newMessages.length);
			return newMessages;
		});
		
		// Save the message
		try {
			if (hasSupabaseConfig) {
				console.log('Saving to Supabase...');
				console.log('Message payload:', {
					id: msg.id,
					couple_id: msg.coupleId,
					sender_id: msg.senderId,
					sender_name: msg.senderName,
					text: msg.text,
					created_at: msg.createdAt,
				});
				
				const { error } = await (supabase as any).from('messages').insert({
					id: msg.id,
					couple_id: msg.coupleId,
					sender_id: msg.senderId,
					sender_name: msg.senderName,
					text: msg.text,
					created_at: msg.createdAt,
				});
				
				if (error) {
					console.error('Supabase error details:', error);
					
					// If RLS error (code 42501 or message contains RLS terms), fall back to local storage
					const isRLSError = error.code === '42501' || 
						error.message.includes('row level security') || 
						error.message.includes('row-level security') ||
						error.message.includes('RLS') ||
						error.message.includes('violates row-level security policy');
					
					if (isRLSError) {
						console.log('RLS error detected (code: ' + error.code + '), falling back to local storage');
						try {
							await saveLocalMessage(msg);
							console.log('Message saved to localStorage successfully');
						} catch (localErr) {
							console.error('Local storage failed:', localErr);
							toast.error('Failed to send message');
							setMessages((prev) => prev.filter(m => m.id !== msg.id));
						}
					} else {
						toast.error(`Failed to send message: ${error.message}`);
						setMessages((prev) => prev.filter(m => m.id !== msg.id));
					}
				} else {
					console.log('Message sent to Supabase successfully');
					// Also save locally for offline support
					await saveLocalMessage(msg);
				}
			} else {
				console.log('Saving locally...');
				await saveLocalMessage(msg);
				console.log('Message saved locally');
			}
		} catch (err: any) {
			console.error('Error sending message:', err);
			
			// If it's an RLS error, fall back to local storage
			const isRLSError = err.code === '42501' || 
				(err.message && (
					err.message.includes('row level security') || 
					err.message.includes('row-level security') ||
					err.message.includes('RLS') ||
					err.message.includes('violates row-level security policy')
				));
			
			if (isRLSError) {
				console.log('RLS error in catch (code: ' + err.code + '), falling back to local storage');
				try {
					await saveLocalMessage(msg);
					console.log('Message saved to localStorage in catch block');
				} catch (localErr) {
					console.error('Local storage also failed:', localErr);
					toast.error('Failed to send message');
					setMessages((prev) => prev.filter(m => m.id !== msg.id));
				}
			} else {
				toast.error(`Failed to send message: ${err.message || 'Unknown error'}`);
				setMessages((prev) => prev.filter(m => m.id !== msg.id));
			}
		}
		
		setIsTyping(false);
		
		// Focus back to input
		setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}, 100);
	};

	const addEmoji = (emoji: string) => {
		setText(prev => prev + emoji);
		setShowEmojis(false);
		inputRef.current?.focus();
	};

	const me = currentUser?.id;
	const partner = couple?.memberA?.id === me ? couple?.memberB : couple?.memberA;
	
	// Debug partner detection only when it changes
	useEffect(() => {
		if (partner) {
			console.log('Partner detected:', partner.name);
		} else if (couple && currentUser) {
			console.log('Partner detection failed:', {
				me,
				memberA: couple?.memberA?.name,
				memberB: couple?.memberB?.name
			});
		}
	}, [partner, couple, currentUser]);

	return (
		<div className="fixed right-4 bottom-4 z-50">
			{/* Toggle Button */}
			{!open && (
				<div className="flex justify-end mb-2">
					<Button 
						size="lg" 
						className="rounded-full shadow-romantic relative" 
						onClick={() => {
							setOpen((v) => !v);
							// If opening, reset manual close flag. If closing, set it.
							if (!open) {
								hasBeenManuallyClosedRef.current = false;
							} else {
								hasBeenManuallyClosedRef.current = true;
							}
						}}
					>
						<Heart className="h-5 w-5" />
						{hasUnreadMessages && (
							<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
						)}
					</Button>
				</div>
			)}
			
			{/* Chat Panel */}
			{open && (
				<Card className="w-[92vw] max-w-[400px] h-[70vh] shadow-romantic border bg-white/95 backdrop-blur flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-romantic text-white rounded-t-lg">
						<div className="flex items-center gap-2">
							<Heart className="h-4 w-4" />
							<div>
								<div className="font-semibold">{partner?.name || 'Chat'}</div>
								<div className="text-xs opacity-80">
									{hasSupabaseConfig ? 'Online' : 'Local mode'}
								</div>
							</div>
						</div>
						<Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-white hover:bg-white/20">
							<X className="h-4 w-4" />
						</Button>
					</div>
					
					{/* Messages */}
					<div ref={listRef} className="flex-1 px-3 py-3 overflow-y-auto space-y-3 bg-gradient-to-b from-pink-50/30 to-purple-50/30">
						{messages.map((m) => (
							<div key={m.id} className={`flex ${m.senderId === me ? 'justify-end' : 'justify-start'}`}>
								<div className={`max-w-[80%] group ${m.senderId === me ? 'flex-row-reverse' : 'flex-row'} flex items-end gap-2`}>
									{/* Avatar */}
									<div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
										m.senderId === me ? 'bg-primary text-white' : 'bg-accent text-foreground'
									}`}>
										{m.senderName.charAt(0).toUpperCase()}
									</div>
									
									{/* Message bubble */}
									<div className={`rounded-2xl px-4 py-2 shadow-sm ${
										m.senderId === me 
											? 'bg-primary text-white rounded-br-md' 
											: 'bg-white text-foreground rounded-bl-md border'
									}`}>
										<div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
											{m.text.startsWith('https://') ? (
												<span
													className="text-blue-600 hover:underline cursor-pointer"
													onClick={() => {
														navigator.clipboard.writeText(m.text);
														toast.success('Copied URL');
													}}
												>
													{m.text}
												</span>
											) : (
												<>{m.text}</>
											)}
										</div>
										<div className={`text-[10px] mt-1 ${
											m.senderId === me ? 'text-white/70' : 'text-muted-foreground'
										}`}>
											{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</div>
									</div>
								</div>
							</div>
						))}
						{messages.length === 0 && (
							<div className="text-center text-muted-foreground text-sm mt-8 space-y-2">
								<Heart className="h-8 w-8 mx-auto text-primary/50" />
								<div>Start your conversation...</div>
								<div className="text-xs">Send a message to {partner?.name || 'your partner'}!</div>
							</div>
						)}
					</div>
					
					{/* Emoji picker */}
					{showEmojis && (
						<div className="px-3 py-2 border-t bg-white/50">
							<div className="grid grid-cols-9 gap-1">
								{QUICK_EMOJIS.map((emoji) => (
									<button
										key={emoji}
										onClick={() => addEmoji(emoji)}
										className="p-2 hover:bg-accent rounded text-lg transition-colors"
									>
										{emoji}
									</button>
								))}
							</div>
						</div>
					)}
					
					{/* Input */}
					<div className="flex items-center gap-2 p-3 border-t bg-white/80">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowEmojis(!showEmojis)}
							className="text-muted-foreground hover:text-primary"
						>
							<Smile className="h-4 w-4" />
						</Button>
						<Input
							ref={inputRef}
							placeholder={`Message ${partner?.name || 'partner'}...`}
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={(e) => { 
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									console.log('Enter key pressed');
									send();
								}
							}}
							className="flex-1 border-0 bg-accent/50 focus-visible:ring-1"
						/>
						<Button 
							onClick={() => {
								console.log('Send button clicked');
								send();
							}} 
							disabled={!text.trim() || isTyping}
							className="gap-2 bg-primary hover:bg-primary/90"
							type="button"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</Card>
			)}
		</div>
	);
} 