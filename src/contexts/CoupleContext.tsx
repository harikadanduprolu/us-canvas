import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { setPartnerMap } from '@/lib/storage';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Couple {
  id: string;
  name: string;
  memberA: User;
  memberB: User;
  anniversary?: string;
  createdAt: string;
  inviteCode?: string;
}

interface CoupleContextType {
  currentUser: User | null;
  couple: Couple | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  createCouple: (coupleName: string, anniversary?: string) => Promise<string>;
  joinCouple: (inviteCode: string) => Promise<void>;
  updateCoupleProfile: (updates: Partial<Couple>) => void;
  isLoading: boolean; // Add isLoading to context type
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const useCoupleContext = () => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCoupleContext must be used within CoupleProvider');
  }
  return context;
};

interface CoupleProviderProps {
  children: ReactNode;
}

export const CoupleProvider: React.FC<CoupleProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state, default true

  // Load existing session data on app startup
  const loadExistingSession = async () => {
    console.log('Loading existing session...');
    
    const savedUser = localStorage.getItem('lovable_user');
    const savedCouple = localStorage.getItem('lovable_couple');
    
    let loadedUser: User | null = null;
    let loadedCouple: Couple | null = null;
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      loadedUser = parsedUser;
      console.log('loadExistingSession: parsedUser from localStorage:', loadedUser);
      
      if (hasSupabaseConfig) {
        console.log('loadExistingSession: User found, attempting to reload couple data from database...');
        // reloadCoupleFromDatabase will update the couple state directly and localStorage
        await reloadCoupleFromDatabase(parsedUser);
        const reloadedCouple = localStorage.getItem('lovable_couple');
        if (reloadedCouple) {
          loadedCouple = JSON.parse(reloadedCouple);
          console.log('loadExistingSession: reloadedCouple from DB (via localStorage):', loadedCouple);
        }
      } else if (savedCouple) {
        const parsedCouple = JSON.parse(savedCouple);
        loadedCouple = parsedCouple;
      }
    }

    setCurrentUser(loadedUser);
    setCouple(loadedCouple);
    setIsLoading(false); // Set loading to false after session is loaded
  };

  const reloadCoupleFromDatabase = async (user: User) => {
    if (!hasSupabaseConfig) return;
    
    try {
      console.log('Reloading couple data for user:', user.name, 'with ID:', user.id);
      
      if (!user.id) {
        console.error('reloadCoupleFromDatabase: user.id is undefined, cannot query for couple.');
        return;
      }
      
      // Load couple if exists in DB
      console.log('reloadCoupleFromDatabase: Querying for couple with user.id:', user.id);
      const { data: couples, error: coupleErr } = await (supabase as any)
        .from('couples')
        .select(`
          id,
          name,
          member_a_id,
          member_b_id,
          anniversary,
          created_at,
          member_a:users!member_a_id(id,email,name,avatar),
          member_b:users!member_b_id(id,email,name,avatar)
        `)
        .or(`member_a_id.eq.${user.id},member_b_id.eq.${user.id}`)
        .limit(1);
      
      if (coupleErr) {
        console.error('reloadCoupleFromDatabase: Error fetching couple:', coupleErr);
      }
      console.log('reloadCoupleFromDatabase: Fetched couples from DB:', couples);

      if (!coupleErr && couples && couples[0]) {
        const dbCouple = couples[0];
        console.log('reloadCoupleFromDatabase: Found existing couple with foreign key data:', dbCouple);
        
        // Fetch both users' data (this part is now redundant due to joins above)
        // const { data: users, error: usersErr } = await (supabase as any)
        //   .from('users')
        //   .select('id,email,name,avatar')
        //   .in('id', [dbCouple.member_a_id, dbCouple.member_b_id]);
        
        // if (usersErr || !users || users.length < 2) {
        //   console.error('Could not fetch user data for couple:', usersErr);
        //   return;
        // }
        
        const formatted: Couple = {
          id: dbCouple.id,
          name: dbCouple.name,
          memberA: {
            id: dbCouple.member_a.id,
            email: dbCouple.member_a.email,
            name: dbCouple.member_a.name,
            avatar: dbCouple.member_a.avatar
          },
          memberB: {
            id: dbCouple.member_b.id,
            email: dbCouple.member_b.email,
            name: dbCouple.member_b.name,
            avatar: dbCouple.member_b.avatar
          },
          anniversary: dbCouple.anniversary || undefined,
          createdAt: dbCouple.created_at,
        };
        
        setCouple(formatted);
        localStorage.setItem('lovable_couple', JSON.stringify(formatted)); // Ensure full object is saved
        console.log('reloadCoupleFromDatabase: Couple data reloaded and saved to localStorage:', formatted);
      } else {
        console.log('reloadCoupleFromDatabase: No couple found for user.');
      }
    } catch (err) {
      console.error('reloadCoupleFromDatabase: Error in function:', err);
    }
  };

  useEffect(() => {
    loadExistingSession();
  }, []);

  useEffect(() => {
    console.log('CoupleContext: currentUser changed to', currentUser);
  }, [currentUser]);

  useEffect(() => {
    console.log('CoupleContext: couple changed to', couple);
  }, [couple]);

  const createCoupleForUser = async (user: any) => {
    try {
      console.log('Creating couple for user:', user.name);
      
      let partner = null;
      
      // Explicitly try to pair Harika and Yash
      if (user.email === 'harika@luv.com') {
        const { data: yashUser, error } = await (supabase as any)
          .from('users')
          .select('id,email,name,avatar')
          .eq('email', 'yash@luv.com')
          .limit(1);
        if (!error && yashUser && yashUser.length > 0) {
          partner = yashUser[0];
          console.log('createCoupleForUser: Found Yash as partner for Harika:', partner.name);
        } else {
          console.warn('createCoupleForUser: Yash not found for Harika. Error:', error);
        }
      } else if (user.email === 'yash@luv.com') {
        console.log('createCoupleForUser: Current user is Yash, trying to find Harika.');
        const { data: harikaUser, error } = await (supabase as any)
          .from('users')
          .select('id,email,name,avatar')
          .eq('email', 'harika@luv.com')
          .limit(1);
        if (!error && harikaUser && harikaUser.length > 0) {
          partner = harikaUser[0];
          console.log('createCoupleForUser: Found Harika as partner for Yash:', partner.name);
        } else {
          console.warn('createCoupleForUser: Harika not found for Yash. Error:', error);
        }
      }

      // Fallback if specific partners not found or current user is neither Harika nor Yash
      if (!partner) {
        console.log('createCoupleForUser: Specific partner (Harika/Yash) not found or current user is neither. Searching for any other user...');
        const { data: otherUsers, error: otherUsersError } = await (supabase as any)
          .from('users')
          .select('id,email,name,avatar')
          .neq('id', user.id) 
          .limit(1);
        if (!otherUsersError && otherUsers && otherUsers.length > 0) {
          partner = otherUsers[0];
          console.log('createCoupleForUser: Using fallback partner:', partner.name);
        } else {
          console.error('createCoupleForUser: Could not find any partner user for fallback.', otherUsersError);
          return;
        }
      }
      
      if (!partner || !partner.id) {
        console.error('createCoupleForUser: No valid partner or partner ID found');
        return;
      }
      
      // Create couple in database with proper foreign key relationships
      const coupleId = crypto.randomUUID();
      const newCouple = {
        id: coupleId,
        name: `${user.name} & ${partner.name}`,
        member_a_id: user.id,  // Foreign key to users table
        member_b_id: partner.id,  // Foreign key to users table
        anniversary: '2024-01-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('createCoupleForUser: Attempting to insert new couple:', newCouple);
      
      if (!newCouple.member_a_id || !newCouple.member_b_id) {
        console.error('createCoupleForUser: Invalid member IDs for new couple, aborting insert.', { memberAId: newCouple.member_a_id, memberBId: newCouple.member_b_id });
        return;
      }

      const { data: createdCouple, error: createError } = await (supabase as any)
        .from('couples')
        .insert(newCouple)
        .select(`
          id,
          name,
          member_a_id,
          member_b_id,
          anniversary,
          created_at,
          updated_at,
          member_a:users!member_a_id(id,email,name,avatar),
          member_b:users!member_b_id(id,email,name,avatar)
        `)
        .limit(1);
      
      if (createError) {
        console.error('createCoupleForUser: Error creating couple:', createError);
        return;
      }
      
      console.log('Couple created successfully in database:', newCouple.name);
      
      // Format and set the couple with full user data
      const formatted: Couple = {
        id: createdCouple[0].id,
        name: createdCouple[0].name,
        memberA: { id: createdCouple[0].member_a.id, email: createdCouple[0].member_a.email, name: createdCouple[0].member_a.name, avatar: createdCouple[0].member_a.avatar },
        memberB: { id: createdCouple[0].member_b.id, email: createdCouple[0].member_b.email, name: createdCouple[0].member_b.name, avatar: createdCouple[0].member_b.avatar },
        anniversary: createdCouple[0].anniversary || undefined,
        createdAt: createdCouple[0].created_at
      };
      
      setCouple(formatted);
      localStorage.setItem('lovable_couple', JSON.stringify(formatted));
      
      console.log('Couple relationship established:', {
        coupleId: formatted.id,
        memberA: formatted.memberA.name,
        memberB: formatted.memberB.name
      });
      
    } catch (err) {
      console.error('Error in createCoupleForUser:', err);
    }
  };

  const login = async (email: string, password: string) => {
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();
    if (!hasSupabaseConfig) {
      // Local fallback (original behavior)
      const users = JSON.parse(localStorage.getItem('lovable_users') || '[]');
      const user = users.find((u: any) => (u.email || '').toLowerCase() === inputEmail && (u.password || '').trim() === inputPassword);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const userFullData: User = { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
      setCurrentUser(userFullData);
      localStorage.setItem('lovable_user', JSON.stringify(userFullData));
      const couples = JSON.parse(localStorage.getItem('lovable_couples') || '[]');
      const userCouple = couples.find((c: Couple) => c.memberA.id === user.id || c.memberB.id === user.id);
      if (userCouple) {
        setCouple(userCouple);
        localStorage.setItem('lovable_couple', JSON.stringify(userCouple));
        const ids = [userCouple?.memberA?.id, userCouple?.memberB?.id].filter(Boolean);
        if (ids.length) setPartnerMap(userCouple.id, ids);
      }
      return;
    }
    // Authenticate against Supabase users table
    const { data: existingUsers, error: fetchErr } = await (supabase as any)
      .from('users')
      .select('id,email,name,avatar,password_hash')
      .eq('email', inputEmail)
      .limit(1);
    if (fetchErr) {
      console.error('login: Error fetching user:', fetchErr);
      throw new Error(`Auth fetch failed: ${fetchErr.message}`);
    }

    let dbUser = existingUsers && existingUsers[0];
    if (!dbUser || !dbUser.password_hash) {
      console.warn('login: User not found or no password_hash for email:', inputEmail);
      throw new Error('Invalid credentials');
    }
    const ok = await bcrypt.compare(inputPassword, dbUser.password_hash);
    if (!ok) {
      console.warn('login: Password mismatch for user:', inputEmail);
      throw new Error('Invalid credentials');
    }

    // Save the full user object to localStorage
    const userFullData: User = { id: dbUser.id, email: dbUser.email, name: dbUser.name, avatar: dbUser.avatar };
    setCurrentUser(userFullData);
    localStorage.setItem('lovable_user', JSON.stringify(userFullData));

    // Load couple if exists in DB with proper foreign key joins
    if (!dbUser.id) {
      console.error('login: dbUser.id is undefined, cannot query for couple.');
      return; // Prevent malformed query
    }
    console.log('login: Querying for couple with dbUser.id:', dbUser.id);
    const { data: couples, error: coupleErr } = await (supabase as any)
      .from('couples')
      .select(`
        id,
        name,
        member_a_id,
        member_b_id,
        anniversary,
        created_at,
        updated_at,
        member_a:users!member_a_id(id,email,name,avatar),
        member_b:users!member_b_id(id,email,name,avatar)
      `)
      .or(`member_a_id.eq.${dbUser.id},member_b_id.eq.${dbUser.id}`)
      .limit(1);
    
    if (coupleErr) {
      console.error('login: Error fetching couple:', coupleErr);
    }
    console.log('login: Fetched couples from DB:', couples);

    if (!coupleErr && couples && couples[0]) {
      // Existing couple found with full user data
      const dbCouple = couples[0];
      console.log('login: Found existing couple with foreign key data:', dbCouple);
      
      const formatted: Couple = {
        id: dbCouple.id,
        name: dbCouple.name,
        memberA: {
          id: dbCouple.member_a.id,
          email: dbCouple.member_a.email,
          name: dbCouple.member_a.name,
          avatar: dbCouple.member_a.avatar
        },
        memberB: {
          id: dbCouple.member_b.id,
          email: dbCouple.member_b.email,
          name: dbCouple.member_b.name,
          avatar: dbCouple.member_b.avatar
        },
        anniversary: dbCouple.anniversary || undefined,
        createdAt: dbCouple.created_at,
      };
      
      setCouple(formatted);
      localStorage.setItem('lovable_couple', JSON.stringify(formatted));
    } else {
      // No couple found, create one automatically
      console.log('login: No couple found for user, creating one...');
      await createCoupleForUser(dbUser);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    // Disabled: we only allow two static users
    throw new Error('Signup is disabled. This app uses two static accounts only.');
  };

  const logout = () => {
    setCurrentUser(null);
    setCouple(null);
    localStorage.removeItem('lovable_user');
    localStorage.removeItem('lovable_couple');
  };

  const createCouple = async (coupleName: string, anniversary?: string): Promise<string> => {
    if (!currentUser) throw new Error('Must be logged in');

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    if (!hasSupabaseConfig) {
      // Local fallback
      const newCouple: Couple = {
        id: crypto.randomUUID(),
        name: coupleName,
        memberA: currentUser,
        memberB: { id: '', email: '', name: 'Waiting...' },
        anniversary,
        createdAt: new Date().toISOString(),
        inviteCode,
      };
      const couples = JSON.parse(localStorage.getItem('lovable_couples') || '[]');
      couples.push(newCouple);
      localStorage.setItem('lovable_couples', JSON.stringify(couples));
      setCouple(newCouple);
      localStorage.setItem('lovable_couple', JSON.stringify(newCouple));
      const ids = [newCouple?.memberA?.id, newCouple?.memberB?.id].filter(Boolean);
      if (ids.length) setPartnerMap(newCouple.id, ids);
      return inviteCode;
    }

    const { data, error } = await (supabase as any)
      .from('couples')
      .insert({
        id: crypto.randomUUID(),
        name: coupleName,
        member_a_id: currentUser.id,
        member_b_id: '',
        anniversary,
        created_at: new Date().toISOString(),
        invite_code: inviteCode,
      })
      .select('*')
      .limit(1);
    if (error) {
      throw new Error(`Create couple failed: ${error.message}`);
    }
    const dbCouple = data && data[0];
    const newCouple: Couple = {
      id: dbCouple.id,
      name: dbCouple.name,
      memberA: { id: dbCouple.member_a_id, email: '', name: 'Partner A' },
      memberB: { id: '', email: '', name: 'Waiting...' },
      anniversary: dbCouple.anniversary || undefined,
      createdAt: dbCouple.created_at,
      inviteCode: dbCouple.invite_code || undefined,
    };

    setCouple(newCouple);
    localStorage.setItem('lovable_couple', JSON.stringify(newCouple));

    return inviteCode;
  };

  const joinCouple = async (inviteCode: string) => {
    if (!currentUser) throw new Error('Must be logged in');
    if (!hasSupabaseConfig) {
      // Local fallback
      const couples = JSON.parse(localStorage.getItem('lovable_couples') || '[]');
      const coupleIndex = couples.findIndex((c: Couple) => c.inviteCode === inviteCode);
      if (coupleIndex === -1) {
        throw new Error('Invalid invite code');
      }
      const foundCouple = couples[coupleIndex];
      foundCouple.memberB = currentUser;
      foundCouple.inviteCode = undefined;
      couples[coupleIndex] = foundCouple;
      localStorage.setItem('lovable_couples', JSON.stringify(couples));
      setCouple(foundCouple);
      localStorage.setItem('lovable_couple', JSON.stringify(foundCouple));
      const ids = [foundCouple?.memberA?.id, foundCouple?.memberB?.id].filter(Boolean);
      if (ids.length) setPartnerMap(foundCouple.id, ids);
      return;
    }

    const { data: couples, error: fetchErr } = await (supabase as any)
      .from('couples')
      .select('*')
      .eq('invite_code', inviteCode)
      .limit(1);
    if (fetchErr) {
      throw new Error(`Join lookup failed: ${fetchErr.message}`);
    }
    if (!couples || !couples[0]) {
      throw new Error('Invalid invite code');
    }
    const foundCouple = couples[0];

    const { data: updated, error: updateErr } = await (supabase as any)
      .from('couples')
      .update({ member_b_id: currentUser.id, invite_code: null })
      .eq('id', foundCouple.id)
      .select('*')
      .limit(1);
    if (updateErr) {
      throw new Error(`Join update failed: ${updateErr.message}`);
    }
    const updatedCouple = updated && updated[0];
    const formatted: Couple = {
      id: updatedCouple.id,
      name: updatedCouple.name,
      memberA: { id: updatedCouple.member_a_id, email: '', name: 'Partner A' },
      memberB: { id: updatedCouple.member_b_id || '', email: '', name: updatedCouple.member_b_id ? 'Partner B' : 'Waiting...' },
      anniversary: updatedCouple.anniversary || undefined,
      createdAt: updatedCouple.created_at,
      inviteCode: undefined,
    };
    setCouple(formatted);
    localStorage.setItem('lovable_couple', JSON.stringify(formatted));
  };

  const updateCoupleProfile = (updates: Partial<Couple>) => {
    if (!couple) return;

    const updatedCouple = { ...couple, ...updates };
    setCouple(updatedCouple);
    localStorage.setItem('lovable_couple', JSON.stringify(updatedCouple));

    // Best-effort update in Supabase
    if (hasSupabaseConfig) {
    const supabaseUpdates: any = {};
    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.anniversary) supabaseUpdates.anniversary = updates.anniversary;
      
      (supabase as any)
      .from('couples')
      .update(supabaseUpdates)
      .eq('id', couple.id)
        .then(() => console.log('Couple updated in Supabase'))
        .catch((err: any) => console.log('Supabase update failed:', err));
    }
  };

  return (
    <CoupleContext.Provider
      value={{
        currentUser,
        couple,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        createCouple,
        joinCouple,
        updateCoupleProfile,
        isLoading, // Expose isLoading through context
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};
