import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { kyotoLandmarks } from '../data/kyotoLandmarks'


// SVG 图标路径（直接使用路径字符串）
const templeIcon = '/src/assets/icons/temple-outline.svg'
const shrineIcon = '/src/assets/icons/shinto-shrine.svg'
const castleIcon = '/src/assets/icons/japanese-castle.svg'
const stationIcon = '/src/assets/icons/train-station.svg'
const museumIcon = '/src/assets/icons/museum.svg'
const mountainIcon = '/src/assets/icons/mountain.svg'
const riverIcon = '/src/assets/icons/river.svg'
const towerIcon = '/src/assets/icons/tower.svg'
const marketplaceIcon = '/src/assets/icons/marketplace.svg'
const universityIcon = '/src/assets/icons/university.svg'

interface MapLeafletProps {
  darkMode?: boolean
  onMapLoad?: (map: L.Map) => void
}

// マップタイルURL
const MAP_TILES = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
}

// Landmark 类型对应的图标映射
const LANDMARK_ICONS = {
  temple: templeIcon,
  shrine: shrineIcon,
  castle: castleIcon,
  station: stationIcon,
  museum: museumIcon,
  river: riverIcon,
  tower: towerIcon,
  university: universityIcon,
  marketplace: marketplaceIcon,
  scenic: mountainIcon, // 默认使用山图标，后面会根据具体景点调整
}

// 创建自定义图标
function createCustomIcon(iconUrl: string, size: [number, number] = [32, 32]) {
  return L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  })
}

function MapLeaflet({ darkMode = true, onMapLoad }: MapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const roadLayersRef = useRef<L.Polyline[]>([])
  const landmarkMarkersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // 京都市中心座標
    const kyotoCenter: [number, number] = [35.0116, 135.7681]

    // マップ初期化
    const map = L.map(mapContainerRef.current, {
      center: kyotoCenter,
      zoom: 13,
      zoomControl: true,
    })

    // 初期タイルレイヤー追加
    const tileConfig = darkMode ? MAP_TILES.dark : MAP_TILES.light
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    tileLayerRef.current = tileLayer

    // 道路レイヤー用のカスタムペインを作成（最上位表示）
    map.createPane('roadPane')
    const pane = map.getPane('roadPane')
    if (pane) {
      pane.style.zIndex = '650' // タイルより上、マーカーより下
    }

    // 道路レイヤーを追加
    // const roadLayers = kyotoMainRoads.map((road) => {
    //   const color = ROAD_COLORS[road.status]

    //   // coordinates は [lng, lat] 形式なので、Leaflet の [lat, lng] に変換
    //   const latLngs = road.coordinates.map(coord => [coord[1], coord[0]] as [number, number])

    //   const polyline = L.polyline(latLngs, {
    //     color: color,
    //     weight: 8,
    //     opacity: 0.95,
    //     pane: 'roadPane',
    //     smoothFactor: 1,
    //     lineCap: 'round',
    //     lineJoin: 'round',
    //   }).addTo(map)

    //   // ポップアップを追加
    //   polyline.bindPopup(`
    //     <div style="font-family: sans-serif; min-width: 150px;">
    //       <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${road.name}</h3>
    //       <div style="font-size: 12px; color: #666;">
    //         <p style="margin: 4px 0;">状態: <strong style="color: ${color};">${getStatusText(road.status)}</strong></p>
    //         <p style="margin: 4px 0;">平均速度: <strong>${road.speed} km/h</strong></p>
    //       </div>
    //     </div>
    //   `)

    //   return polyline
    // })

    // roadLayersRef.current = roadLayers

    // 添加 landmark 标记
    const landmarkMarkers = kyotoLandmarks.map((landmark) => {
      const iconUrl = LANDMARK_ICONS[landmark.type]
      console.log('Creating marker for', landmark.name, 'with icon:', iconUrl)
      const icon = createCustomIcon(iconUrl, [28, 28])

      // coordinates 是 [经度, 纬度]，Leaflet 需要 [纬度, 经度]
      const marker = L.marker([landmark.coordinates[1], landmark.coordinates[0]], {
        icon,
        title: landmark.name,
      }).addTo(map)

      // 添加弹窗信息
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${landmark.name}</h3>
          ${landmark.nameEn ? `<p style="margin: 4px 0; font-size: 12px; color: #888;">${landmark.nameEn}</p>` : ''}
          <div style="font-size: 13px; color: #666; margin-top: 8px;">
            ${landmark.description ? `<p style="margin: 4px 0;">${landmark.description}</p>` : ''}
            ${landmark.district ? `<p style="margin: 4px 0;"><strong>所在地:</strong> ${landmark.district}</p>` : ''}
          </div>
        </div>
      `)

      return marker
    })

    landmarkMarkersRef.current = landmarkMarkers

    if (onMapLoad) {
      onMapLoad(map)
    }

    // クリーンアップ
    return () => {
      // roadLayers.forEach(layer => map.removeLayer(layer))
      landmarkMarkers.forEach(marker => map.removeLayer(marker))
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
      roadLayersRef.current = []
      landmarkMarkersRef.current = []
    }
  }, [onMapLoad])

  // // 状態テキストを取得
  // function getStatusText(status: RoadStatus): string {
  //   switch (status) {
  //     case 'smooth': return '通行可能'
  //     case 'slow': return '混雑'
  //     case 'congested': return '渋滞'
  //   }
  // }

  // ダークモード切り替え
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return

    // 古いタイルレイヤーを削除
    mapRef.current.removeLayer(tileLayerRef.current)

    // 新しいタイルレイヤーを追加
    const tileConfig = darkMode ? MAP_TILES.dark : MAP_TILES.light
    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current)

    tileLayerRef.current = newTileLayer
  }, [darkMode])

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default MapLeaflet
