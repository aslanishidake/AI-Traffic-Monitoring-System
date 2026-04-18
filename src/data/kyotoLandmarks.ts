// 京都市の主要ランドマークと観光スポット
// Kyoto Major Landmarks and Tourist Attractions

export interface Landmark {
  name: string; // 日本語名称
  nameEn?: string; // 英語名称（参考用）
  type: 'temple' | 'shrine' | 'castle' | 'station' | 'scenic' | 'museum' | 'marketplace' | 'university' | 'river' | 'tower'; // 種類
  coordinates: [number, number]; // [経度, 緯度]
  description?: string; // 説明
  district?: string; // 所在区
}

export const kyotoLandmarks: Landmark[] = [
  // 寺院 (Temples)
  {
    name: '金閣寺',
    nameEn: 'Kinkaku-ji',
    type: 'temple',
    coordinates: [135.7292, 35.0394],
    description: '正式名称は鹿苑寺。金箔で覆われた三層の楼閣が有名',
    district: '北区'
  },
  {
    name: '銀閣寺',
    nameEn: 'Ginkaku-ji',
    type: 'temple',
    coordinates: [135.7983, 35.0270],
    description: '正式名称は慈照寺。わび・さびの美を体現',
    district: '左京区'
  },
  {
    name: '清水寺',
    nameEn: 'Kiyomizu-dera',
    type: 'temple',
    coordinates: [135.7850, 34.9949],
    description: '音羽山の中腹に建つ歴史的な寺院。清水の舞台で有名',
    district: '東山区'
  },
  {
    name: '東寺',
    nameEn: 'To-ji Temple',
    type: 'temple',
    coordinates: [135.7476, 34.9804],
    description: '五重塔が京都のシンボル。高さ約55メートル',
    district: '南区'
  },
  {
    name: '龍安寺',
    nameEn: 'Ryoan-ji',
    type: 'temple',
    coordinates: [135.7183, 35.0345],
    description: '石庭で世界的に有名な禅寺',
    district: '右京区'
  },
  // {
  //   name: '三十三間堂',
  //   nameEn: 'Sanjusangendo',
  //   type: 'temple',
  //   coordinates: [135.7716, 34.9880],
  //   description: '1001体の千手観音像が並ぶ壮観な寺院',
  //   district: '東山区'
  // },
  {
    name: '南禅寺',
    nameEn: 'Nanzen-ji',
    type: 'temple',
    coordinates: [135.7936, 35.0115],
    description: '京都五山の最高位。水路閣が有名',
    district: '左京区'
  },
  // {
  //   name: '知恩院',
  //   nameEn: 'Chion-in',
  //   type: 'temple',
  //   coordinates: [135.7824, 35.0055],
  //   description: '浄土宗総本山。日本最大級の三門',
  //   district: '東山区'
  // },
  {
    name: '東福寺',
    nameEn: 'Tofuku-ji',
    type: 'temple',
    coordinates: [135.7738, 34.9766],
    description: '紅葉の名所。通天橋が有名',
    district: '東山区'
  },
  {
    name: '建仁寺',
    nameEn: 'Kennin-ji',
    type: 'temple',
    coordinates: [135.7744, 35.0014],
    description: '京都最古の禅寺。風神雷神図が有名',
    district: '東山区'
  },
  {
    name: '天龍寺',
    nameEn: 'Tenryu-ji',
    type: 'temple',
    coordinates: [135.6730, 35.0156],
    description: '嵐山の世界遺産。曹源池庭園が美しい',
    district: '右京区'
  },
  {
    name: '仁和寺',
    nameEn: 'Ninna-ji',
    type: 'temple',
    coordinates: [135.7137, 35.0307],
    description: '世界遺産。御室桜で有名',
    district: '右京区'
  },
  // {
  //   name: '高台寺',
  //   nameEn: 'Kodai-ji',
  //   type: 'temple',
  //   coordinates: [135.7810, 35.0009],
  //   description: '豊臣秀吉の正室ねねゆかりの寺',
  //   district: '東山区'
  // },
  {
    name: '永観堂',
    nameEn: 'Eikando',
    type: 'temple',
    coordinates: [135.7946, 35.0149],
    description: '紅葉の永観堂として有名',
    district: '左京区'
  },
  {
    name: '醍醐寺',
    nameEn: 'Daigo-ji',
    type: 'temple',
    coordinates: [135.8211, 34.9512],
    description: '世界遺産。桜の名所',
    district: '伏見区'
  },

  // 神社 (Shrines)
  {
    name: '伏見稲荷大社',
    nameEn: 'Fushimi Inari Taisha',
    type: 'shrine',
    coordinates: [135.7727, 34.9671],
    description: '千本鳥居で有名な稲荷神社の総本宮',
    district: '伏見区'
  },
  {
    name: '八坂神社',
    nameEn: 'Yasaka Shrine',
    type: 'shrine',
    coordinates: [135.7785, 35.0036],
    description: '祇園祭で知られる京都を代表する神社',
    district: '東山区'
  },
  {
    name: '平安神宮',
    nameEn: 'Heian Shrine',
    type: 'shrine',
    coordinates: [135.7828, 35.0162],
    description: '平安京遷都1100年を記念して創建された神社',
    district: '左京区'
  },
  {
    name: '北野天満宮',
    nameEn: 'Kitano Tenmangu',
    type: 'shrine',
    coordinates: [135.7354, 35.0311],
    description: '学問の神様・菅原道真を祀る天満宮の総本社',
    district: '上京区'
  },
  {
    name: '下鴨神社',
    nameEn: 'Shimogamo Shrine',
    type: 'shrine',
    coordinates: [135.7726, 35.0387],
    description: '正式名称は賀茂御祖神社。世界遺産',
    district: '左京区'
  },
  {
    name: '上賀茂神社',
    nameEn: 'Kamigamo Shrine',
    type: 'shrine',
    coordinates: [135.7526, 35.0603],
    description: '正式名称は賀茂別雷神社。京都最古の神社の一つ',
    district: '北区'
  },
  {
    name: '貴船神社',
    nameEn: 'Kifune Shrine',
    type: 'shrine',
    coordinates: [135.7625, 35.1216],
    description: '水の神様を祀る。縁結びの名所',
    district: '左京区'
  },
  {
    name: '晴明神社',
    nameEn: 'Seimei Shrine',
    type: 'shrine',
    coordinates: [135.7551, 35.0304],
    description: '陰陽師安倍晴明を祀る神社',
    district: '上京区'
  },
  {
    name: '松尾大社',
    nameEn: 'Matsuo Taisha',
    type: 'shrine',
    coordinates: [135.6864, 35.0031],
    description: '酒造りの神様。京都最古級の神社',
    district: '西京区'
  },
  // {
  //   name: '安井金比羅宮',
  //   nameEn: 'Yasui Konpiragu',
  //   type: 'shrine',
  //   coordinates: [135.7782, 35.0025],
  //   description: '縁切り・縁結びの神社',
  //   district: '東山区'
  // },

  // 城・宮殿 (Castles & Palaces)
  {
    name: '二条城',
    nameEn: 'Nijo Castle',
    type: 'castle',
    coordinates: [135.7481, 35.0142],
    description: '徳川家康が築いた江戸幕府の京都拠点。世界遺産',
    district: '中京区'
  },
  {
    name: '京都御所',
    nameEn: 'Kyoto Imperial Palace',
    type: 'castle',
    coordinates: [135.7625, 35.0253],
    description: '明治維新まで天皇の居所だった御所',
    district: '上京区'
  },

  // 交通拠点 (Transportation Hubs)
  {
    name: '京都駅',
    nameEn: 'Kyoto Station',
    type: 'station',
    coordinates: [135.7588, 34.9857],
    description: '京都の玄関口。現代建築の駅ビル',
    district: '下京区'
  },
  // {
  //   name: '四条駅',
  //   nameEn: 'Shijo Station',
  //   type: 'station',
  //   coordinates: [135.7594, 35.0053],
  //   description: '繁華街の中心。烏丸線と東西線の乗換駅',
  //   district: '下京区'
  // },
  // {
  //   name: '北大路駅',
  //   nameEn: 'Kitaoji Station',
  //   type: 'station',
  //   coordinates: [135.7564, 35.0468],
  //   description: '北部の交通拠点',
  //   district: '北区'
  // },
  {
    name: '山科駅',
    nameEn: 'Yamashina Station',
    type: 'station',
    coordinates: [135.8177, 34.9787],
    description: '東部の交通拠点。JR・京阪・地下鉄',
    district: '山科区'
  },

  // 景勝地 (Scenic Spots)
  {
    name: '嵐山',
    nameEn: 'Arashiyama',
    type: 'scenic',
    coordinates: [135.6686, 35.0094],
    description: '渡月橋と竹林の道で有名な観光地',
    district: '右京区'
  },
  {
    name: '哲学の道',
    nameEn: 'Philosopher\'s Path',
    type: 'scenic',
    coordinates: [135.7952, 35.0226],
    description: '桜並木が美しい散策路',
    district: '左京区'
  },
  // {
  //   name: '祇園',
  //   nameEn: 'Gion',
  //   type: 'marketplace',
  //   coordinates: [135.7756, 35.0033],
  //   description: '京都を代表する花街',
  //   district: '東山区'
  // },
  {
    name: '鴨川',
    nameEn: 'Kamo River',
    type: 'river',
    coordinates: [135.7701, 35.0099],
    description: '京都市内を南北に流れる代表的な河川',
    district: '中京区'
  },
  {
    name: '京都タワー',
    nameEn: 'Kyoto Tower',
    type: 'tower',
    coordinates: [135.7590, 34.9876],
    description: '京都駅前のランドマークタワー',
    district: '下京区'
  },
  // {
  //   name: '四条河原町',
  //   nameEn: 'Shijo Kawaramachi',
  //   type: 'marketplace',
  //   coordinates: [135.7688, 35.0047],
  //   description: '京都一の繁華街',
  //   district: '下京区'
  // },
  {
    name: '錦市場',
    nameEn: 'Nishiki Market',
    type: 'marketplace',
    coordinates: [135.7637, 35.0050],
    description: '京の台所と呼ばれる商店街',
    district: '中京区'
  },
  {
    name: '先斗町',
    nameEn: 'Pontocho',
    type: 'marketplace',
    coordinates: [135.7697, 35.0057],
    description: '鴨川沿いの風情ある花街',
    district: '中京区'
  },
  {
    name: '京都大学',
    nameEn: 'Kyoto University',
    type: 'university',
    coordinates: [135.7808, 35.0263],
    description: '日本を代表する国立大学',
    district: '左京区'
  },

  // 博物館・文化施設 (Museums)
  {
    name: '京都国立博物館',
    nameEn: 'Kyoto National Museum',
    type: 'museum',
    coordinates: [135.7726, 34.9878],
    description: '京都の文化財を展示する国立博物館',
    district: '東山区'
  },
  {
    name: '京都市美術館',
    nameEn: 'Kyoto City Museum',
    type: 'museum',
    coordinates: [135.7813, 35.0141],
    description: '京都を代表する美術館',
    district: '左京区'
  },
  // {
  //   name: '京都鉄道博物館',
  //   nameEn: 'Kyoto Railway Museum',
  //   type: 'museum',
  //   coordinates: [135.7457, 34.9877],
  //   description: '日本最大級の鉄道博物館',
  //   district: '下京区'
  // },
  {
    name: '京都水族館',
    nameEn: 'Kyoto Aquarium',
    type: 'museum',
    coordinates: [135.7516, 34.9872],
    description: '梅小路公園内の都市型水族館',
    district: '下京区'
  }
];

