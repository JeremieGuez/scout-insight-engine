export interface FBrefPlayerRow {
  // Basic info
  Rk: string;
  Player: string;
  Nation: string;
  Pos: string;
  Squad: string;
  Comp: string;
  Age: string;
  Born: string;
  
  // Playing time
  MP: string;
  Starts: string;
  Min: string;
  "90s": string;
  
  // Standard stats
  Gls: string;
  Ast: string;
  "G+A": string;
  "G-PK": string;
  PK: string;
  PKatt: string;
  CrdY: string;
  CrdR: string;
  
  // Expected stats  
  xG: string;
  npxG: string;
  xAG: string;
  "npxG+xAG": string;
  
  // Progressive stats
  PrgC: string;
  PrgP: string;
  PrgR: string;
  
  // Per 90 stats
  Gls_90: string;
  Ast_90: string;
  "G+A_90": string;
  "G-PK_90": string;
  "G+A-PK_90": string;
  xG_90: string;
  xAG_90: string;
  "xG+xAG_90": string;
  npxG_90: string;
  "npxG+xAG_90": string;
  
  // Shooting stats (duplicated columns with different prefixes)
  Rk_stats_shooting: string;
  Nation_stats_shooting: string;
  Pos_stats_shooting: string;
  Comp_stats_shooting: string;
  Age_stats_shooting: string;
  Born_stats_shooting: string;
  "90s_stats_shooting": string;
  Gls_stats_shooting: string;
  Sh: string;
  SoT: string;
  "SoT%": string;
  "Sh/90": string;
  "SoT/90": string;
  "G/Sh": string;
  "G/SoT": string;
  Dist: string;
  FK: string;
  PK_stats_shooting: string;
  PKatt_stats_shooting: string;
  xG_stats_shooting: string;
  npxG_stats_shooting: string;
  "npxG/Sh": string;
  "G-xG": string;
  "np:G-xG": string;
  
  // Passing stats
  Rk_stats_passing: string;
  Nation_stats_passing: string;
  Pos_stats_passing: string;
  Comp_stats_passing: string;
  Age_stats_passing: string;
  Born_stats_passing: string;
  "90s_stats_passing": string;
  Cmp: string;
  Att: string;
  "Cmp%": string;
  TotDist: string;
  PrgDist: string;
  Ast_stats_passing: string;
  xAG_stats_passing: string;
  xA: string;
  "A-xAG": string;
  KP: string;
  "1/3": string;
  PPA: string;
  CrsPA: string;
  PrgP_stats_passing: string;
  
  // Passing types
  Rk_stats_passing_types: string;
  Nation_stats_passing_types: string;
  Pos_stats_passing_types: string;
  Comp_stats_passing_types: string;
  Age_stats_passing_types: string;
  Born_stats_passing_types: string;
  "90s_stats_passing_types": string;
  Att_stats_passing_types: string;
  Live: string;
  Dead: string;
  FK_stats_passing_types: string;
  TB: string;
  Sw: string;
  Crs: string;
  TI: string;
  CK: string;
  In: string;
  Out: string;
  Str: string;
  Cmp_stats_passing_types: string;
  Off: string;
  Blocks: string;
  
  // Goal and shot creation
  Rk_stats_gca: string;
  Nation_stats_gca: string;
  Pos_stats_gca: string;
  Comp_stats_gca: string;
  Age_stats_gca: string;
  Born_stats_gca: string;
  "90s_stats_gca": string;
  SCA: string;
  SCA90: string;
  PassLive: string;
  PassDead: string;
  TO: string;
  Sh_stats_gca: string;
  Fld: string;
  Def: string;
  GCA: string;
  GCA90: string;
  
  // Defense
  Rk_stats_defense: string;
  Nation_stats_defense: string;
  Pos_stats_defense: string;
  Comp_stats_defense: string;
  Age_stats_defense: string;
  Born_stats_defense: string;
  "90s_stats_defense": string;
  Tkl: string;
  TklW: string;
  "Def 3rd": string;
  "Mid 3rd": string;
  "Att 3rd": string;
  Att_stats_defense: string;
  "Tkl%": string;
  Lost: string;
  Blocks_stats_defense: string;
  Sh_stats_defense: string;
  Pass: string;
  Int: string;
  "Tkl+Int": string;
  Clr: string;
  Err: string;
  
  // Possession
  Rk_stats_possession: string;
  Nation_stats_possession: string;
  Pos_stats_possession: string;
  Comp_stats_possession: string;
  Age_stats_possession: string;
  Born_stats_possession: string;
  "90s_stats_possession": string;
  Touches: string;
  "Def Pen": string;
  "Def 3rd_stats_possession": string;
  "Mid 3rd_stats_possession": string;
  "Att 3rd_stats_possession": string;
  "Att Pen": string;
  Live_stats_possession: string;
  Att_stats_possession: string;
  Succ: string;
  "Succ%": string;
  Tkld: string;
  "Tkld%": string;
  Carries: string;
  TotDist_stats_possession: string;
  PrgDist_stats_possession: string;
  PrgC_stats_possession: string;
  "1/3_stats_possession": string;
  CPA: string;
  Mis: string;
  Dis: string;
  Rec: string;
  PrgR_stats_possession: string;
  
  // Playing time (detailed)
  Rk_stats_playing_time: string;
  Nation_stats_playing_time: string;
  Pos_stats_playing_time: string;
  Comp_stats_playing_time: string;
  Age_stats_playing_time: string;
  Born_stats_playing_time: string;
  MP_stats_playing_time: string;
  Min_stats_playing_time: string;
  "Mn/MP": string;
  "Min%": string;
  "90s_stats_playing_time": string;
  Starts_stats_playing_time: string;
  "Mn/Start": string;
  Compl: string;
  Subs: string;
  "Mn/Sub": string;
  unSub: string;
  PPM: string;
  onG: string;
  onGA: string;
  "+/-": string;
  "+/-90": string;
  "On-Off": string;
  onxG: string;
  onxGA: string;
  "xG+/-": string;
  "xG+/-90": string;
  
  // Miscellaneous
  Rk_stats_misc: string;
  Nation_stats_misc: string;
  Pos_stats_misc: string;
  Comp_stats_misc: string;
  Age_stats_misc: string;
  Born_stats_misc: string;
  "90s_stats_misc": string;
  CrdY_stats_misc: string;
  CrdR_stats_misc: string;
  "2CrdY": string;
  Fls: string;
  Fld_stats_misc: string;
  Off_stats_misc: string;
  Crs_stats_misc: string;
  Int_stats_misc: string;
  TklW_stats_misc: string;
  PKwon: string;
  PKcon: string;
  OG: string;
  Recov: string;
  Won: string;
  Lost_stats_misc: string;
  "Won%": string;
  
  // Keeper stats
  Rk_stats_keeper: string;
  Nation_stats_keeper: string;
  Pos_stats_keeper: string;
  Comp_stats_keeper: string;
  Age_stats_keeper: string;
  Born_stats_keeper: string;
  MP_stats_keeper: string;
  Starts_stats_keeper: string;
  Min_stats_keeper: string;
  "90s_stats_keeper": string;
  GA: string;
  GA90: string;
  SoTA: string;
  Saves: string;
  "Save%": string;
  W: string;
  D: string;
  L: string;
  CS: string;
  "CS%": string;
  PKatt_stats_keeper: string;
  PKA: string;
  PKsv: string;
  PKm: string;
  
  // Advanced keeper stats
  Rk_stats_keeper_adv: string;
  Nation_stats_keeper_adv: string;
  Pos_stats_keeper_adv: string;
  Comp_stats_keeper_adv: string;
  Age_stats_keeper_adv: string;
  Born_stats_keeper_adv: string;
  "90s_stats_keeper_adv": string;
  GA_stats_keeper_adv: string;
  PKA_stats_keeper_adv: string;
  FK_stats_keeper_adv: string;
  CK_stats_keeper_adv: string;
  OG_stats_keeper_adv: string;
  PSxG: string;
  "PSxG/SoT": string;
  "PSxG+/-": string;
  "/90": string;
  Cmp_stats_keeper_adv: string;
  Att_stats_keeper_adv: string;
  "Cmp%_stats_keeper_adv": string;
  "Att (GK)": string;
  Thr: string;
  "Launch%": string;
  AvgLen: string;
  Opp: string;
  Stp: string;
  "Stp%": string;
  "#OPA": string;
  "#OPA/90": string;
  AvgDist: string;
}
