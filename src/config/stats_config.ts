// src/config/stats_config.ts

const stats_config: any = {
  GLOBAL: {
    PRIMARY: ["Min", "MP", "Gls", "Ast", "xG"]
  },
  GK: {
    PRIMARY: ["Min", "MP", "CS", "Save%", "PSxG+/-"],
    SECONDARY: ["SoTA", "GA", "CS%", "PSxG", "PKsv", "AvgDist", "Launch%", "PassAtt", "Throws", "Sweeps"],
    TERTIARY: ["Gls", "Ast", "PassCmp%", "PassLng", "PassMed", "PassShort", "PrgP", "Touches", "CrossStp", "CrossStp%", "Errors", "Att", "OPA", "OPA/90", "Recov", "LongPassCmp%", "RefSave%", "Saves/90", "GA/90", "PSxG/SoT"],
    OTHER: "*"
  },
  CB: {
    SECONDARY: ["Tkl", "Int", "Tkl+Int", "Clr", "Blocks", "AerialWon", "AerialWon%", "PrgP", "LngCmp%", "Mis"],
    TERTIARY: ["xG", "xAG", "KP", "Gls", "Ast", "SCA", "GCA", "Touches", "Carries", "PrgC", "PrgR", "PassCmp%", "PassDist", "PassLongAtt", "PassLongCmp", "Errors", "Pressures", "Recov", "Fouls", "CrdY", "2CrdY", "CrdR"],
    OTHER: "*"
  },
  "FB/WB": {
    SECONDARY: ["Tkl", "Int", "Tkl+Int", "Crs", "CrsPA", "KP", "PrgP", "PrgC", "Ast", "SCA"],
    TERTIARY: ["xAG", "xG", "Gls", "GCA", "SoT", "Sh/90", "Touches", "Carries", "Rec", "PassCmp%", "PassFinal3rd", "PassIntoPA", "Blocks", "Clr", "AerialWon", "Mis", "Dispossessed", "Pressures", "Recov", "Fouls", "CrdY"],
    OTHER: "*"
  },
  DM: {
    SECONDARY: ["Tkl", "Int", "Tkl+Int", "Blocks", "PrgP", "KP", "PassCmp%", "Pressures", "Recov", "Mis"],
    TERTIARY: ["xAG", "xG", "Gls", "Ast", "SCA", "GCA", "PassDist", "PassMed", "PassLongCmp%", "Carries", "PrgC", "Touches", "PassIntoPA", "CPA", "AerialWon", "Fouls", "CrdY", "Errors", "Dispossessed", "Rec"],
    OTHER: "*"
  },
  "CM/AM": {
    SECONDARY: ["KP", "xAG", "SCA", "PrgP", "PrgC", "PassCmp%", "Ast", "xG", "G+A", "Rec"],
    TERTIARY: ["SoT", "Sh/90", "GCA", "Carries", "PrgR", "CPA", "PassIntoPA", "Touches", "PassMed", "PassLongCmp%", "Mis", "Dispossessed", "Pressures", "Tkl", "Int", "Fouls", "CrdY", "Blocks", "AerialWon", "Errors"],
    OTHER: "*"
  },
  WINGER: {
    SECONDARY: ["xG", "xAG", "SoT", "Sh/90", "KP", "SCA", "GCA", "Carries", "PrgC", "PrgR"],
    TERTIARY: ["G+A", "G-PK", "CPA", "PassIntoPA", "Touches", "Rec", "DribSucc%", "Mis", "Dispossessed", "Pressures", "Ast", "Gls", "PassCmp%", "Crosses", "ShotsBlocked", "FoulsDrawn", "Fouls", "CrdY", "Off", "Errors", "AerialWon"],
    OTHER: "*"
  },
  "ST/CF": {
    SECONDARY: ["xG", "npxG", "SoT", "Sh/90", "G-PK", "G+A", "KP", "xAG", "SCA", "PrgR"],
    TERTIARY: ["Gls", "Ast", "GCA", "Touches", "Rec", "Carries", "Pressures", "AerialWon", "AerialWon%", "Off", "FoulsDrawn", "Fouls", "Mis", "Dispossessed", "PassCmp%", "PassIntoPA", "CPA", "ShotsBlocked", "xG/Shot", "Shots/90"],
    OTHER: "*"
  }
};

export default stats_config;
