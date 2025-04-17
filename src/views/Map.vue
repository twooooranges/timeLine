<!--
项目需求：
1.展示地图
2.增加指定地点标记
3.增加用户定位
4.根据用户定位，推荐最近的商户地点
5.推荐最近商户地点的导航
-->
<template>
    <!-- 地图  -->
    <div class="mapContainer">
        <div id="container"></div>
        <!--        查询地点-->
        <div class="searchWrap">
            <input type="text" class="searchPlace" v-model="searchVal">
            <button @click="getSearchVal">查询</button>
        </div>
        <!-- 显示导航步骤-->
        <div id="panel"></div>
    </div>
</template>

<script>
    import AMapLoader from "@amap/amap-jsapi-loader";

    var map
    // 设置安全密钥
    window._AMapSecurityConfig = {
        securityJsCode: 'e4c70125ced9d336c2bbf5f2f482b170',
    }
    export default {
        data() {
            return {
                //此处不声明 map 对象，可以直接使用 this.map赋值或者采用非响应式的普通对象来存储。
                // map: null,
                ip: [],//用户经纬度
                searchVal: '',//查询地点
                lnglat: []//目标地经纬度
            }
        },
        mounted() {
            //DOM初始化完成进行地图初始化
            this.initMap();
        },
        methods: {
            initMap() {
                AMapLoader.load({
                    key: "7a3da7cec5d4eebc34d815817d406904",             // 申请好的Web端开发者Key，首次调用 load 时必填
                    version: "2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                    plugins: ['AMap.Scale'],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
                }).then((AMap) => {
                    this.map = new AMap.Map("container", {  //设置地图容器id
                        viewMode: "3D",    //是否为3D地图模式
                        zoom: 13,           //初始化地图级别
                        center: [105.602725, 37.076636], //初始化地图中心点位置
                        resizeEnable: true
                    });
                    //获取用户当前定位
                    this.getLocation()
                }).catch(e => {
                    console.log(e);
                })
            },
            // 获取用户当前定位
            getLocation() {
                let that = this;
                map = new AMap.Map("container", {
                    resizeEnable: true
                });
                console.log('map =', map)
                AMap.plugin('AMap.Geolocation', function () {
                    let geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true,//是否使用高精度定位，默认:true
                        timeout: 10000,          //超过10秒后停止定位，默认：5s
                        buttonPosition: 'RB',    //定位按钮的停靠位置
                        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                        zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
                    })

                    map.addControl(geolocation)

                    //需要在vue.config.js里开启https访问方式
                    geolocation.getCurrentPosition(function (status, result) {
                        console.log(status)
                        if (status == 'complete') {
                            console.log(status)
                            onComplete(result)
                        } else {
                            onError(result)
                        }
                    });

                    function onComplete(data) {
                        // data是具体的定位信息
                        console.log('成功', data)
                        // [
                        // 12649383.668655168,
                        //         4129405.8321214407
                        // ]
                        that.ip = data.position.pos

                        var str = [];
                        str.push('定位结果：' + data.position);
                        str.push('定位类别：' + data.location_type);
                        if (data.accuracy) {
                            str.push('精度：' + data.accuracy + ' 米');
                        }//如为IP精确定位结果则没有精度信息
                        str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
                        console.log('str', str)
                        that.ip = data.position
                        // that.ride()
                    }

                    function onError(data) {
                        // 定位出错
                        console.log('失败', data)
                    }
                })
            },
            //骑行导航
            ride() {
                let that = this
                AMap.plugin('AMap.Riding', function () {
                    let riding = new AMap.Riding({
                        map: map,//AMap.Map对象, 展现结果的地图实例。当指定此参数后，搜索结果的标注、线路等均会自动添加到此地图上。可选参数
                        panel: "panel", //结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选参数
                        hideMarkers: false,
                        autoFitView: true,//用于控制在路径规划结束后，是否自动调整地图视野使绘制的路线处于视口的可见范围
                    });
                    //根据起终点坐标规划骑行路线  113.66,34.76 郑州人民公园
                    try {
                        riding.search(that.ip, that.lnglat, function (status, result) {
                            console.log('status', status)
                            console.log('result', result)
                            // result即是对应的骑行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_RidingResult
                            if (status === 'complete') {
                                console.log('绘制骑行路线完成')
                            } else {
                                console.log('骑行路线数据查询失败')
                            }
                        });
                    } catch (e) {
                        console.log('--', e)
                    }

                })


            },
            //    获取输入框值 并进行搜索
            getSearchVal() {
                console.log('搜索地点', this.searchVal)
                let _this = this
                var marker = new AMap.Marker();
                AMap.plugin('AMap.Geocoder', function () {
                    var geocoder = new AMap.Geocoder({
                        // city: "010", //城市设为北京，默认：“全国”
                        batch: true,//批量查询
                    });
                    var address = _this.searchVal;
                    geocoder.getLocation(address, function (status, result) {
                        if (status === 'complete' && result.geocodes.length) {
                            var lnglat = result.geocodes[0].location
                            console.log('经纬度：', lnglat)
                            _this.lnglat = lnglat
                            marker.setPosition(lnglat);
                            map.add(marker);
                            map.setFitView(marker);
                        } else {
                            console.log('根据地址查询位置失败');
                        }
                    });
                })
            }
        },
    }
</script>

<style scoped>
    #container {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 600px;
    }

    .mapContainer {
        position: relative;
    }

    #panel {
        width: 300px;
        height: 600px;
        position: absolute;
        right: 0;
        bottom: 0;
    }

    .searchWrap {
        width: 300px;
        height: 50px;
        position: absolute;
        left: 0;
        top: 0;
    }

    .searchPlace {
        width: 200px;
        height: 50px;
    }
</style>