// ランドマークタイプ別の表示設定（使用 SVG 图标）
export const landmarkStyles = {
  temple: {
    color: '#00d4ff',
    icon: 'temple-outline.svg',
    symbolSize: 20,
    label: '寺'
  },
  shrine: {
    color: '#00d4ff',
    icon: 'shinto-shrine.svg',
    symbolSize: 20,
    label: '神社'
  },
  castle: {
    color: '#00d4ff',
    icon: 'japanese-castle.svg',
    symbolSize: 20,
    label: '城'
  },
  station: {
    color: '#00d4ff',
    icon: 'train-station.svg',
    symbolSize: 20,
    label: '駅'
  },
  scenic: {
    color: '#00d4ff',
    icon: 'mountain.svg',
    symbolSize: 20,
    label: '景勝地'
  },
  university: {
    color: '#00d4ff',
    icon: 'university.svg',
    symbolSize: 20,
    label: '大学'
  },
  marketplace: {
    color: '#00d4ff',
    icon: 'marketplace.svg',
    symbolSize: 20,
    label: '市場'
  },
  river:{
    color: '#00d4ff',
    icon: 'river.svg',
    symbolSize: 20,
    label: '川'
  },
  tower: {
    color: '#00d4ff',
    icon: 'tower.svg',
    symbolSize: 20,
    label: '塔'
  },
  museum: {
    color: '#00d4ff',
    icon: 'museum.svg',
    symbolSize: 20,
    label: '博物館'
  }
};

export default kyotoLandmarks;

