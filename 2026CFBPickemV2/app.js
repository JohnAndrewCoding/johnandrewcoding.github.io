// app.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase Project Credentials
export const SUPABASE_URL = 'https://pxwplfxbyjxjpaosswgu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_LAc_l74phmC-3LQNQn_bFQ_KxmpVJD9';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Standardize team abbreviations so user picks and ESPN matches 100%
export const TEAM_ALIASES = {
  "OLE MISS": "MISS", "OLEMISS": "MISS", "UCONN": "CONN",
  "UMASS": "MASS", "NC STATE": "NCSU", "MIAMI (FL)": "MIA",
  "MIAMI (OH)": "M-OH", "TEXAS A&M": "TAMU", "OKLAHOMA STATE": "OKST",
  "FLORIDA STATE": "FSU", "GEORGIA TECH": "GT", "MICHIGAN STATE": "MSU",
  "HAWAI'I": "HAW", "HAWAII": "HAW", "SAN JOSE STATE": "SJSU"
};

export function normalizeTeam(teamStr) {
  if (!teamStr) return "";
  const cleaned = String(teamStr).trim().toUpperCase();
  return TEAM_ALIASES[cleaned] || cleaned;
}

// Device UID helper functions
export function getStoredDeviceUID() {
  return localStorage.getItem('my_device_uid');
}

export function saveDeviceUID(uid) {
  localStorage.setItem('my_device_uid', uid);
}

// Identity manager: ensures the device has an account and profile name
export async function ensureUser() {
  let uid = getStoredDeviceUID();
  if (!uid) {
    uid = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    saveDeviceUID(uid);
  }

  // Check if profile exists in Supabase
  let { data: profile } = await supabase.from('profiles').select('*').eq('device_uid', uid).maybeSingle();

  if (!profile) {
    let name = prompt("Enter your Player/Coach Name for Pick'em:") || ("Player_" + uid.slice(-4));
    name = name.trim().toUpperCase();
    await supabase.from('profiles').insert([{ device_uid: uid, player_name: name, coach_name: name }]);
    profile = { device_uid: uid, player_name: name };
  }

  return profile;
}

// Bulk ESPN Score Fetcher & DB Updater
export async function syncScoresFromESPN(weekNum) {
  // Dynamically uses current year or defaults to current football calendar
  const year = new Date().getFullYear();
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${year}&week=${weekNum}&seasontype=2&groups=80&limit=250`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const events = data.events || [];

    const updates = [];
    events.forEach(e => {
      const comp = e.competitions[0];
      const home = comp.competitors.find(c => c.homeAway === 'home');
      const away = comp.competitors.find(c => c.homeAway === 'away');
      const isCompleted = comp.status?.type?.completed || false;
      const statusType = comp.status?.type?.name || 'STATUS_SCHEDULED';

      let winner = null;
      if (isCompleted) {
        if (home.winner) winner = normalizeTeam(home.team.abbreviation);
        else if (away.winner) winner = normalizeTeam(away.team.abbreviation);
      }

      updates.push({
        espn_game_id: String(e.id),
        week_number: parseInt(weekNum),
        home_team: normalizeTeam(home.team.abbreviation),
        away_team: normalizeTeam(away.team.abbreviation),
        home_score: parseInt(home.score) || 0,
        away_score: parseInt(away.score) || 0,
        winner_team: winner,
        status: statusType,
        start_time: comp.date
      });
    });

    if (updates.length > 0) {
      await supabase.from('games').upsert(updates, { onConflict: 'espn_game_id' });
    }
    return updates;
  } catch (err) {
    console.error("ESPN Sync Error:", err);
    return [];
  }
}
