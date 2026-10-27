import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 1. Supabase Initialization
export const SUPABASE_URL = 'https://pxwplfxbyjxjpaosswgu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_LAc_l74phmC-3LQNQn_bFQ_KxmpVJD9';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Team Alias Dictionary (Prevents mismatch bugs between your picks and ESPN's naming)
export const TEAM_ALIASES = {
  "OLE MISS": "MISS", "OLEMISS": "MISS", "UCONN": "CONN",
  "UMASS": "MASS", "NC STATE": "NCSU", "MIAMI (FL)": "MIA",
  "MIAMI (OH)": "M-OH", "TEXAS A&M": "TAMU", "OKLAHOMA STATE": "OKST",
  "FLORIDA STATE": "FSU", "GEORGIA TECH": "GT", "MICHIGAN STATE": "MSU"
};

export function normalizeTeam(teamStr) {
  if (!teamStr) return "";
  const cleaned = String(teamStr).trim().toUpperCase();
  return TEAM_ALIASES[cleaned] || cleaned;
}

// 3. User & Identity Management
export function getStoredDeviceUID() {
  return localStorage.getItem('my_device_uid');
}

export function saveDeviceUID(uid) {
  localStorage.setItem('my_device_uid', uid);
}

// 4. Fast Bulk ESPN Scoreboard Sync
export async function syncWeekFromESPN(year = 2026, weekNum = 1, seasonType = 2) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${year}&week=${weekNum}&seasontype=${seasonType}&groups=80&limit=250`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const events = data.events || [];

    const gameRecords = events.map(evt => {
      const comp = evt.competitions[0];
      const home = comp.competitors.find(c => c.homeAway === 'home');
      const away = comp.competitors.find(c => c.homeAway === 'away');
      const statusType = comp.status?.type?.name || 'STATUS_SCHEDULED';
      const isCompleted = comp.status?.type?.completed || false;

      let winner = null;
      if (isCompleted) {
        if (home.winner) winner = normalizeTeam(home.team.abbreviation);
        else if (away.winner) winner = normalizeTeam(away.team.abbreviation);
      }

      return {
        espn_game_id: String(evt.id),
        week_number: parseInt(weekNum),
        home_team: normalizeTeam(home.team.abbreviation),
        away_team: normalizeTeam(away.team.abbreviation),
        home_score: parseInt(home.score) || 0,
        away_score: parseInt(away.score) || 0,
        winner_team: winner,
        status: statusType,
        start_time: comp.date
      };
    });

    if (gameRecords.length > 0) {
      const { error } = await supabase.from('games').upsert(gameRecords, { onConflict: 'espn_game_id' });
      if (error) console.error("Error upserting games into Supabase:", error);
    }
    return gameRecords;
  } catch (err) {
    console.error("Failed to sync from ESPN:", err);
    return [];
  }
}
