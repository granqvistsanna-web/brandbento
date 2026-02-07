/**
 * COLOURBOOK - 200+ Brand-Ready Color Palettes
 *
 * Usage Roles:
 * - Core Colour: Primary brand color for logos, hero sections, headlines, high-priority actions
 * - Neutral Palette: Structural foundation for backgrounds, layouts, body copy, dividers
 * - Accent Palette: Supporting colors for emphasis, highlights, secondary actions, data viz
 */

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

export interface PaletteSection {
  id: string;
  name: string;
  personality: string;
  palettes: Palette[];
}

export const ROLE_DESCRIPTIONS = {
  bg: "Page backgrounds and large surfaces. Choose the lightest color for optimal readability.",
  text: "Body copy, headings, and primary content. Should have strong contrast with background (4.5:1 minimum).",
  primary: "Core brand color. Use for logos, hero sections, primary CTAs, and high-priority actions. Apply with discipline.",
  accent: "Supporting color for emphasis. Use sparingly for highlights, secondary actions, and differentiation.",
  surface: "Cards, panels, and elevated elements. Slightly different from background to create depth.",
};

export const PALETTE_SECTIONS: PaletteSection[] = [
  // ============================================
  // 01. NEUTRALS - Structural Foundation Scales
  // ============================================
  {
    id: "neutrals",
    name: "Neutrals",
    personality: "Structural foundation scales",
    palettes: [
      {
        id: "stone",
        name: "Stone",
        colors: ["#0C0A09", "#1C1917", "#292524", "#44403B", "#57534D", "#79716B", "#A6A09B", "#D6D3D1", "#E7E5E4", "#F5F5F4", "#FAFAF9"],
      },
      {
        id: "neutral",
        name: "Neutral",
        colors: ["#0A0A0A", "#171717", "#262626", "#404040", "#525252", "#737373", "#A1A1A1", "#D4D4D4", "#E5E5E5", "#F5F5F5", "#FAFAFA"],
      },
      {
        id: "zinc",
        name: "Zinc",
        colors: ["#09090B", "#18181B", "#27272A", "#3F3F46", "#52525C", "#71717B", "#9F9FA9", "#D4D4D8", "#E4E4E7", "#F4F4F5", "#FAFAFA"],
      },
      {
        id: "grey",
        name: "Grey",
        colors: ["#030712", "#101828", "#1E2939", "#364153", "#4A5565", "#6A7282", "#99A1AF", "#D1D5DC", "#E5E7EB", "#F3F4F6", "#F9FAFB"],
      },
      {
        id: "slate",
        name: "Slate",
        colors: ["#020618", "#0F172B", "#1D293D", "#314158", "#45556C", "#62748E", "#90A1B9", "#CAD5E2", "#E2E8F0", "#F1F5F9", "#F8FAFC"],
      },
    ],
  },

  // ============================================
  // 02. FRESH - Clean, Natural, Energetic
  // ============================================
  {
    id: "fresh",
    name: "Fresh",
    personality: "Clean, natural, energetic",
    palettes: [
      {
        id: "fresh-p13",
        name: "Fresh #1",
        colors: ["#121212", "#EEEEEC", "#85CE41", "#F973EE", "#FF7900"],
      },
      {
        id: "fresh-p15",
        name: "Fresh #2",
        colors: ["#0F2323", "#DEEB52", "#FFFFFF"],
      },
      {
        id: "fresh-p16",
        name: "Fresh #3",
        colors: ["#FFFFFF", "#193300", "#B2C92C", "#FF795C", "#73C3ED", "#FFD43D"],
      },
      {
        id: "fresh-p17",
        name: "Fresh #4",
        colors: ["#55D065", "#D0E34C", "#FFC400", "#FF9937", "#E95585"],
      },
      {
        id: "fresh-p18",
        name: "Fresh #5",
        colors: ["#FFFFFF", "#8FB73E", "#F5833C", "#FFD400", "#000000", "#557836", "#B73625", "#CD7F29"],
      },
      {
        id: "fresh-p19",
        name: "Fresh #6",
        colors: ["#3B4AD9", "#007817", "#8B0E0D", "#B34D00", "#FFF5E1", "#D2ED9C", "#FE5D02", "#FFBF01"],
      },
      {
        id: "fresh-p20",
        name: "Fresh #7",
        colors: ["#0D4526", "#7F4399", "#C9135E", "#BFDD0D", "#FFB3C7", "#FF5F00", "#FFFFFF", "#FF9F08", "#FEDC19"],
      },
      {
        id: "fresh-p21",
        name: "Fresh #8",
        colors: ["#52BCD6", "#FF386A", "#89FF9A", "#FFD71C", "#FFFFFF", "#F2F2F2", "#606BF8", "#B4012D", "#7FC832", "#FF8100", "#E0E0E0", "#A4A4A4", "#7E7E7E", "#031C9B", "#6A003A", "#005248", "#F33126", "#000000"],
      },
    ],
  },

  // ============================================
  // 03. VIBRANT - High-energy, Saturated, Electric
  // ============================================
  {
    id: "vibrant",
    name: "Vibrant",
    personality: "High-energy, saturated, electric",
    palettes: [
      {
        id: "vibrant-p23",
        name: "Vibrant #1",
        colors: ["#000000", "#FFFFFF", "#0400FC"],
      },
      {
        id: "vibrant-p25",
        name: "Vibrant #2",
        colors: ["#E882FF", "#3B3B3B", "#ADAD90", "#E7E9D9", "#F5F4EE"],
      },
      {
        id: "vibrant-p26",
        name: "Vibrant #3",
        colors: ["#FFFFFF", "#000000", "#FFB592", "#FFB0CD", "#FABA17", "#60E21B"],
      },
      {
        id: "vibrant-p27",
        name: "Vibrant #4",
        colors: ["#FFFFFF", "#5EFF83", "#CA6DFA", "#FF2995", "#000000", "#1E4637", "#412850", "#4B1937"],
      },
      {
        id: "vibrant-p28",
        name: "Vibrant #5",
        colors: ["#5F016F", "#FE33BA", "#FE80D3", "#FFADE4", "#F9F5F4"],
      },
      {
        id: "vibrant-p29",
        name: "Vibrant #6",
        colors: ["#E4FC53", "#31FE6A", "#C294FF", "#FF5001", "#2D51FF", "#004059", "#FF6FFF", "#680030"],
      },
      {
        id: "vibrant-p30",
        name: "Vibrant #7",
        colors: ["#1A1C29", "#3A405C", "#DADAF7", "#F5F5FE", "#A4BBE1", "#FC670B", "#FCF17C", "#9DFC7C", "#EEA1F8", "#FFFFFF"],
      },
      {
        id: "vibrant-p31",
        name: "Vibrant #8",
        colors: ["#FFEA00", "#00E1F3", "#FFC0FF", "#ABFF5A", "#FFFFFF", "#F2F2F2", "#FF9800", "#5151FC", "#FF6FFF", "#00906C", "#E0E0E0", "#A4A4A4", "#7E7E7E", "#FF5900", "#5000BF", "#FC032D", "#085E55", "#000000"],
      },
      {
        id: "vibrant-p32",
        name: "Vibrant #9",
        colors: ["#4456FF", "#C9FF46", "#FEFFE3", "#D238EB", "#A6FFE8", "#9EA1FF", "#255A4B", "#34C38F"],
      },
      {
        id: "vibrant-p34",
        name: "Vibrant #10",
        colors: ["#AFFC41", "#0A2E33", "#00DB87", "#787DFA", "#CCB6FA", "#F7D3C2"],
      },
      {
        id: "vibrant-p35",
        name: "Vibrant #11",
        colors: ["#EFF4FF", "#5938E4", "#D2E4FF", "#0197FF", "#9ABCFF", "#22B2A4", "#508BFE", "#15A800", "#0156FC", "#B0DB02", "#013DB2", "#E8B321", "#002368", "#DB5614", "#000A1E", "#F66DBD"],
      },
      {
        id: "vibrant-p36",
        name: "Vibrant #12",
        colors: ["#FFFFFF", "#444CFF", "#FF2D67", "#9E11FF", "#FFC100", "#028D57", "#000000", "#2DD2FF", "#FFAE92", "#FF65E7", "#FFE400", "#9FF62F"],
      },
      {
        id: "vibrant-p37",
        name: "Vibrant #13",
        colors: ["#FFFFFF", "#FF97F5", "#EAE95A", "#FF823F", "#3AC8D0", "#EEEEEE", "#FF1BDE", "#E2D807", "#FF4F25", "#01A4C6", "#040409", "#AA0092", "#B4A400", "#CD1000", "#00699A"],
      },
      {
        id: "vibrant-p38",
        name: "Vibrant #14",
        colors: ["#FFFFFF", "#CDFFE3", "#FFFFDD", "#E7F6FF", "#FFDCEB", "#E7E1FF", "#041243", "#01EC6D", "#FEF501", "#00E1FF", "#FE50B8", "#866DFF"],
      },
      {
        id: "vibrant-p39",
        name: "Vibrant #15",
        colors: ["#161616", "#0A2DD3", "#66DDC9", "#EAD900"],
      },
      {
        id: "vibrant-p40",
        name: "Vibrant #16",
        colors: ["#FFFFFF", "#70D6FF", "#A8FDE8", "#CBA2FA", "#FFCCF3", "#F9F3E9", "#096FFF", "#34E8BB", "#A962F8", "#FB9CE5", "#0B100F", "#011C42", "#003326", "#43045E", "#5C0047"],
      },
      {
        id: "vibrant-p41",
        name: "Vibrant #17",
        colors: ["#DCEAFD", "#CAF18E", "#FDB088", "#F4D1FB", "#FFFFFF", "#F2F2F2", "#74BCFF", "#8CBC41", "#FD7729", "#C445D8", "#E0E0E0", "#A4A4A4", "#7E7E7E", "#0380FF", "#456A33", "#DC4902", "#680F79", "#000000"],
      },
      {
        id: "vibrant-p42",
        name: "Vibrant #18",
        colors: ["#D0F7E6", "#F1F4CB", "#FFD3E2", "#FFE0D4", "#00C16B", "#D4E41E", "#FF80AE", "#FF7640", "#00732E", "#687200", "#4D1727", "#8F2900", "#003912", "#254200", "#421300"],
      },
      {
        id: "vibrant-p43",
        name: "Vibrant #19",
        colors: ["#F2F4F5", "#96C6CC", "#DBC2EE", "#FED8C8", "#DCE7A6", "#9BD597", "#5234EC", "#D95FFF", "#F4572F", "#CDE303", "#009F66", "#121212", "#373E98", "#AC2BCB", "#94430D", "#979801", "#005242"],
      },
      {
        id: "vibrant-p44",
        name: "Vibrant #20",
        colors: ["#570016", "#F4570A", "#FEE34A", "#A2A9FF", "#B5F000", "#FBE9FF", "#FFFBE9", "#CCECFD", "#F6FFDF"],
      },
      {
        id: "vibrant-p45",
        name: "Vibrant #21",
        colors: ["#FFFFFF", "#BFF0FC", "#FAC7FC", "#A8FFD9", "#FAE0BD", "#FFBDC7", "#BBBCBE", "#4D26FF", "#E84FFF", "#57BA8F", "#FF7817", "#E02E66", "#000000", "#1A0794", "#7300CC", "#04636D", "#C4400F", "#960547"],
      },
      {
        id: "vibrant-p46",
        name: "Vibrant #22",
        colors: ["#B1F2D6", "#B0D9FF", "#FFF2B2", "#FCDCFF", "#FFD7B0", "#DFFDFE", "#8EECC4", "#8DC8FF", "#FFED8F", "#FBCCFF", "#FFC68C", "#CCF7FF", "#5BE3AA", "#5AB0FF", "#FEE45E", "#F9B5FE", "#FFA75A", "#A5FBFF", "#03D47C", "#0185FF", "#FED607", "#F68DFE", "#FF7101", "#50EEF6", "#00B266", "#0676DE", "#E4BC07", "#E96DF2", "#F25730", "#4ED7DE", "#008C59", "#0164BF", "#D18000", "#CF4CD9", "#BF3013", "#4BA6A6", "#085239", "#003C73", "#722B03", "#712A76", "#780505", "#28736D", "#002E22", "#002140", "#401102", "#49225B", "#400000", "#134038"],
      },
    ],
  },

  // ============================================
  // 04. BOLD - Strong, Confident, Impactful
  // ============================================
  {
    id: "bold",
    name: "Bold",
    personality: "Strong, confident, impactful",
    palettes: [
      {
        id: "bold-p50",
        name: "Bold #1",
        colors: ["#FF5F01", "#1C1C1C", "#EDE3D7"],
      },
      {
        id: "bold-p51",
        name: "Bold #2",
        colors: ["#FFFFFF", "#000000", "#34C2DA", "#FD5401", "#FFEE15"],
      },
      {
        id: "bold-p52",
        name: "Bold #3",
        colors: ["#F1582C", "#FCFCF4", "#142E", "#FFFFFF", "#006EDE", "#FFBA1B"],
      },
      {
        id: "bold-p54",
        name: "Bold #4",
        colors: ["#F45243", "#23ACED", "#1746AB", "#F9F4E0", "#FBB90D"],
      },
      {
        id: "bold-p55",
        name: "Bold #5",
        colors: ["#000000", "#F4464A", "#F2F2F2", "#D9D9D9", "#B7B7B7", "#2B2B2B"],
      },
      {
        id: "bold-p56",
        name: "Bold #6",
        colors: ["#000000", "#FFBB00", "#FB0905", "#F5F5F5", "#FF6900", "#1C008B"],
      },
      {
        id: "bold-p57",
        name: "Bold #7",
        colors: ["#E01C2B", "#6F0E3C", "#FBA91D", "#F9E181", "#91CE9E", "#CEE9DD"],
      },
      {
        id: "bold-p58",
        name: "Bold #8",
        colors: ["#FF0064", "#FC91DC", "#FCCBDA", "#000000", "#6D91F8", "#8B0113", "#FF5346", "#FDE9DB"],
      },
      {
        id: "bold-p59",
        name: "Bold #9",
        colors: ["#FF6B37", "#FFA694", "#000000", "#2A40B4", "#31D262", "#C8E1BB", "#FABE06", "#FDF1DA"],
      },
      {
        id: "bold-p60",
        name: "Bold #10",
        colors: ["#F8BBD6", "#FFF2B0", "#C4F5BA", "#D1A3FF", "#B8EDFF", "#FF4724", "#FF9E2E", "#00A34F", "#A840FF", "#0069FF", "#8A1240", "#A65912", "#005229", "#7A1496", "#332E89"],
      },
      {
        id: "bold-p61",
        name: "Bold #11",
        colors: ["#24358C", "#18B9A4", "#FFBFA9", "#FE1B43", "#F9F0D9", "#CFF75A", "#0E1B53", "#0A5448", "#FC5F2C"],
      },
      {
        id: "bold-p62",
        name: "Bold #12",
        colors: ["#CCEE8", "#FFDBA7", "#FFF085", "#00C950", "#C6005C", "#FF6900", "#FFD414", "#004020", "#700D38", "#5C1F09", "#733E0A"],
      },
      {
        id: "bold-p63",
        name: "Bold #13",
        colors: ["#DFFAA0", "#96F7E4", "#FFD7A8", "#FFCFD6", "#B8EB4B", "#00D4BB", "#FE9A00", "#FF2159", "#004D38", "#005E58", "#805100", "#851042"],
      },
      {
        id: "bold-p64",
        name: "Bold #14",
        colors: ["#000000", "#00016B", "#FF4B00", "#E8CC1F", "#F5F5F5", "#EE3432", "#FF99A2", "#BEF0E0"],
      },
      {
        id: "bold-p65",
        name: "Bold #15",
        colors: ["#272222", "#F499B5", "#671F2A", "#DDD0BF", "#F26A2F"],
      },
      {
        id: "bold-p66",
        name: "Bold #16",
        colors: ["#FF96AA", "#FF6C5A", "#E3000F", "#820422", "#7E4124", "#DD9F25", "#FFCD1A", "#00B48E", "#005D4C", "#74A5EB", "#134094", "#071E4F"],
      },
      {
        id: "bold-p67",
        name: "Bold #17",
        colors: ["#C8EEFD", "#FBE4EC", "#FDEAB2", "#CFF8CE", "#FFFFFF", "#F2F2F2", "#0000AC", "#650180", "#FF9B24", "#128E14", "#E0E0E0", "#A4A4A4", "#7E7E7E", "#060756", "#3B014B", "#663E0E", "#073908", "#000000"],
      },
      {
        id: "bold-p68",
        name: "Bold #18",
        colors: ["#0E5E4C", "#89D1CE", "#511111", "#ED2126", "#F9EFE5", "#5E0B2B"],
      },
      {
        id: "bold-p70",
        name: "Bold #19",
        colors: ["#041B43", "#003B95", "#006CE4", "#57A6F4", "#CEE6FF", "#F0F6FF", "#411B01", "#923E01", "#F56700", "#F89249", "#FFDABF", "#FEF3EC", "#000000", "#FFB700", "#FFCA49", "#FFE9B5", "#FFFAEC", "#FFFFFF"],
      },
      {
        id: "bold-p71",
        name: "Bold #20",
        colors: ["#FFA500", "#FFE14F", "#00A4FF", "#31CC66", "#FFCAE7", "#AD85D1", "#FF7300", "#FFCE00", "#0061EF", "#01A652", "#FFA1CC", "#9E65C6", "#FFFFFF", "#F9F4F2", "#FC5500", "#FFB700", "#0040EA", "#02873E", "#FF76B8", "#F72900", "#FF9900", "#0000DB", "#0B662A", "#FF52A5", "#5F2B89", "#2D2C2B"],
      },
      {
        id: "bold-p72",
        name: "Bold #21",
        colors: ["#DCF3FA", "#E5FFE4", "#D9E6FF", "#FFF3B8", "#FFE4AB", "#FFD4C4", "#F7DEF4", "#EDD4FF", "#FFFFFF", "#7BD6DC", "#00C45B", "#476BFF", "#F2C200", "#FF7500", "#F03D0E", "#FF578B", "#BA5AED", "#939598", "#00524F", "#003A00", "#001146", "#785200", "#613400", "#7D1900", "#52112D", "#4D1773", "#292929"],
      },
      {
        id: "bold-p73",
        name: "Bold #22",
        colors: ["#E1FFD2", "#DCFCEB", "#D2F0FF", "#F2F1E8", "#D2D2D2", "#B4B9FF", "#F564B9", "#FFC8A0", "#FFF587", "#A5F087", "#AAF0DC", "#78CDFF", "#C3C5AF", "#949494", "#642D9B", "#EB3223", "#FA781E", "#FFD200", "#14A93E", "#008269", "#0072E2", "#A0AF96", "#767676", "#642350", "#9B3728", "#9B5F23", "#828200", "#0A6E2D", "#005F5F", "#193CA5", "#A06C53", "#2D2D2D", "#4B0F32", "#691E0F", "#5A320F", "#3C5000", "#003C1E", "#003232", "#0F2D69", "#9A824C"],
      },
      {
        id: "bold-p74",
        name: "Bold #23",
        colors: ["#D6D6F4", "#C9DEF4", "#C8E5E1", "#F2D9B2", "#FFD1DF", "#BBB6F4", "#9EC7F3", "#88CCC1", "#F3C586", "#F39EB8", "#8E87EE", "#6EB0F3", "#5BB8AE", "#F5B35B", "#F56F9B", "#7168EF", "#2B90F0", "#2EAC9B", "#F49E31", "#F5447F", "#534AEF", "#087CF4", "#009C86", "#F38B04", "#E00249", "#453CC4", "#0564C0", "#008871", "#DE8100", "#CE0441", "#36309B", "#004F9B", "#007262", "#C87300", "#AE0439", "#29226C", "#00396E", "#6F0227"],
      },
    ],
  },

  // ============================================
  // 05. MUTED - Soft, Subdued, Understated
  // ============================================
  {
    id: "muted",
    name: "Muted",
    personality: "Soft, subdued, understated",
    palettes: [
      {
        id: "muted-p76",
        name: "Muted #1",
        colors: ["#F1E6CA", "#8A9DDB", "#A9A135", "#345E50"],
      },
      {
        id: "muted-p77",
        name: "Muted #2",
        colors: ["#F5A5C3", "#205CD0", "#EFD46D", "#FDF1DB"],
      },
      {
        id: "muted-p78",
        name: "Muted #3",
        colors: ["#54312A", "#2D455A", "#D4ECEC"],
      },
      {
        id: "muted-p79",
        name: "Muted #4",
        colors: ["#191521", "#524F58", "#D9C2C0", "#F5F5F5", "#9F88C8", "#F4C2A6"],
      },
      {
        id: "muted-p80",
        name: "Muted #5",
        colors: ["#501548", "#9AD9E7", "#9BCF89", "#B99BC9", "#F79953", "#EFEFEF", "#F9B945"],
      },
      {
        id: "muted-p81",
        name: "Muted #6",
        colors: ["#FFFFFF", "#212121", "#D6DDD8", "#2961D9", "#E9FCBF"],
      },
      {
        id: "muted-p82",
        name: "Muted #7",
        colors: ["#000000", "#F6F7BD", "#FFD79A", "#F4F1EC", "#C3E9DE", "#DFDFFB"],
      },
      {
        id: "muted-p83",
        name: "Muted #8",
        colors: ["#000000", "#F6CDA7", "#FAB2A9", "#FDB1BA", "#F9F9F9", "#EBBCDB", "#B7E7CB", "#EEE89C"],
      },
      {
        id: "muted-p84",
        name: "Muted #9",
        colors: ["#000000", "#681338", "#F6B7FA", "#005A50", "#F9F9F9", "#B3F297", "#514439", "#F9E1D2"],
      },
      {
        id: "muted-p85",
        name: "Muted #10",
        colors: ["#F9F9F9", "#E7E7E7", "#CCD9E1", "#D4C6BB", "#292C3F"],
      },
      {
        id: "muted-p86",
        name: "Muted #11",
        colors: ["#000000", "#FFC76F", "#9FBC91", "#FCDC", "#80B1FE", "#36034E", "#809047", "#2F4038"],
      },
      {
        id: "muted-p88",
        name: "Muted #12",
        colors: ["#1A1E2A", "#2B66FF", "#45948C", "#DF5E42", "#F4F4F2", "#BDAC6A"],
      },
      {
        id: "muted-p89",
        name: "Muted #13",
        colors: ["#000000", "#E9E0C9", "#E1950E", "#CD90A0", "#D15710", "#1F7710"],
      },
      {
        id: "muted-p90",
        name: "Muted #14",
        colors: ["#9E6377", "#CD5E3E", "#EFE8A3", "#1F1F1F", "#8BAFE4", "#F8E2DA", "#FCFBF2", "#091650"],
      },
      {
        id: "muted-p91",
        name: "Muted #15",
        colors: ["#18204D", "#3C55CC", "#B8CED9", "#403E26", "#E5992E", "#EAE4C0"],
      },
      {
        id: "muted-p92",
        name: "Muted #16",
        colors: ["#000000", "#D9EAF0", "#9EB6D0", "#2A383F", "#555555", "#454330", "#A8A8A8", "#C4D9A9", "#EAE9E3", "#FBF6C1", "#88341E", "#D9612D", "#FFFFFF", "#FBD9DD"],
      },
      {
        id: "muted-p93",
        name: "Muted #17",
        colors: ["#F9593A", "#FC846D", "#FEDFD9", "#1F2823", "#808869", "#E0F5AD", "#EBF0E4"],
      },
      {
        id: "muted-p94",
        name: "Muted #18",
        colors: ["#FFAA4B", "#F15A22", "#D7EDE6", "#C7DFF4", "#5F465F", "#FFE898", "#D7F0E6", "#FFFFFF", "#000000"],
      },
      {
        id: "muted-p95",
        name: "Muted #19",
        colors: ["#152B1C", "#7269B2", "#2A2457", "#9CD696", "#31715A", "#DCD0FF"],
      },
      {
        id: "muted-p96",
        name: "Muted #20",
        colors: ["#0EDE0", "#E0E3E3", "#FFFFFF", "#000000", "#E54F3D", "#57B5D6", "#D63D8F", "#C4C454", "#5E0F0F", "#141F26", "#4D0D4D", "#243614"],
      },
      {
        id: "muted-p97",
        name: "Muted #21",
        colors: ["#FFF0F0", "#F8EDE2", "#E9FAFF", "#EDFEDD", "#FF90C0", "#FE6441", "#9AC2FD", "#C5F175", "#A5456E", "#A53504", "#3270CD", "#557D0D", "#40001C", "#4C0D00", "#0A0D23", "#243511"],
      },
      {
        id: "muted-p98",
        name: "Muted #22",
        colors: ["#F7BFD8", "#A5F7DE", "#F4C6A0", "#BBC8EE", "#FFFFFF", "#F2F2F2", "#FF7FD3", "#3ADF85", "#FF8E42", "#9D7DFF", "#E0E0E0", "#A4A4A4", "#7E7E7E", "#8C3C63", "#428478", "#6B4134", "#404E77", "#000000"],
      },
      {
        id: "muted-p99",
        name: "Muted #23",
        colors: ["#FFDCD2", "#F1F0FC", "#FBFDF2", "#FDF2F8", "#FFB9A6", "#E9E8FA", "#F3F8D7", "#F9D8EA", "#FF8A6A", "#B7B2F0", "#D7E779", "#EB7EB9", "#8D402A", "#59539D", "#5E672B", "#80385F", "#410E00", "#1B1466", "#2A3009", "#380923"],
      },
      {
        id: "muted-p100",
        name: "Muted #24",
        colors: ["#B6E5FF", "#FFDB7B", "#65C9A3", "#FF9F82", "#BAAAF9", "#F7F8FB", "#EEF0F4", "#A9ADB5", "#15246D", "#9E6405", "#017A4E", "#8E2F1A", "#452C6C", "#5E6167", "#1C1D1F"],
      },
      {
        id: "muted-p101",
        name: "Muted #25",
        colors: ["#C5F6E2", "#DCEEF9", "#F9E5DD", "#FEF6D0", "#47C28D", "#5EB3E4", "#E56D91", "#FDA05D", "#238074", "#6030BF", "#AB382E", "#CC5602", "#F4F4F4", "#191919", "#125F68", "#402D7F", "#722624", "#7E3807", "#003F5C", "#1F293F", "#38141A", "#30190B"],
      },
      {
        id: "muted-p102",
        name: "Muted #26",
        colors: ["#EED484", "#FDBE87", "#F8C1B8", "#EFBAE1", "#C7B2DE", "#A4C8E1", "#A1D6CA", "#DAAA00", "#DC582A", "#F2827F", "#F59BBB", "#6558B1", "#0084D4", "#00B388", "#4A412A", "#4F2910", "#651C32", "#3F2A56", "#00205B", "#003865", "#154734"],
      },
      {
        id: "muted-p103",
        name: "Muted #27",
        colors: ["#506624", "#316631", "#35855D", "#318C8C", "#205E80", "#2A3F80", "#3C3173", "#623980", "#8F4A8F", "#8F3F66", "#85313B", "#9C2C27", "#9C4427", "#9C6D2C", "#A6882E", "#9C922C", "#6E8C31", "#438C43", "#47B27D", "#36B2B2", "#2481B2", "#3B59B2", "#5747A6"],
      },
    ],
  },

  // ============================================
  // 06. EARTHY - Warm, Organic, Grounded
  // ============================================
  {
    id: "earthy",
    name: "Earthy",
    personality: "Warm, organic, grounded",
    palettes: [
      {
        id: "earthy-p105",
        name: "Earthy #1",
        colors: ["#E7D5B8", "#2F1E03", "#DE9987"],
      },
      {
        id: "earthy-p106",
        name: "Earthy #2",
        colors: ["#1A1A1A", "#C2431A", "#B98B1E", "#F6F3E1", "#34461D"],
      },
      {
        id: "earthy-p107",
        name: "Earthy #3",
        colors: ["#000000", "#F7F1EA", "#E79365", "#A9442D", "#9C9C63"],
      },
      {
        id: "earthy-p108",
        name: "Earthy #4",
        colors: ["#000000", "#673F23", "#89816E", "#C9C9BB", "#FFFFFF", "#0CA441"],
      },
      {
        id: "earthy-p109",
        name: "Earthy #5",
        colors: ["#000000", "#E7B097", "#CFCFAC", "#FFFFFF", "#C17858"],
      },
      {
        id: "earthy-p110",
        name: "Earthy #6",
        colors: ["#66321F", "#994729", "#F5A71D", "#B9D0ED", "#EDE5DD", "#FFFFFF"],
      },
      {
        id: "earthy-p111",
        name: "Earthy #7",
        colors: ["#FFFFFF", "#000000", "#CABDAA", "#5E3729", "#9B6855", "#E7DDD9"],
      },
      {
        id: "earthy-p112",
        name: "Earthy #8",
        colors: ["#F8F7E6", "#D7BE96", "#A1794F", "#7A4327", "#40261A", "#1D170F"],
      },
      {
        id: "earthy-p113",
        name: "Earthy #9",
        colors: ["#161616", "#EA8146", "#C0CDCC", "#F5F1EB", "#DBD3BD", "#988C2E"],
      },
      {
        id: "earthy-p114",
        name: "Earthy #10",
        colors: ["#E9D7BA", "#B78E6C", "#A08D20", "#EC8D00", "#E8654B"],
      },
      {
        id: "earthy-p115",
        name: "Earthy #11",
        colors: ["#093A30", "#799864", "#ACC390", "#CD6618", "#F2E7CE", "#FCC540", "#A8CAEC", "#A28BC0"],
      },
      {
        id: "earthy-p116",
        name: "Earthy #12",
        colors: ["#F5F3E7"],
      },
      {
        id: "earthy-p117",
        name: "Earthy #13",
        colors: ["#838E49", "#DBE1B0", "#545E7E", "#8EA1B4", "#C26B2A", "#A5947B", "#DAD2C4"],
      },
      {
        id: "earthy-p118",
        name: "Earthy #14",
        colors: ["#000000", "#C0B6A1", "#D7D1CC", "#FFFFFF", "#1E3645", "#42634A", "#ACC8BF", "#D5660F", "#F6C008"],
      },
      {
        id: "earthy-p119",
        name: "Earthy #15",
        colors: ["#000000", "#F5F5F5", "#F29799", "#ED792E", "#746338", "#C19C5B"],
      },
      {
        id: "earthy-p120",
        name: "Earthy #16",
        colors: ["#1C1C1C", "#F2EADF", "#D8CEBF", "#A0BABB", "#79966A", "#BD7032", "#4D4933"],
      },
      {
        id: "earthy-p121",
        name: "Earthy #17",
        colors: ["#E1F0F6", "#E4EFC1", "#FBF9E0", "#402913", "#99CCDC", "#618558", "#E3D9B0", "#7A5746", "#1F5A7A", "#3B4A39", "#A38F40", "#AA563C"],
      },
      {
        id: "earthy-p122",
        name: "Earthy #18",
        colors: ["#EDEF5B", "#798F4F", "#F1F1F1", "#EEDDCA", "#FAD88C", "#A75930", "#FFA15D"],
      },
      {
        id: "earthy-p123",
        name: "Earthy #19",
        colors: ["#30755C", "#1A3A22", "#4FAF64", "#E47520", "#E8C31B", "#824F3D", "#ECCB95", "#3A2037", "#2168A0"],
      },
      {
        id: "earthy-p124",
        name: "Earthy #20",
        colors: ["#141414", "#AB573D", "#7A5745", "#402912", "#A38F40", "#E3D980", "#D9D9D1", "#FAFAFA"],
      },
      {
        id: "earthy-p125",
        name: "Earthy #21",
        colors: ["#2E1E1F", "#776F4F", "#FE4914", "#C9C7B9", "#E27C3F", "#FFAA50", "#ECECDD", "#FFE393", "#316890", "#6A89A6"],
      },
      {
        id: "earthy-p126",
        name: "Earthy #22",
        colors: ["#E4DCC8", "#9FA094", "#F9C3A7", "#BA4C3E", "#853730", "#DFB28A", "#B4744C", "#884B25", "#F7BB66", "#E49926", "#B76C00", "#000000", "#B8AB84", "#817E4C", "#303320", "#A9BAB3", "#596B63", "#214743", "#9797BA", "#5E5A7A", "#372C41"],
      },
    ],
  },

  // ============================================
  // 07. ELEGANT - Refined, Sophisticated, Luxurious
  // ============================================
  {
    id: "elegant",
    name: "Elegant",
    personality: "Refined, sophisticated, luxurious",
    palettes: [
      {
        id: "elegant-p128",
        name: "Elegant #1",
        colors: ["#000000", "#FFFFFF", "#969538"],
      },
      {
        id: "elegant-p129",
        name: "Elegant #2",
        colors: ["#B8734C", "#F5F1EE", "#3C3C3A"],
      },
      {
        id: "elegant-p130",
        name: "Elegant #3",
        colors: ["#9B6946", "#B3906E", "#EAE4D4", "#2D2D2D"],
      },
      {
        id: "elegant-p131",
        name: "Elegant #4",
        colors: ["#2C2C2C", "#605C53", "#997D5B", "#F9F6F3"],
      },
      {
        id: "elegant-p132",
        name: "Elegant #5",
        colors: ["#00183A", "#F5F5C4", "#664C3A", "#D9D5CA", "#F5F1E9"],
      },
      {
        id: "elegant-p133",
        name: "Elegant #6",
        colors: ["#DFB254", "#005BC1", "#F8F6F3", "#2D2D2D"],
      },
      {
        id: "elegant-p134",
        name: "Elegant #7",
        colors: ["#F17657", "#EBEBCD", "#FAB9CA", "#3A1E0C", "#63673B", "#2E1319"],
      },
      {
        id: "elegant-p135",
        name: "Elegant #8",
        colors: ["#433011"],
      },
      {
        id: "elegant-p136",
        name: "Elegant #9",
        colors: ["#F4A6B6", "#E78B39", "#F5F2E1", "#0C435A", "#666F43"],
      },
      {
        id: "elegant-p137",
        name: "Elegant #10",
        colors: ["#FFFFFF", "#2D374B", "#433834", "#C8C8C8", "#BF845C"],
      },
      {
        id: "elegant-p138",
        name: "Elegant #11",
        colors: ["#BDB3A7", "#F8F7F4", "#2F2E2C", "#875F45", "#5B5545"],
      },
      {
        id: "elegant-p139",
        name: "Elegant #12",
        colors: ["#E8D1B6", "#F0E7D6", "#FFFFFF", "#E1E1E1", "#707070", "#000000"],
      },
      {
        id: "elegant-p140",
        name: "Elegant #13",
        colors: ["#555936", "#592C11", "#8D451D", "#DAD3C5", "#262626"],
      },
      {
        id: "elegant-p141",
        name: "Elegant #14",
        colors: ["#69634B", "#E5E3E0", "#3A3A33", "#947344", "#AF8071"],
      },
      {
        id: "elegant-p142",
        name: "Elegant #15",
        colors: ["#F7CEBD", "#FFA584", "#FFADB5", "#B5A573", "#212121"],
      },
      {
        id: "elegant-p143",
        name: "Elegant #16",
        colors: ["#000000", "#FFFFFF", "#F4F2EF", "#A59774", "#FFAD00"],
      },
      {
        id: "elegant-p144",
        name: "Elegant #17",
        colors: ["#003A46", "#346678", "#95A79C", "#E9E8E0", "#A67314"],
      },
      {
        id: "elegant-p145",
        name: "Elegant #18",
        colors: ["#D5D3C8", "#BA735A", "#5F6A6B", "#A28357", "#5C3827", "#262A29"],
      },
      {
        id: "elegant-p146",
        name: "Elegant #19",
        colors: ["#012B31", "#6E5C3B", "#BDBBFF", "#F9F9F7", "#CDEED3"],
      },
      {
        id: "elegant-p147",
        name: "Elegant #20",
        colors: ["#5B5532", "#9C9681", "#FEFAF0"],
      },
    ],
  },

  // ============================================
  // 08. PLAYFUL - Fun, Expressive, Whimsical
  // ============================================
  {
    id: "playful",
    name: "Playful",
    personality: "Fun, expressive, whimsical",
    palettes: [
      {
        id: "playful-p149",
        name: "Playful #1",
        colors: ["#262626", "#FFE600", "#FEFBE7", "#6FD5E2", "#C0CC7A"],
      },
      {
        id: "playful-p150",
        name: "Playful #2",
        colors: ["#9FE870", "#FFD7EF", "#A0E1E1", "#163300", "#320707", "#21231D"],
      },
      {
        id: "playful-p151",
        name: "Playful #3",
        colors: ["#000000", "#36B4E5", "#45D093", "#FFFFFF", "#ED8ECE"],
      },
      {
        id: "playful-p152",
        name: "Playful #4",
        colors: ["#282828", "#F37543", "#E5C83D", "#73C9BD", "#F1EEED", "#FBD5C6", "#F7EEC4", "#D6EEEA"],
      },
      {
        id: "playful-p153",
        name: "Playful #5",
        colors: ["#EBEBEB", "#55F8C7", "#FFF96B", "#FD8F57", "#A7A8AA", "#0A8874", "#171B21", "#A2A04D", "#AA6544"],
      },
      {
        id: "playful-p154",
        name: "Playful #6",
        colors: ["#0B262D", "#FDC999", "#F2E70C", "#0D4C46", "#1DBED5", "#DDEFE3", "#D7D1CB"],
      },
      {
        id: "playful-p155",
        name: "Playful #7",
        colors: ["#F5F5F5", "#002A2A", "#79BC16", "#004855", "#B2E9E6", "#FAE3E6"],
      },
      {
        id: "playful-p156",
        name: "Playful #8",
        colors: ["#4A1431", "#FF404E", "#FFCECD", "#FFA843", "#89D4B9", "#214535"],
      },
      {
        id: "playful-p157",
        name: "Playful #9",
        colors: ["#8DFF6C", "#56D2FF", "#FEB0ED", "#FBAD1B", "#016559", "#322E82", "#932741", "#9A3F03"],
      },
      {
        id: "playful-p158",
        name: "Playful #10",
        colors: ["#0A2926", "#898EFF", "#D8EB6A", "#ACAC", "#C4C7FF", "#ECF5B5", "#FFC4C4", "#E7E8FF", "#F7FBE1", "#FFE7E7"],
      },
      {
        id: "playful-p159",
        name: "Playful #11",
        colors: ["#FDD6DB", "#564402", "#D4F4B1", "#B8E2FA", "#49000B", "#123401", "#160853"],
      },
      {
        id: "playful-p160",
        name: "Playful #12",
        colors: ["#9DEAB2", "#EAF475", "#FFB8B2", "#015C65", "#B9DDFF", "#F2734A"],
      },
      {
        id: "playful-p161",
        name: "Playful #13",
        colors: ["#134F50", "#D5F1F2", "#CDB7FF", "#FDEEE7", "#FFFFFF", "#568E8F", "#D5EED8", "#741966", "#FFD662", "#000000"],
      },
      {
        id: "playful-p162",
        name: "Playful #14",
        colors: ["#CFFCB0", "#91DBDA", "#479FB0", "#FFDE9B", "#17EBA1"],
      },
      {
        id: "playful-p163",
        name: "Playful #15",
        colors: ["#6B402A", "#FF6338", "#87C431", "#FFA896", "#B6E6FA", "#FFFFFF", "#FFEA66"],
      },
      {
        id: "playful-p164",
        name: "Playful #16",
        colors: ["#EEBDFF", "#FDD2BF", "#DEF1C4", "#FFF4DC", "#E9EDF7", "#BDAA8C", "#732E4A", "#4D6625", "#F9E254", "#A4BDFF"],
      },
      {
        id: "playful-p165",
        name: "Playful #17",
        colors: ["#E2F1A2", "#FEA3B4", "#FEB297", "#03587D", "#6F2A62", "#FE6B57"],
      },
      {
        id: "playful-p166",
        name: "Playful #18",
        colors: ["#470B04", "#FAF4EE", "#FECB1B", "#CCD439", "#FF762C", "#CDB1F8", "#ED68C2"],
      },
      {
        id: "playful-p167",
        name: "Playful #19",
        colors: ["#59", "#FAFAE3", "#FDDB14"],
      },
      {
        id: "playful-p168",
        name: "Playful #20",
        colors: ["#FEA28B", "#1A365D", "#F8DF8D", "#265C4F", "#8FD8AB", "#542657"],
      },
      {
        id: "playful-p169",
        name: "Playful #21",
        colors: ["#FFF3E3", "#FFE8CD", "#FBDD89", "#DB8F58", "#AFC75B", "#83C5D0", "#DDC047", "#B495C9", "#93ADC7", "#DE8B8B", "#151515", "#FFFFFF"],
      },
      {
        id: "playful-p170",
        name: "Playful #22",
        colors: ["#EDFFE6", "#FBE1D2", "#FECCB8", "#FF9B74", "#E9EAFE", "#C8C8FE", "#8D8EFF", "#004654", "#FDF4DB", "#FFEBB4", "#FFDC33"],
      },
      {
        id: "playful-p171",
        name: "Playful #23",
        colors: ["#FFFFFF", "#C3F1A1", "#FFEBA2", "#D1EBFF", "#CDBCFC", "#F2EDE1", "#9EE778", "#FFD15B", "#6AB4F5", "#E98EC1", "#232420", "#1F5852", "#D8460B", "#0249AC", "#861A27"],
      },
      {
        id: "playful-p172",
        name: "Playful #24",
        colors: ["#052316", "#450414", "#FFBFBF", "#0D4029", "#FFEBEB", "#250A2D", "#009C52", "#F7BDFE", "#FDEBFF", "#1EC677", "#00464F", "#B0E9E5", "#CCF2D2", "#E5FFF9", "#BA4627", "#ECF9EE", "#FFD600", "#FDF8CB"],
      },
      {
        id: "playful-p173",
        name: "Playful #25",
        colors: ["#FFEEE5", "#FFF7E1", "#D9FFE1", "#C1CEFF", "#D6F", "#E1E5E9", "#750038", "#5B3700", "#004257", "#17215F", "#00598C", "#636C75"],
      },
      {
        id: "playful-p174",
        name: "Playful #26",
        colors: ["#3A1F18", "#77BAED", "#C6F1FD", "#C3D258", "#D8FE8B", "#F19B9C", "#F6C8E3", "#F3AB79", "#FBE7C3", "#D99FEB", "#EED5FA", "#FEF9F0", "#FFF964"],
      },
      {
        id: "playful-p175",
        name: "Playful #27",
        colors: ["#000000", "#9891FF", "#D2E534", "#89CDF3", "#FE7324", "#DDCDBF", "#4D4C51", "#B7B2FF", "#E0EE69", "#A2D8F5", "#FC975C", "#F1EAE4", "#9A98A1", "#D8D1FF", "#EEF69F", "#BBE2F7", "#F9BB95", "#F4EFEB", "#CDCBD0", "#E5E3FF", "#FCFFD4", "#D4EDF9", "#F7DFCD", "#F7F4F2"],
      },
    ],
  },

  // ============================================
  // 09. HERITAGE - Classic, Timeless, Established
  // ============================================
  {
    id: "heritage",
    name: "Heritage",
    personality: "Classic, timeless, established",
    palettes: [
      {
        id: "heritage-p177",
        name: "Heritage #1",
        colors: ["#EBEBE2", "#000000", "#CB4520", "#1B4150", "#BE9A37", "#364328"],
      },
      {
        id: "heritage-p178",
        name: "Heritage #2",
        colors: ["#000000", "#F6F3EE", "#B39262", "#54052B"],
      },
      {
        id: "heritage-p179",
        name: "Heritage #3",
        colors: ["#501D20", "#F4F1DE", "#D8C4A4", "#EE4037", "#4E632A", "#B9C6A3"],
      },
      {
        id: "heritage-p180",
        name: "Heritage #4",
        colors: ["#000000", "#EAE6E1", "#5C0D12", "#0B3452"],
      },
      {
        id: "heritage-p181",
        name: "Heritage #5",
        colors: ["#FE4535", "#082"],
      },
      {
        id: "heritage-p182",
        name: "Heritage #6",
        colors: ["#000000", "#193241", "#199191", "#194B1E", "#2D8264", "#BEC3B9", "#F0E6CD", "#501E2D", "#FFFFFF"],
      },
    ],
  },

  // ============================================
  // 10. RETRO - Nostalgic, Vintage-inspired
  // ============================================
  {
    id: "retro",
    name: "Retro",
    personality: "Nostalgic, vintage-inspired",
    palettes: [
      {
        id: "retro-p184",
        name: "Retro #1",
        colors: ["#E0B707", "#0547B5", "#F6F3F2", "#EC754A", "#FFB0B6", "#000000"],
      },
      {
        id: "retro-p185",
        name: "Retro #2",
        colors: ["#E3201B", "#FFB648", "#F8EBBE", "#5B2D27", "#1A5632"],
      },
      {
        id: "retro-p186",
        name: "Retro #3",
        colors: ["#FE6E5F", "#CCDAF6", "#CAF9A5", "#F9F253", "#562023", "#002732", "#263B29", "#5E5C21"],
      },
      {
        id: "retro-p187",
        name: "Retro #4",
        colors: ["#6F80D5", "#171E36", "#FFE190", "#9E8035", "#FE6D66", "#331A1F"],
      },
      {
        id: "retro-p188",
        name: "Retro #5",
        colors: ["#FFFFFF", "#000000", "#294FB0", "#058062", "#F8DF5D", "#FE9358", "#B5D3D3", "#EBCADB", "#203342", "#BFE982", "#EAE8DA", "#F8F7EE"],
      },
      {
        id: "retro-p189",
        name: "Retro #6",
        colors: ["#91A3CF", "#CCD982", "#FFA6EA", "#FF9340", "#3D38C0", "#15381D", "#991F5E", "#302A1D"],
      },
      {
        id: "retro-p190",
        name: "Retro #7",
        colors: ["#FFB3C3", "#FFF0DA", "#DEDEFF", "#CEFFE9", "#FF5149", "#F8BC38", "#9CA7EF", "#92AB9F", "#5B0336", "#A33C0E", "#32284D", "#043330"],
      },
      {
        id: "retro-p191",
        name: "Retro #8",
        colors: ["#FFFFFF", "#F2F2F2", "#7856FF", "#FF7557", "#80E1D9", "#F8BC38", "#E0E0E0", "#A4A4A4", "#7E7E7E", "#1B0B3B", "#5B0237", "#122E29", "#A33B16", "#000000"],
      },
    ],
  },

  // ============================================
  // 11. CLASH - Unexpected, Contrasting, Daring
  // ============================================
  {
    id: "clash",
    name: "Clash",
    personality: "Unexpected, contrasting, daring",
    palettes: [
      {
        id: "clash-p193",
        name: "Clash #1",
        colors: ["#EBEBEB", "#F1DA17", "#5D5404", "#FFF4ED", "#A7A8AA", "#F44214", "#171B21", "#CCDDFF", "#FFBD93"],
      },
      {
        id: "clash-p194",
        name: "Clash #2",
        colors: ["#8FF16B", "#106B7F", "#D5DABC", "#4B1F12"],
      },
      {
        id: "clash-p195",
        name: "Clash #3",
        colors: ["#00556B", "#FDFF00", "#4B0722"],
      },
      {
        id: "clash-p196",
        name: "Clash #4",
        colors: ["#FFBEDB", "#692358", "#3351E8", "#B89E11"],
      },
      {
        id: "clash-p197",
        name: "Clash #5",
        colors: ["#827F52", "#D7E0A5", "#E04E29", "#4C192F", "#C6BCFA"],
      },
      {
        id: "clash-p198",
        name: "Clash #6",
        colors: ["#ECE9E9", "#1D2121", "#B9ED00", "#7182CB", "#FF6716", "#CECECE"],
      },
      {
        id: "clash-p199",
        name: "Clash #7",
        colors: ["#490D44", "#FF5100", "#294718", "#F0DE00", "#E6D8C4", "#FF9D6B", "#656B20", "#B9D6FF"],
      },
      {
        id: "clash-p200",
        name: "Clash #8",
        colors: ["#493DEB", "#F2BDBF", "#766E1E", "#A2CBFB", "#FB5405", "#ADFA4A", "#E4E3DB", "#74373B", "#000000"],
      },
      {
        id: "clash-p201",
        name: "Clash #9",
        colors: ["#222025", "#E0DFBE"],
      },
      {
        id: "clash-p202",
        name: "Clash #10",
        colors: ["#231E1F", "#FF570E", "#FF8AD9", "#F9FAF1", "#ACB59C"],
      },
      {
        id: "clash-p203",
        name: "Clash #11",
        colors: ["#004DF2", "#1E2F2F", "#334F4F", "#5A8060", "#A5C9B3", "#DDD6D2", "#EFEFE8"],
      },
      {
        id: "clash-p204",
        name: "Clash #12",
        colors: ["#000000", "#520E0B", "#E8B2F5", "#F38536", "#CEAB53", "#4E3B13", "#F7F7F7", "#7AE377"],
      },
      {
        id: "clash-p205",
        name: "Clash #13",
        colors: ["#4D145A", "#005EA3", "#003C4D", "#4D6855", "#000000", "#FF6900", "#85754E", "#B5A992", "#00FFD9", "#FFFFFF"],
      },
    ],
  },

  // ============================================
  // 12. CORPORATE - Professional, Trustworthy, Structured
  // ============================================
  {
    id: "corporate",
    name: "Corporate",
    personality: "Professional, trustworthy, structured",
    palettes: [
      {
        id: "corporate-p207",
        name: "Corporate #1",
        colors: ["#0025FF", "#FF6600", "#41EAD4", "#F5F5F5", "#A0A0A0", "#6535FF", "#000000"],
      },
      {
        id: "corporate-p208",
        name: "Corporate #2",
        colors: ["#000000", "#5F715F", "#F23127", "#F2ECD2", "#8A9E45", "#816C57", "#FFFFFF", "#B4C6C0", "#3C3628"],
      },
      {
        id: "corporate-p209",
        name: "Corporate #3",
        colors: ["#CFD0D7", "#C9E000", "#9296A6", "#FF5C35", "#0D1639", "#B400FF", "#2373E1", "#0DD392", "#7DA1B1", "#C2B8B2"],
      },
      {
        id: "corporate-p210",
        name: "Corporate #4",
        colors: ["#FE6100", "#41DEB2", "#F2F2F2", "#D9D9D9", "#B7B7B7", "#2B2B2B"],
      },
      {
        id: "corporate-p211",
        name: "Corporate #5",
        colors: ["#5E003C", "#000000"],
      },
      {
        id: "corporate-p212",
        name: "Corporate #6",
        colors: ["#F1F6F4", "#114C5A", "#D9E8E3", "#FFC800", "#FF9932", "#172B36"],
      },
      {
        id: "corporate-p213",
        name: "Corporate #7",
        colors: ["#3E3BDD", "#C5D9CE", "#FFFBD2", "#000000", "#741C59", "#E6E0FF"],
      },
      {
        id: "corporate-p214",
        name: "Corporate #8",
        colors: ["#0F2830", "#014751", "#00D37F", "#AFF8C8", "#D2C4FB", "#FFEEBA"],
      },
      {
        id: "corporate-p215",
        name: "Corporate #9",
        colors: ["#FFFFFF", "#0F1F5A", "#DAF9FE", "#EB5350", "#2862E7", "#F6C3D6", "#EE7435", "#F4CFA5", "#F3BE4A", "#000000", "#FBECAB", "#225141", "#DCFFBF"],
      },
      {
        id: "corporate-p216",
        name: "Corporate #10",
        colors: ["#0E2823", "#005E5E", "#007673", "#1E988E", "#64CFBB", "#B4E1D7", "#FA5A4B", "#FFD9DC", "#FFEBF0", "#FFE380", "#FEEEA7", "#FFFAE6", "#C08A5F", "#DCB9A0", "#F0DCD0"],
      },
      {
        id: "corporate-p217",
        name: "Corporate #11",
        colors: ["#CCFF00", "#1C180D", "#8A8783", "#B4B1AB", "#D4D0C9", "#FFFFFF"],
      },
      {
        id: "corporate-p218",
        name: "Corporate #12",
        colors: ["#161616", "#FFFFFF", "#BCEFC4", "#FFCEDB", "#B6E4EF", "#F7F8A4", "#006716", "#BF0C2C", "#002C9E", "#C93D00"],
      },
      {
        id: "corporate-p219",
        name: "Corporate #13",
        colors: ["#FFA51E", "#FF55"],
      },
      {
        id: "corporate-p220",
        name: "Corporate #14",
        colors: ["#0D2631", "#FFF24A", "#666658", "#D7D5C7", "#F8F7F0", "#FFFFFF"],
      },
      {
        id: "corporate-p221",
        name: "Corporate #15",
        colors: ["#958FDC", "#07D3BA", "#D5B8D3", "#FFFFFF", "#EBE8E1", "#2B1D3C", "#06353D", "#D9254D", "#000000"],
      },
      {
        id: "corporate-p222",
        name: "Corporate #16",
        colors: ["#B2FF4D", "#005763", "#F1A3C7", "#12301F", "#24DED4", "#E30613"],
      },
      {
        id: "corporate-p223",
        name: "Corporate #17",
        colors: ["#0C0D11", "#FFFFFF", "#0144F5", "#ADCAEA"],
      },
      {
        id: "corporate-p224",
        name: "Corporate #18",
        colors: ["#242021", "#F471CF", "#118F6D", "#2DB6DF", "#F3EE81", "#EBE8E1", "#F73B30", "#FFFFFF", "#04462F", "#365CD1", "#FED541"],
      },
      {
        id: "corporate-p225",
        name: "Corporate #19",
        colors: ["#0F0A0A", "#0F2021", "#0F3538", "#496767", "#87A19E", "#FF6600", "#FF9200", "#FFBE00", "#F8E08E", "#FAFAF0"],
      },
      {
        id: "corporate-p226",
        name: "Corporate #20",
        colors: ["#000000", "#6D0B00", "#320067", "#002762", "#063723", "#7F6017", "#3B3428", "#525252", "#DB1600", "#6400CF", "#0056D6", "#0B6F46", "#BE8F22", "#766751", "#767575", "#FF5B49", "#9837FF", "#1C71EF", "#11A669", "#FDBF2D", "#A99981", "#DEDDDB", "#F5F5F4", "#FFD8D3", "#E6CFFF", "#CBE0FF", "#C6EADB", "#FFF0CD", "#EAE7E1", "#FFFFFF", "#FFF2F0", "#F7EFFF", "#EEF5FF", "#ECF8F3", "#FFFAEE", "#F8F7F5"],
      },
      {
        id: "corporate-p227",
        name: "Corporate #21",
        colors: ["#F8EFDF", "#FFFCD9", "#FFD9EA", "#F2D9FF", "#E5ECFF", "#DAF2E2", "#FFFFFF", "#F2F2F2", "#CBBFA8", "#FFFAB9", "#FFB9CA", "#E8B9FF", "#BFCFFF", "#B5F2CA", "#E6E6E6", "#CCCCCC", "#B8AB91", "#FFF799", "#FF99B2", "#DD99FF", "#99B2FF", "#91F2B2", "#B3B3B3", "#96886F", "#FFEC4D", "#FF6565", "#BF5AFD", "#5982FF", "#49E57D", "#999999", "#7F7F7F", "#7A6C50", "#FFE100", "#FF0040", "#AA00FF", "#0040FF", "#00D948", "#666666", "#4D4D4D", "#594D35", "#C0AB00", "#B2002D", "#6F00A6", "#002AA6", "#009331", "#333333", "#362D1B", "#807500", "#66001A", "#33004D", "#00134D", "#004D1A", "#191919", "#000000"],
      },
      {
        id: "corporate-p228",
        name: "Corporate #22",
        colors: ["#2C0E03", "#061923", "#141717", "#181614", "#13171A", "#4C1806", "#0A2D3D", "#242A", "#393D40", "#952F0C", "#225870", "#485453", "#585148", "#4F5255", "#BC3B0F", "#3F6E83", "#5B6B6A", "#70665B", "#64686B", "#E34712", "#5C8396", "#6E8280", "#887C6E", "#7A7E82", "#FB6632", "#799AA9", "#819A98", "#A19381", "#919698", "#FC906B", "#98B1BC", "#98B2B0", "#BAAB97", "#ACADAE", "#FDB59C", "#B7C9D1", "#B2CAC8", "#D4C3AC", "#C4C6C6", "#FEE0D5", "#DEE6EA", "#DCE7E6", "#F0E4D3", "#E5E6E6", "#FFF6F4", "#F8FAFA", "#F6F9F9", "#FBF8F3", "#F9F9F9"],
      },
      {
        id: "corporate-p229",
        name: "Corporate #23",
        colors: ["#000000", "#343322", "#193718", "#005454", "#00002E", "#28044A", "#400040", "#541600", "#401900", "#2A1003", "#393939", "#6C6837", "#2D712A", "#00B3B3", "#020267", "#571397", "#830083", "#AA2E00", "#833600", "#51230D", "#747474", "#A19A3A", "#3FA93B", "#00E7E7", "#0404AC", "#8A2BE2", "#C500C5", "#FF4500", "#C45600", "#793A1C", "#A8A8A8", "#CFC52C", "#51DA4C", "#00FFFF", "#0000FF", "#B161FD"],
      },
    ],
  },
];

// Helper to get all palettes as a flat array
export const getAllPalettes = (): Palette[] => {
  return PALETTE_SECTIONS.flatMap(section => section.palettes);
};

// Helper to get palette by ID
export const getPaletteById = (paletteId: string): Palette | undefined => {
  for (const section of PALETTE_SECTIONS) {
    const palette = section.palettes.find(p => p.id === paletteId);
    if (palette) return palette;
  }
  return undefined;
};

// Helper to get section by palette ID
export const getSectionByPaletteId = (paletteId: string): PaletteSection | undefined => {
  return PALETTE_SECTIONS.find(section =>
    section.palettes.some(p => p.id === paletteId)
  );
};

// Total count
export const TOTAL_PALETTE_COUNT = PALETTE_SECTIONS.reduce(
  (sum, section) => sum + section.palettes.length,
  0
);
