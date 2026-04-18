import { useEffect, useState } from 'react'
import '../styles/LogisticsDashboard.css'
// @ts-ignore
import kyotoRoadsComplete from '../assets/kyoto_roads_complete.json'
import { kyotoLandmarks, landmarkStyles } from '../data/kyotoLandmarks'

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

function LogisticsDashboard() {
  const [enlargedVideo, setEnlargedVideo] = useState<string | null>(null)
  useEffect(() => {
    // 保存原始字体大小
    const originalFontSize = document.documentElement.style.fontSize

    // 初始化 rem 适配
    const initRem = () => {
      const docEl = document.documentElement
      const clientWidth = docEl.clientWidth
      if (!clientWidth) return
      if (clientWidth >= 1920) {
        docEl.style.fontSize = '100px'
      } else {
        docEl.style.fontSize = 100 * (clientWidth / 1920) + 'px'
      }
    }

    initRem()
    window.addEventListener('resize', initRem)

    // 设置页面可见性
    const timer1 = setTimeout(() => {
      document.body.style.visibility = 'visible'
    }, 100)

    // 初始化左下角京都区域地图（小地图）
    const initKyotoDistrictMap = async () => {
      try {
        const echarts = (window as any).echarts
        if (!echarts) {
          console.error('✗ ECharts未加载')
          return
        }

        console.log('開始加載京都区域データ...')
        
        // 加载京都市区域GeoJSON数据
        const response = await fetch('/src/assets/kyoto.geojson')
        if (!response.ok) {
          console.error('✗ kyoto.geojson読み込み失敗:', response.status)
          return
        }
        
        const kyotoGeoJson = await response.json()

        if (!kyotoGeoJson || !kyotoGeoJson.features) {
          console.error('✗ 京都市区域データが見つかりません')
          console.log('kyotoGeoJson:', kyotoGeoJson)
          return
        }
        
        console.log('✓ 京都区域データ読み込み完了:', kyotoGeoJson.features.length, '個の区域')
        
        // 打印前3个区域的名称，用于验证
        console.log('区域名称示例:')
        kyotoGeoJson.features.slice(0, 3).forEach((feature: any, index: number) => {
          console.log(`  ${index + 1}. N03_004="${feature.properties.N03_004}", name="${feature.properties.name || 'なし'}"`)
        })

        // 计算地图边界
        let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999
        kyotoGeoJson.features.forEach((feature: any) => {
          const getCoords = (geometry: any): number[][] => {
            if (geometry.type === 'MultiPolygon') {
              const coords: number[][] = []
              geometry.coordinates.forEach((polygon: any) => {
                polygon.forEach((ring: any) => {
                  coords.push(...ring)
                })
              })
              return coords
            } else if (geometry.type === 'Polygon') {
              const coords: number[][] = []
              geometry.coordinates.forEach((ring: any) => {
                coords.push(...ring)
              })
              return coords
            }
            return []
          }
          
          const coords = getCoords(feature.geometry)
          coords.forEach((coord: number[]) => {
            minLon = Math.min(minLon, coord[0])
            maxLon = Math.max(maxLon, coord[0])
            minLat = Math.min(minLat, coord[1])
            maxLat = Math.max(maxLat, coord[1])
          })
        })
        
        const centerLon = (minLon + maxLon) / 2
        const centerLat = (minLat + maxLat) / 2
        
        console.log('地図境界情報:')
        console.log(`  経度範囲: ${minLon.toFixed(3)} ~ ${maxLon.toFixed(3)}`)
        console.log(`  緯度範囲: ${minLat.toFixed(3)} ~ ${maxLat.toFixed(3)}`)
        console.log(`  計算された中心: [${centerLon.toFixed(3)}, ${centerLat.toFixed(3)}]`)
        console.log(`  使用する中心: [135.720, 35.100] (上方の遮蔽を避けるため調整済み)`)
        
        // 注册京都市区域地图，指定名称字段
        echarts.registerMap('京都市区域', kyotoGeoJson, {
          // 指定使用N03_004字段作为区域名称
          nameProperty: 'N03_004'
        })

        // 获取左下角地图容器
        const districtMapContainer = document.getElementById('gdMap')
        if (!districtMapContainer) {
          console.error('✗ 区域地図コンテナが見つかりません (gdMap)')
          return
        }

        console.log('✓ gdMapコンテナ取得成功:', districtMapContainer)
        console.log('gdMapコンテナサイズ:', {
          width: districtMapContainer.offsetWidth,
          height: districtMapContainer.offsetHeight,
          display: window.getComputedStyle(districtMapContainer).display
        })
        
        const districtChart = echarts.init(districtMapContainer)
        console.log('✓ 左下角EChartsインスタンス初期化成功')

        // 配置京都区域地图
        const districtMapOption = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            formatter: '{b}',  // 只显示区域名称
            backgroundColor: 'rgba(0, 20, 40, 0.9)',
            borderColor: '#00d4ff',
            borderWidth: 2,
            textStyle: {
              color: '#00f2ff',
              fontSize: 14,
              fontWeight: 'bold'
            },
            padding: [10, 15]
          },
          visualMap: {
            show: false,
            min: 0,
            max: 1000,
            inRange: {
              color: ['#0a2540', '#0c5a8a', '#00a8e8', '#00d4ff', '#00f2ff']
            }
          },
          series: [
            {
              name: '京都市区域交通データ',
              type: 'map',
              map: '京都市区域',
              roam: true,
              selectedMode: 'single',  // 启用单选模式，点击区域会保持高亮
              zoom: 1.25,  // 减小缩放，让地图周围有更多边距
              center: [135.72, 35.10],  // 向上调整中心点，避免上方被遮挡
              scaleLimit: {
                min: 0.8,
                max: 5
              },
              aspectScale: 0.75,  // 调整纵横比
              label: {
                show: true,
                color: '#ffffff',
                fontSize: 9,
                fontWeight: 'bold'
              },
              emphasis: {
                label: {
                  show: true,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 'bold'
                },
                itemStyle: {
                  areaColor: '#00d4ff',
                  borderColor: '#00f2ff',
                  borderWidth: 3,
                  shadowColor: 'rgba(0, 242, 255, 0.9)',
                  shadowBlur: 20
                }
              },
              select: {
                label: {
                  show: true,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 'bold'
                },
                itemStyle: {
                  areaColor: '#00a8e8',
                  borderColor: '#00f2ff',
                  borderWidth: 2
                }
              },
              itemStyle: {
                areaColor: '#0a3d62',
                borderColor: '#00d4ff',
                borderWidth: 1,
                shadowColor: 'rgba(0, 212, 255, 0.3)',
                shadowBlur: 3
              },
              data: [
                { name: '北区', value: 850 },
                { name: '上京区', value: 920 },
                { name: '左京区', value: 880 },
                { name: '中京区', value: 1000 },
                { name: '東山区', value: 780 },
                { name: '下京区', value: 950 },
                { name: '南区', value: 820 },
                { name: '右京区', value: 760 },
                { name: '伏見区', value: 890 },
                { name: '山科区', value: 720 },
                { name: '西京区', value: 800 }
              ],
              // 明确指定名称映射字段
              nameMap: {
                '北区': '北区',
                '上京区': '上京区',
                '左京区': '左京区',
                '中京区': '中京区',
                '東山区': '東山区',
                '下京区': '下京区',
                '南区': '南区',
                '右京区': '右京区',
                '伏見区': '伏見区',
                '山科区': '山科区',
                '西京区': '西京区'
              }
            }
          ]
        }

        districtChart.setOption(districtMapOption)
        
        // 添加鼠标悬停事件监听 - 显示区域名称
        districtChart.on('mouseover', (params: any) => {
          if (params.componentType === 'series' && params.seriesType === 'map') {
            console.log('→ マウスオーバー:', params.name)
          }
        })
        
        // 添加点击事件监听 - 点击区域时更新中间地图
        districtChart.on('click', (params: any) => {
          if (params.componentType === 'series' && params.seriesType === 'map') {
            const districtName = params.name
            console.log('✓ 区域クリック:', districtName)
            
            // TODO: 后期实现 - 更新中间地图以显示该区域的详细道路
            // 可以通过筛选道路数据或调整地图中心和缩放来实现
            // 示例思路：
            // 1. 根据区域名称筛选该区域内的道路数据
            // 2. 或者调整中间地图的中心点和缩放级别聚焦到该区域
            console.log('→ 将来の実装: 中央地図を', districtName, 'の詳細に更新')
            
            // 保存当前选中的区域，供后续使用
            ;(window as any).selectedDistrict = districtName
          }
        })
        
        console.log('✓ setOption完了')
        console.log('地図設定:', {
          type: districtMapOption.series[0].type,
          map: districtMapOption.series[0].map,
          zoom: districtMapOption.series[0].zoom,
          center: districtMapOption.series[0].center,
          dataCount: districtMapOption.series[0].data.length
        })
        
        // 强制resize确保显示
        setTimeout(() => {
          districtChart.resize()
          console.log('resize完了 (左下角地図)')
        }, 100)
        
        // 额外延迟确保渲染
        setTimeout(() => {
          const instance = echarts.getInstanceByDom(districtMapContainer)
          if (instance) {
            console.log('✓ 左下角地図インスタンス確認OK')
            console.log('✓ クリックイベント登録済み')
          } else {
            console.error('✗ 左下角地図インスタンスが見つかりません')
          }
        }, 500)

        console.log('✓ 京都区域地図初期化成功 (左下角)')

        // 自适应窗口大小
        const resizeDistrictMap = () => {
          districtChart.resize()
        }
        window.addEventListener('resize', resizeDistrictMap)

        // 保存清理函数
        ;(window as any).cleanupDistrictMap = () => {
          window.removeEventListener('resize', resizeDistrictMap)
          districtChart.dispose()
        }
        
        // 初始化弹窗中的区域地图（gdMaps）
        const popupMapContainer = document.getElementById('gdMaps')
        if (popupMapContainer) {
          console.log('✓ 开始初始化弹窗地図 (gdMaps)...')
          const popupChart = echarts.init(popupMapContainer)
          
          // 使用相同的配置，但zoom更大以便查看细节
          const popupMapOption = {
            ...districtMapOption,
            series: [{
              ...districtMapOption.series[0],
              zoom: 1.2,  // 弹窗中显示更大
            }]
          }
          
          popupChart.setOption(popupMapOption)
          
          // 添加相同的交互事件
          popupChart.on('mouseover', (params: any) => {
            if (params.componentType === 'series' && params.seriesType === 'map') {
              console.log('→ 弹窗マウスオーバー:', params.name)
            }
          })
          
          popupChart.on('click', (params: any) => {
            if (params.componentType === 'series' && params.seriesType === 'map') {
              console.log('✓ 弹窗区域クリック:', params.name)
              ;(window as any).selectedDistrict = params.name
            }
          })
          
          // resize处理
          const resizePopupMap = () => {
            popupChart.resize()
          }
          window.addEventListener('resize', resizePopupMap)
          
          // 保存清理函数
          const oldCleanup = (window as any).cleanupDistrictMap
          ;(window as any).cleanupDistrictMap = () => {
            oldCleanup()
            window.removeEventListener('resize', resizePopupMap)
            popupChart.dispose()
          }
          
          console.log('✓ 弹窗地図初期化成功 (gdMaps)')
        }
      } catch (error) {
        console.error('✗ 区域地図初期化失敗:', error)
      }
    }

    // 初始化中间京都主干道地图
    const initJapanMap = async () => {
      try {
        const echarts = (window as any).echarts
        if (!echarts) {
          console.error('✗ ECharts未加载')
          return
        }

        console.log('開始加載京都完整道路ネットワークデータ...')

        // 使用OpenStreetMap的完整京都道路网络数据（4221条真实道路）
        const kyotoRoadsData = kyotoRoadsComplete as any

        if (!kyotoRoadsData || !kyotoRoadsData.features) {
          console.error('✗ 京都市道路データが見つかりません')
          console.log('kyotoRoadsData:', kyotoRoadsData)
          return
        }

        console.log('✓ 京都完整道路ネットワークデータ読み込み完了:', kyotoRoadsData.features.length, '本の道路')
        console.log('  データソース: OpenStreetMap (OSM)')

        // 加载区域底图
        const bgResponse = await fetch('/src/assets/kyoto.geojson')
        if (!bgResponse.ok) {
          console.error('✗ 背景地図読み込み失敗:', bgResponse.status)
          return
        }
        const kyotoBgData = await bgResponse.json()
        
        console.log('✓ 京都背景地図データ読み込み完了')
        
        // 注册背景地图
        echarts.registerMap('京都道路背景', kyotoBgData)

        // 获取容器并初始化图表
        const mapContainer = document.getElementById('japanMap')
        if (!mapContainer) {
          console.error('✗ 地図コンテナが見つかりません (japanMap)')
          return
        }

        // console.log('✓ japanMapコンテナ取得成功:', mapContainer)
        // console.log('japanMapコンテナサイズ:', {
        //   width: mapContainer.offsetWidth,
        //   height: mapContainer.offsetHeight,
        //   display: window.getComputedStyle(mapContainer).display
        // })
        
        const mapChart = echarts.init(mapContainer)
        // console.log('✓ 中央EChartsインスタンス初期化成功')

        // 定义京都市区主干道列表（用于光点流动效果）
        const mainRoadNames = [
          '今出川通',      // 今出川通
          '東大路通',      // 东大路通
          '北大路通',      // 北大路通
          '五条通',        // 五条通
          '七条通',        // 七条通
          '御池通',        // 御池通
          '堀川通'         // 堀川通
        ]

        // 处理道路数据，转换为ECharts lines格式 - 使用OSM道路分级
        const roadsData = kyotoRoadsData.features.map((feature: any) => {
          const coords = feature.geometry.coordinates
          const props = feature.properties
          const highway = props.highway || 'unknown'
          const length = props.length_m || 0

          // 根据OSM的highway类型分级（从高到低）：
          // motorway（高速公路）> trunk（主干道）> primary（一级道路）> secondary（二级道路）> tertiary（三级道路）
          let roadLevel = 'minor'
          let lineWidth = 1.5
          let lineColor = 'rgba(12, 90, 138, 0.5)'  // 统一淡蓝色
          let opacity = 0.5

          if (highway === 'motorway' || highway === 'trunk') {
            roadLevel = 'major'     // 最高级道路：高速公路、主干道
            lineWidth = 5
            lineColor = 'rgba(12, 90, 138, 0.5)'
            opacity = 0.5
          } else if (highway === 'primary') {
            roadLevel = 'primary'   // 一级道路
            lineWidth = 4
            lineColor = 'rgba(12, 90, 138, 0.5)'
            opacity = 0.5
          } else if (highway === 'secondary') {
            roadLevel = 'secondary' // 二级道路
            lineWidth = 3
            lineColor = 'rgba(12, 90, 138, 0.5)'
            opacity = 0.5
          } else if (highway === 'tertiary') {
            roadLevel = 'tertiary'  // 三级道路
            lineWidth = 2
            lineColor = 'rgba(12, 90, 138, 0.5)'
            opacity = 0.5
          }

          // 判断是否为市区主干道（用于光点效果）
          const roadName = props.N01_002 || ''
          const isMainRoad = mainRoadNames.some(name => roadName.includes(name))

          return {
            name: roadName || '道路',
            coords: coords,
            length: length,
            highway: highway,
            roadLevel: roadLevel,
            isMainRoad: isMainRoad,  // 标记是否为市区主干道
            lineStyle: {
              width: lineWidth,
              color: lineColor,
              opacity: opacity
            }
          }
        })

        // console.log('✓ 道路データ処理完了:', roadsData.length, '件')
        // console.log('  - 高速道路/主幹道路 (motorway/trunk):', roadsData.filter((r: any) => r.roadLevel === 'major').length, '件')
        // console.log('  - 一級道路 (primary):', roadsData.filter((r: any) => r.roadLevel === 'primary').length, '件')
        // console.log('  - 二級道路 (secondary):', roadsData.filter((r: any) => r.roadLevel === 'secondary').length, '件')
        // console.log('  - 三級道路 (tertiary):', roadsData.filter((r: any) => r.roadLevel === 'tertiary').length, '件')

        // 输出前5条不同级别道路的示例
        const samples: any = {}
        roadsData.forEach((r: any) => {
          if (!samples[r.roadLevel]) {
            samples[r.roadLevel] = { name: r.name, length: r.length, highway: r.highway }
          }
        })
        // console.log('各レベル道路サンプル:', samples)

        // 准备景点数据（按类型分组）
        const prepareLandmarkData = () => {
          const landmarksByType: { [key: string]: any[] } = {}
          
          kyotoLandmarks.forEach((landmark) => {
            if (!landmarksByType[landmark.type]) {
              landmarksByType[landmark.type] = []
            }
            landmarksByType[landmark.type].push({
              name: landmark.name,
              value: landmark.coordinates,
              itemStyle: {
                color: landmarkStyles[landmark.type].color
              },
              symbolSize: landmarkStyles[landmark.type].symbolSize,
              type: landmark.type,
              description: landmark.description,
              district: landmark.district
            })
          })
          
          return landmarksByType
        }

        const landmarksByType = prepareLandmarkData()
        // console.log('✓ ランドマークデータ準備完了:', kyotoLandmarks.length, '件')

        // 筛选出市区主干道用于光点效果
        const mainRoadsData = roadsData.filter((road: any) => road.isMainRoad)
        // console.log('✓ 市区主幹道データ:', mainRoadsData.length, '件')
        // console.log('  主幹道名称:', mainRoadsData.slice(0, 5).map((r: any) => r.name))

        // 配置京都市主干道地图选项（区域底图+道路线条）- 经脉网络风格
        const mapOption = {
          backgroundColor: 'transparent',
          tooltip: {
            show: true,
            trigger: 'item',
            backgroundColor: 'rgba(0, 20, 40, 0.9)',
            borderColor: '#00d4ff',
            borderWidth: 2,
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            padding: [10, 15],
            formatter: (params: any) => {
              if (params.componentSubType === 'scatter') {
                const data = params.data
                let html = `<div style="padding: 5px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px; color: ${params.color};">
                    ${data.name}
                  </div>`
                
                if (data.district) {
                  html += `<div style="margin-bottom: 3px; font-size: 11px;">📍 ${data.district}</div>`
                }
                
                if (data.description) {
                  html += `<div style="margin-top: 5px; font-size: 11px; color: #aaaaaa;">
                    ${data.description}
                  </div>`
                }
                
                html += `</div>`
                return html
              }
              return ''
            }
          },
          geo: {
            map: '京都道路背景',
            roam: true,
            center: [135.768, 35.011],  // 京都中心城区
            zoom: 15.0,  // 适中的缩放，显示完整的道路网络
            scaleLimit: {
              min: 0.5,   // 最小缩放：可以缩小到看到整个京都市
              max: 100     // 最大缩放：可以放大100倍看到街道细节
            },
            aspectScale: 0.75,
            silent: true,  // 禁用背景地图的鼠标交互
            itemStyle: {
              areaColor: 'rgba(0, 168, 232, 0.15)',  // 淡色荧光蓝背景
              borderColor: '#00a8e8',
              borderWidth: 1.5,
              shadowColor: 'rgba(0, 212, 255, 0.2)',
              shadowBlur: 8
            },
            emphasis: {
              disabled: true  // 禁用高亮效果
            },
            label: {
              show: false
            }
          },
          series: [
            // 三级道路层
            {
              name: '三級道路',
              type: 'lines',
              coordinateSystem: 'geo',
              data: roadsData.filter((road: any) => road.roadLevel === 'tertiary'),
              polyline: true,
              lineStyle: {
                width: 2,
                opacity: 0.5,
                curveness: 0
              },
              silent: true,  // 不响应鼠标事件
              zlevel: 2
            },
            // 二级道路层
            {
              name: '二級道路',
              type: 'lines',
              coordinateSystem: 'geo',
              data: roadsData.filter((road: any) => road.roadLevel === 'secondary'),
              polyline: true,
              lineStyle: {
                width: 3,
                opacity: 0.85,
                curveness: 0
              },
              silent: true,  // 不响应鼠标事件
              zlevel: 3
            },
            // 一级道路层
            {
              name: '一級道路',
              type: 'lines',
              coordinateSystem: 'geo',
              data: roadsData.filter((road: any) => road.roadLevel === 'primary'),
              polyline: true,
              lineStyle: {
                width: 4,
                opacity: 0.95,
                curveness: 0
              },
              silent: true,  // 不响应鼠标事件
              zlevel: 4
            },
            // 主干道层
            {
              name: '主幹道路',
              type: 'lines',
              coordinateSystem: 'geo',
              data: roadsData.filter((road: any) => road.roadLevel === 'major'),
              polyline: true,
              lineStyle: {
                width: 5,
                opacity: 0.5,
                curveness: 0
              },
              silent: true,  // 不响应鼠标事件
              zlevel: 5
            },
            // 市区主干道光点流动效果层
            {
              name: '市区主幹道車流',
              type: 'lines',
              coordinateSystem: 'geo',
              data: mainRoadsData,
              polyline: true,
              effect: {
                show: true,
                period: 4,
                trailLength: 0.1,
                symbol: 'circle',
                symbolSize: 4,  // 缩小光点大小
                color: '#00f2ff',
                loop: true
              },
              lineStyle: {
                width: 0,
                opacity: 0
              },
              silent: true,
              zlevel: 6
            },
            // 景点标注层（最顶层）
            ...Object.entries(landmarksByType).map(([type, landmarks]) => {
              const style = landmarkStyles[type as keyof typeof landmarkStyles]
              return {
                name: style.label,
                type: 'scatter',
                coordinateSystem: 'geo',
                data: landmarks,
                symbol: `image:///src/assets/icons/${style.icon}`,  // 使用 image:// 协议加载 SVG
                symbolSize: style.symbolSize,
                itemStyle: {
                  opacity: 0.9
                },
                emphasis: {
                  scale: 1.5,
                  itemStyle: {
                    opacity: 1
                  },
                  label: {
                    show: true,
                    formatter: '{b}',
                    position: 'top',
                    color: style.color,
                    backgroundColor: 'rgba(0, 10, 20, 0.9)',
                    borderColor: style.color,
                    borderWidth: 1,
                    padding: [4, 8],
                    borderRadius: 3,
                    fontSize: 12
                  }
                },
                label: {
                  show: false  // 默认不显示，鼠标悬停才显示
                },
                zlevel: 10
              }
            })
          ]
        }

        mapChart.setOption(mapOption)
        
        // 强制resize确保显示
        setTimeout(() => {
          mapChart.resize()
        }, 100)

        // console.log('✓ 京都主要道路地図初期化成功 (中間)')

        // 自适应窗口大小
        const resizeMap = () => {
          mapChart.resize()
        }
        window.addEventListener('resize', resizeMap)

        // 添加缩放按钮事件（延迟确保DOM已渲染）
        setTimeout(() => {
          const zoomInBtn = document.getElementById('mapZoomIn')
          const zoomOutBtn = document.getElementById('mapZoomOut')

          console.log('ズームボタン検索:', { zoomInBtn, zoomOutBtn })

          if (zoomInBtn && zoomOutBtn) {
            // 移除可能存在的旧事件监听器
            const newZoomInBtn = zoomInBtn.cloneNode(true) as HTMLElement
            const newZoomOutBtn = zoomOutBtn.cloneNode(true) as HTMLElement
            zoomInBtn.parentNode?.replaceChild(newZoomInBtn, zoomInBtn)
            zoomOutBtn.parentNode?.replaceChild(newZoomOutBtn, zoomOutBtn)

            // 根据缩放级别更新道路显示（所有道路始终显示）
            const updateRoadsByZoom = (zoom: number) => {
              const series: any[] = []

              // 三级道路层 - 始终显示
              series.push({
                name: '三級道路',
                type: 'lines',
                coordinateSystem: 'geo',
                data: roadsData.filter((road: any) => road.roadLevel === 'tertiary'),
                polyline: true,
                lineStyle: {
                  width: 2,
                  opacity: 0.5,
                  curveness: 0
                },
                silent: true,
                zlevel: 2
              } as any)

              // 二级道路层 - 始终显示
              series.push({
                name: '二級道路',
                type: 'lines',
                coordinateSystem: 'geo',
                data: roadsData.filter((road: any) => road.roadLevel === 'secondary'),
                polyline: true,
                lineStyle: {
                  width: 3,
                  opacity: 0.5,
                  curveness: 0
                },
                silent: true,
                zlevel: 3
              } as any)

              // 一级道路层 - 始终显示
              series.push({
                name: '一級道路',
                type: 'lines',
                coordinateSystem: 'geo',
                data: roadsData.filter((road: any) => road.roadLevel === 'primary'),
                polyline: true,
                lineStyle: {
                  width: 4,
                  opacity: 0.5,
                  curveness: 0
                },
                silent: true,
                zlevel: 4
              } as any)

              // 主干道层 - 始终显示
              series.push({
                name: '主幹道路',
                type: 'lines',
                coordinateSystem: 'geo',
                data: roadsData.filter((road: any) => road.roadLevel === 'major'),
                polyline: true,
                lineStyle: {
                  width: 5,
                  opacity: 0.5,
                  curveness: 0
                },
                silent: true,
                zlevel: 5
              } as any)

              // 市区主干道光点流动效果层 - 始终显示
              series.push({
                name: '市区主幹道車流',
                type: 'lines',
                coordinateSystem: 'geo',
                data: mainRoadsData,
                polyline: true,
                effect: {
                  show: true,
                  period: 4,
                  trailLength: 0.1,
                  symbol: 'circle',
                  symbolSize: 4,  // 缩小光点大小
                  color: '#00f2ff',
                  loop: true
                },
                lineStyle: {
                  width: 0,
                  opacity: 0
                },
                silent: true,
                zlevel: 6
              } as any)

              // 景点标注层（始终显示）
              Object.entries(landmarksByType).forEach(([type, landmarks]) => {
                const style = landmarkStyles[type as keyof typeof landmarkStyles]
                series.push({
                  name: style.label,
                  type: 'scatter',
                  coordinateSystem: 'geo',
                  data: landmarks,
                  symbol: `image:///src/assets/icons/${style.icon}`,
                  symbolSize: style.symbolSize,
                  itemStyle: {
                    opacity: 0.9
                  },
                  emphasis: {
                    scale: 1.5,
                    itemStyle: {
                      opacity: 1
                    },
                    label: {
                      show: true,
                      formatter: '{b}',
                      position: 'top',
                      color: style.color,
                      backgroundColor: 'rgba(0, 10, 20, 0.9)',
                      borderColor: style.color,
                      borderWidth: 1,
                      padding: [4, 8],
                      borderRadius: 3,
                      fontSize: 12
                    }
                  },
                  label: {
                    show: false
                  },
                  zlevel: 10
                } as any)
              })

              return series
            }

            const handleZoomIn = () => {
              console.log('+ ボタンクリック')
              // 获取完整的当前配置
              const currentOption = mapChart.getOption() as any
              const currentZoom = currentOption.geo[0].zoom || 15.0
              const newZoom = currentZoom * 1.3

              console.log('現在のズーム:', currentZoom, '→ 新しいズーム:', newZoom)

              // 修改zoom值
              currentOption.geo[0].zoom = newZoom

              // 根据新的zoom级别更新道路显示
              currentOption.series = updateRoadsByZoom(newZoom)

              // 使用完整配置重新设置，notMerge=true强制替换
              mapChart.setOption(currentOption, { notMerge: true })

              // console.log('地図ズームイン完了, 表示道路数:', currentOption.series.reduce((sum: number, s: any) => sum + (s.data?.length || 0), 0))
            }

            const handleZoomOut = () => {
              // console.log('- ボタンクリック')
              // 获取完整的当前配置
              const currentOption = mapChart.getOption() as any
              const currentZoom = currentOption.geo[0].zoom || 15.0
              const newZoom = currentZoom / 1.3

              // console.log('現在のズーム:', currentZoom, '→ 新しいズーム:', newZoom)

              // 修改zoom值
              currentOption.geo[0].zoom = newZoom

              // 根据新的zoom级别更新道路显示
              currentOption.series = updateRoadsByZoom(newZoom)

              // 使用完整配置重新设置，notMerge=true强制替换
              mapChart.setOption(currentOption, { notMerge: true })

              // console.log('地図ズームアウト完了, 表示道路数:', currentOption.series.reduce((sum: number, s: any) => sum + (s.data?.length || 0), 0))
            }

            newZoomInBtn.addEventListener('click', handleZoomIn)
            newZoomOutBtn.addEventListener('click', handleZoomOut)

            console.log('✓ 地図ズームボタンイベント登録完了')
          } else {
            console.error('✗ ズームボタンが見つかりません')
          }

          // 添加全屏按钮事件
          const fullscreenBtn = document.getElementById('mapFullscreen')
          if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
              // 计算居中位置
              const windowWidth = 600
              const windowHeight = 800
              const left = (window.screen.width - windowWidth) / 2
              const top = (window.screen.height - windowHeight) / 2

              // 打开小窗口，居中显示
              window.open(
                '/src/pages/fullscreen-map.html',
                '_blank',
                `width=${windowWidth},height=${windowHeight},left=${left},top=${top},resizable=yes`
              )
            })
            // console.log('✓ 全屏ボタンイベント登録完了')
          }
        }, 500)

        // 保存清理函数
        ;(window as any).cleanupJapanMap = () => {
          window.removeEventListener('resize', resizeMap)
          mapChart.dispose()
        }
      } catch (error) {
        console.error('主要道路地図初期化失敗:', error)
      }
    }

    // 初始化事故统计饼图
    const initAccidentPieChart = () => {
      const echarts = (window as any).echarts
      if (!echarts) {
        console.error('✗ ECharts未加载')
        return
      }

      const pieContainer = document.getElementById('pie')
      if (!pieContainer) {
        console.error('✗ 饼图容器未找到 (pie)')
        return
      }

      const pieChart = echarts.init(pieContainer)

      // 事故类型虚拟数据
      const accidentData = [
        { name: '追突事故', value: 45, color: '#00f2ff' },
        { name: '出会い頭', value: 28, color: '#00d4ff' },
        { name: '右左折時', value: 18, color: '#00a8e8' },
        { name: '歩行者事故', value: 12, color: '#0c5a8a' },
        { name: 'その他', value: 8, color: '#0a3d62' }
      ]

      const pieOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}件 ({d}%)',
          backgroundColor: 'rgba(0, 20, 40, 0.9)',
          borderColor: '#00d4ff',
          borderWidth: 2,
          textStyle: {
            color: '#00f2ff',
            fontSize: 12
          },
          padding: [8, 12]
        },
        legend: {
          show: false
        },
        series: [
          {
            name: '事故統計',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderColor: '#0a1929',
              borderWidth: 2
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{d}%',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 'bold'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 242, 255, 0.8)'
              }
            },
            labelLine: {
              show: true,
              lineStyle: {
                color: '#00d4ff',
                width: 1
              }
            },
            data: accidentData.map(item => ({
              name: item.name,
              value: item.value,
              itemStyle: {
                color: item.color
              }
            }))
          }
        ]
      }

      pieChart.setOption(pieOption)

      // 自适应窗口大小
      const resizePie = () => {
        pieChart.resize()
      }
      window.addEventListener('resize', resizePie)

      // 保存清理函数
      ;(window as any).cleanupAccidentPie = () => {
        window.removeEventListener('resize', resizePie)
        pieChart.dispose()
      }

      // 更新右侧数据统计
      const pieDataContainer = document.querySelector('.pie-data')
      if (pieDataContainer) {
        const totalAccidents = accidentData.reduce((sum, item) => sum + item.value, 0)
        const dataHtml = `
          <div class="accident-stats">
            <div class="total-accidents">
              <span class="label">総事故件数</span>
              <span class="value">${totalAccidents}件</span>
            </div>
            <div class="accident-list">
              ${accidentData.map(item => `
                <div class="accident-item">
                  <span class="color-dot" style="background-color: ${item.color}"></span>
                  <span class="name">${item.name}</span>
                  <span class="count">${item.value}件</span>
                </div>
              `).join('')}
            </div>
          </div>
        `
        pieDataContainer.innerHTML = dataHtml
      }

      console.log('✓ 事故統計饼图初期化成功')
    }

    // 加载脚本后执行初始化
    const initScripts = async () => {
      if (window.$ && typeof window.$ === 'function' && (window as any).echarts) {
        // 初始化图表
        try {
          // 初始化左下角区域地图和中间主干道地图（并行执行）
          await Promise.all([
            initKyotoDistrictMap(),
            initJapanMap()
          ])

          // 初始化事故统计饼图
          initAccidentPieChart()

          // 然后调用 base.js 中的图表初始化函数
          try {
            // chart1需要pie和pie1元素，检查是否存在
            if (typeof (window as any).chart1 === 'function') {
              const pieEl = document.getElementById('pie')
              const pie1El = document.getElementById('pie1')
              if (pieEl && pie1El) {
                (window as any).chart1()
              } else {
                console.log('chart1初期化スキップ: pie/pie1要素が見つかりません')
              }
            }
          } catch (e) {
            console.warn('chart1初期化スキップ（エラー）:', e)
          }
          // ❌ 注释掉chart2，因为已在上面用TypeScript重新实现
          // if (typeof (window as any).chart2 === 'function') {
          //   (window as any).chart2('')
          // }
          if (typeof (window as any).chart3 === 'function') {
            (window as any).chart3(1, '')
          }
          if (typeof (window as any).chart4 === 'function' && (window as any).chart4Data) {
            (window as any).chart4((window as any).chart4Data, 1, '')
          }
        } catch (e) {
          console.error('图表初期化失敗:', e)
        }

        // 初始化代码从 001/index.html 移植过来
        const localData = ['', '', '']
        localStorage.setItem('data', localData.toString())

        // 实时交通量动态数字滚动效果
        let currentTraffic = 123456789
        const trafficCountEl = document.getElementById('trafficCount')
        
        // 数字滚动动画函数
        const animateNumber = (element: HTMLElement, from: number, to: number, duration: number) => {
          const startTime = Date.now()
          const diff = to - from
          
          const updateNumber = () => {
            const now = Date.now()
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // 使用缓动函数
            const easeProgress = progress < 0.5 
              ? 2 * progress * progress 
              : 1 - Math.pow(-2 * progress + 2, 2) / 2
            
            const current = Math.floor(from + diff * easeProgress)
            
            // 格式化数字并添加每个数字的动画class
            const formattedNumber = current.toLocaleString()
            const digits = formattedNumber.split('').map((char, index) => {
              if (char === ',') return '<span class="comma">,</span>'
              return `<span class="digit" key="${index}">${char}</span>`
            }).join('')
            
            element.innerHTML = digits
            
            if (progress < 1) {
              requestAnimationFrame(updateNumber)
            }
          }
          
          requestAnimationFrame(updateNumber)
        }
        
        // 模拟实时交通量变化
        const updateTraffic = () => {
          if (trafficCountEl) {
            const change = Math.floor(Math.random() * 2000) - 1000 // -1000 到 +1000 的随机变化
            const newTraffic = Math.max(100000000, Math.min(200000000, currentTraffic + change))
            
            animateNumber(trafficCountEl, currentTraffic, newTraffic, 1000)
            currentTraffic = newTraffic
          }
        }
        
        // 初始化显示
        if (trafficCountEl) {
          animateNumber(trafficCountEl, 0, currentTraffic, 2000)
        }
        
        // 每3秒更新一次交通量
        const trafficInterval = setInterval(updateTraffic, 3000)
        
        // 保存清理函数
        ;(window as any).cleanupTraffic = () => {
          clearInterval(trafficInterval)
        }

        // 放大按钮点击事件
        const fangdaBtn = document.getElementById('fangda')
        if (fangdaBtn) {
          fangdaBtn.addEventListener('click', (e) => {
            const btn = e.currentTarget as HTMLElement
            const siblings = btn.nextElementSibling as HTMLElement | null
            if (siblings && siblings.style.display === 'none') {
              btn.classList.add('active')
              siblings.style.display = 'block'
            } else if (siblings) {
              btn.classList.remove('active')
              siblings.style.display = 'none'
            }
          })
        }

        // 模态框按钮点击事件
        const modalBtns = document.querySelectorAll('.modal-btn > li')
        modalBtns.forEach((btn, index) => {
          btn.addEventListener('click', () => {
            const container = document.querySelector('.container') as HTMLElement
            if (!container) return

            if (index <= 2) {
              container.style.visibility = 'visible'
              const popups = container.querySelectorAll('.pop-up')
              if (popups[index]) {
                (popups[index] as HTMLElement).style.visibility = 'visible'
              }
              popups.forEach((popup, i) => {
                if (i !== index) {
                  (popup as HTMLElement).style.visibility = 'hidden'
                }
              })
            } else if (index > 2 && index < 5) {
              container.style.visibility = 'visible'
              const popup3 = container.querySelectorAll('.pop-up')[3] as HTMLElement
              if (popup3) popup3.style.visibility = 'visible'

              const rankingBox = document.querySelector('.pop-data .ranking-box') as HTMLElement
              if (index !== 3) {
                if (rankingBox) rankingBox.style.display = 'none'
              } else {
                if (rankingBox) rankingBox.style.display = 'block'
              }

              const contDivs = document.querySelectorAll('.cont-div')
              contDivs.forEach((div, i) => {
                if (i === index - 3) {
                  (div as HTMLElement).style.visibility = 'visible'
                } else {
                  (div as HTMLElement).style.visibility = 'hidden'
                }
              })
            } else if (index === 5) {
              container.style.visibility = 'visible'
              const popup3 = container.querySelectorAll('.pop-up')[3] as HTMLElement
              if (popup3) popup3.style.visibility = 'visible'

              const rankingBox = document.querySelector('.pop-data .ranking-box') as HTMLElement
              if (rankingBox) rankingBox.style.display = 'none'

              const switchBtn = document.getElementById('switchBtn')
              const activeSpan = switchBtn?.querySelector('.active')
              const dataType = activeSpan?.getAttribute('data-datatype')

              const titlesEl = document.getElementById('titles')
              const totalProfitsEl = document.getElementById('totalProfits')

              if (dataType === 'income') {
                if (titlesEl) titlesEl.innerHTML = '收入数据'
                if (totalProfitsEl) totalProfitsEl.innerHTML = '123,456.5元'
              } else if (dataType === 'expend') {
                if (titlesEl) titlesEl.innerHTML = '支出数据'
                if (totalProfitsEl) totalProfitsEl.innerHTML = '32,111.4元'
              }

              const contDivs = document.querySelectorAll('.cont-div')
              if (contDivs[2]) {
                (contDivs[2] as HTMLElement).style.visibility = 'visible'
              }
              contDivs.forEach((div, i) => {
                if (i !== 2) {
                  (div as HTMLElement).style.visibility = 'hidden'
                }
              })
            }
          })
        })

        // 关闭弹窗
        const closePopBtns = document.querySelectorAll('.close-pop')
        closePopBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const container = document.querySelector('.container') as HTMLElement
            if (container) container.style.visibility = 'hidden'
          })
        })
      }
    }

    // 数字滚动动画函数
    const animateNumber = (element: HTMLElement, start: number, end: number, duration: number) => {
      const range = end - start
      const increment = range / (duration / 16) // 60fps
      let current = start
      
      const timer = setInterval(() => {
        current += increment
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          current = end
          clearInterval(timer)
        }
        element.textContent = Math.round(current).toString()
      }, 16)
      
      return timer
    }

    // 初始化交通流量数字滚动
    const initTrafficNumberScroll = () => {
      const trafficNumbers = document.querySelectorAll('.traffic-number')
      const timers: number[] = []
      
      // 增加初始延迟，让用户看到从0开始的状态
      setTimeout(() => {
        trafficNumbers.forEach((element, index) => {
          const target = parseInt(element.getAttribute('data-target') || '0')
          // 添加延迟让数字依次滚动
          setTimeout(() => {
            element.classList.add('updating')
            // 延长滚动时间到3秒，让滚动更明显
            const timer = animateNumber(element as HTMLElement, 0, target, 150000)
            timers.push(timer)
            
            // 动画结束后移除updating类
            setTimeout(() => {
              element.classList.remove('updating')
            }, 1500)
          }, index * 300) // 每个数字延迟300ms，间隔更明显
        })
      }, 800) // 初始延迟800ms
      
      // 保存清理函数到window对象
      ;(window as any).cleanupTrafficScroll = () => {
        timers.forEach(timer => clearInterval(timer))
      }
    }

    // 延迟执行以确保脚本已加载和DOM渲染完成
    const timer = setTimeout(() => {
      initScripts()
      initTrafficNumberScroll()
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer1)
      window.removeEventListener('resize', initRem)
      // 清理地图资源
      if ((window as any).cleanupJapanMap) {
        (window as any).cleanupJapanMap()
      }
      if ((window as any).cleanupDistrictMap) {
        (window as any).cleanupDistrictMap()
      }
      // 清理交通量计数器
      if ((window as any).cleanupTraffic) {
        (window as any).cleanupTraffic()
      }
      // 清理交通流量数字滚动
      if ((window as any).cleanupTrafficScroll) {
        (window as any).cleanupTrafficScroll()
      }
      // 清理事故统计饼图
      if ((window as any).cleanupAccidentPie) {
        (window as any).cleanupAccidentPie()
      }
      // 恢复原始字体大小
      document.documentElement.style.fontSize = originalFontSize
      document.body.style.visibility = 'hidden'
    }
  }, [])

  return (
    <>
      <div className="container-flex" tabIndex={0}>
        <div className="box-left">
          <div className="left-top">
            <div className="current-num">
              <div>現在の交通量</div>
              <p id="trafficCount">123,456,789</p>
            </div>
          </div>
          <div className="left-center">
            <div className="title-box">
              <h6>過去30日事故統計</h6>
            </div>
            <div className="chart-box pie-chart">
              <div id="pie"></div>
              <div>
                <div className="pie-data"></div>
              </div>
            </div>
          </div>
          <div className="left-bottom">
            <div className="title-box">
              <h6>京都市内の区別交通流データ</h6>
            </div>
            <div className="chart-box">
              <div id="gdMap" className="gd-map"></div>
            </div>
          </div>
        </div>

        <div className="box-center">
          <div className="center-top">
            <h1>京都AI交通センター</h1>
          </div>
          <div className="center-center" style={{ display: 'none' }}>
            
          </div>
          <div className="center-bottom">
            <div className="weather-box">
              <div className="data">
                <p className="time" id="time">00:00:00</p>
                <p id="date"></p>
              </div>
              <div className="weather">
                <img id="weatherImg" src="/src/assets/images/weather/weather_img01.png" alt="" />
               
              </div>
            </div>
            <div className="chart-box" style={{ position: 'relative' }}>
              <div id="japanMap" style={{ width: '100%', height: '100%' }}></div>
              <div className="map-zoom-controls">
                <button className="zoom-btn zoom-in" id="mapZoomIn">+</button>
                <button className="zoom-btn zoom-out" id="mapZoomOut">−</button>
                <button className="zoom-btn fullscreen-btn" id="mapFullscreen">⛶</button>
              </div>
            </div>
            <div className="city-data">
            </div>
          </div>
        </div>

        <div className="box-right">
          {/* 右上角：主要道路交通流量统计 */}
          <div className="right-top">
            <div className="title-box">
              <h6>主要道路交通流量統計</h6>
              <img className="line-img" src="/src/assets/images/line-blue.png" alt="" />
            </div>
            <div className="road-traffic-stats">
              <div className="road-item">
                <div className="road-name">河原町通</div>
                <div className="traffic-bar-container">
                  <div className="traffic-bar" style={{ width: '95%' }} data-level="high"></div>
                  <span className="traffic-value">
                    <span className="traffic-number" data-target="1580">0</span>
                    <span className="traffic-unit">台</span>
                  </span>
                </div>
              </div>
              <div className="road-item">
                <div className="road-name">四条通</div>
                <div className="traffic-bar-container">
                  <div className="traffic-bar" style={{ width: '87%' }} data-level="high"></div>
                  <span className="traffic-value">
                    <span className="traffic-number" data-target="1450">0</span>
                    <span className="traffic-unit">台</span>
                  </span>
                </div>
              </div>
              <div className="road-item">
                <div className="road-name">三条通</div>
                <div className="traffic-bar-container">
                  <div className="traffic-bar" style={{ width: '75%' }} data-level="medium"></div>
                  <span className="traffic-value">
                    <span className="traffic-number" data-target="1250">0</span>
                    <span className="traffic-unit">台</span>
                  </span>
                </div>
              </div>
              <div className="road-item">
                <div className="road-name">烏丸通</div>
                <div className="traffic-bar-container">
                  <div className="traffic-bar" style={{ width: '65%' }} data-level="medium"></div>
                  <span className="traffic-value">
                    <span className="traffic-number" data-target="1080">0</span>
                    <span className="traffic-unit">台</span>
                  </span>
                </div>
              </div>
              <div className="road-item">
                <div className="road-name">堀川通</div>
                <div className="traffic-bar-container">
                  <div className="traffic-bar" style={{ width: '55%' }} data-level="low"></div>
                  <span className="traffic-value">
                    <span className="traffic-number" data-target="920">0</span>
                    <span className="traffic-unit">台</span>
                  </span>
                </div>
              </div>
              <div className="road-item">
                <div className="road-name">御池通</div>
                <div className="traffic-bar-container">
                  <div className="traffic-bar" style={{ width: '48%' }} data-level="low"></div>
                  <span className="traffic-value">
                    <span className="traffic-number" data-target="800">0</span>
                    <span className="traffic-unit">台</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右中间：隐藏 */}
          <div className="right-center" style={{ display: 'none' }}>
          </div>

          {/* 右下角：2个实时监控视频（上下布局） */}
          <div className="right-bottom">
            <div className="title-box">
              <h6>主要交差点リアルタイム監視</h6>
              <img className="line-img" src="/src/assets/images/line-blue.png" alt="" />
            </div>
            <div className="video-monitor-container">
              <div className="video-item">
                <div className="video-title-bar">
                  <div className="video-title">四条河原町交差点</div>
                  <button
                    className="video-enlarge-btn"
                    onClick={() => setEnlargedVideo('/src/video/tracked_1.mp4')}
                    title="拡大表示"
                  >
                    ⛶
                  </button>
                </div>
                <div className="video-wrapper">
                  <video
                    className="monitor-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/src/assets/images/index_bg.png"
                  >
                    <source src="/src/video/tracked_1.mp4" type="video/mp4" />
                    ビデオを読み込んでいます...
                  </video>
                </div>
              </div>
              <div className="video-item">
                <div className="video-title-bar">
                  <div className="video-title">烏丸御池交差点</div>
                  <button
                    className="video-enlarge-btn"
                    onClick={() => setEnlargedVideo('/src/video/tracked_2.mp4')}
                    title="拡大表示"
                  >
                    ⛶
                  </button>
                </div>
                <div className="video-wrapper">
                  <video
                    className="monitor-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/src/assets/images/index_bg.png"
                  >
                    <source src="/src/video/tracked_2.mp4" type="video/mp4" />
                    ビデオを読み込んでいます...
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 视频放大模态框 */}
      {enlargedVideo && (
        <div className="video-modal-overlay" onClick={() => setEnlargedVideo(null)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setEnlargedVideo(null)}>
              ✕
            </button>
            <video
              className="video-modal-player"
              autoPlay
              loop
              muted
              playsInline
              key={enlargedVideo}
            >
              <source src={enlargedVideo} type="video/mp4" />
              ビデオを読み込んでいます...
            </video>
          </div>
        </div>
      )}
    </>
  )
}

export default LogisticsDashboard
