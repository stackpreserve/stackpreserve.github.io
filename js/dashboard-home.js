var dynamicTitle = document.querySelector(".dynamic-title");
var dynamic = document.querySelector(".dynamic");
var dynamicLoaderEl = document.querySelector(".dynamic-loader");
var dynamicGraph = document.querySelector(".dynamic__graph");
var dynamicScopeListEl = document.querySelector(".dynamic__scope");
var dynamicGraphSettings = document.querySelector(".dynamic__graph-settings");
var dynamicMetricInput = document.querySelector(".dynamic__metric");
var dynamicTimeframeInput = document.querySelector(".dynamic__timeframe");
var today = document.querySelector(".today-overview");
var todayLoaderEl = document.querySelector(".today-overview-loader");
var todayViews = document.querySelector(".today-overview__views");
var todayRecordings = document.querySelector(".today-overview__recordings");
var todayNewCountries = document.querySelector(".today-overview__new-countries");
var todayAvgRecDuration = document.querySelector(".today-overview__avg-rec-duration");
var total = document.querySelector(".total-overview");
var totalLoaderEl = document.querySelector(".total-overview-loader");
var totalViews = document.querySelector(".total-overview__views");
var totalRecordings = document.querySelector(".total-overview__recordings");
var totalCountries = document.querySelector(".total-overview__countries");
var totalAvgRecDuration = document.querySelector(".total-overview__avg-rec-duration");
var todayLoader = new DynaList(todayLoaderEl, "No daily overview found", function() {});
var totalLoader = new DynaList(totalLoaderEl, "No total overview found", function() {});
var dynamicLoader = new DynaList(dynamicLoaderEl, "No graph found", function() {});
var dynamicScopeListOrder = ["Website", "Recordings", "Avg. recording duration", "Views", "New countries"];

function formatNum(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
}

function formatDuration(ms) {
    if (ms < 1000) return Math.round(ms) + " ms";
    var s = ms / 1000;
    if (s < 60) return s.toFixed(1).replace(/\.0$/, "") + " s";
    var m = s / 60;
    if (m < 60) return m.toFixed(1).replace(/\.0$/, "") + " min";
    var h = m / 60;
    return h.toFixed(1).replace(/\.0$/, "") + " h";
}

SPA.servReq("/getOverview", {sessionId: SPA.sessionId}, false, function(overview) {

    var yData = {
        "Recordings": 0,
        "Views": 0,
        "New countries": 0,
        "Avg. recording duration": 0
    }

    var todayData = {...yData};

    for (let domain in overview.websites) {
        for (let timePoint in overview.websites[domain]["Today"]) {
            let metrics = overview.websites[domain]["Today"][timePoint]
            for (let metric in metrics) {
                let value = overview.websites[domain]["Today"][timePoint][metric]
                if (value) {
                    todayData[metric] += value;
                }
            }
        }
    }
    /*if (todayData["Recordings"] > 0) {
        todayData["Avg. recording duration"] /= todayData["Recordings"];
    }*/

    todayViews.innerText = formatNum(todayData["Views"]);
    todayRecordings.innerText = formatNum(todayData["Recordings"]);
    todayNewCountries.innerText = todayData["New countries"];
    todayAvgRecDuration.innerText = formatDuration(todayData["Avg. recording duration"]);
    today.style.display = "";
    todayLoaderEl.style.display = "none";

    dynamic.style.display = "";
    dynamicLoaderEl.style.display = "none";
    var scopeInput = "All websites";
    var graph;
    var dynamicScopeList = new DynaList(dynamicScopeListEl, "No websites found", function(data) {
        scopeInput = data["Website"];
        updateGraph();
    });

    function updateGraph() {

        dynamicTitle.innerText = `${dynamicMetricInput.value} - ${dynamicTimeframeInput.value} (${scopeInput})`;
        var timeframe = dynamicTimeframeInput.value;
        var dynamicScopeListData = [];
        var allWebsitesScope = {...yData};
        allWebsitesScope["Website"] = "All websites";
        for (let domain in overview.websites) {
            let scope = {...yData};
            scope["Website"] = domain;
            for (let timePoint in overview.websites[domain][timeframe]) {
                let metrics = overview.websites[domain][timeframe][timePoint]
                for (let metric in metrics) {
                    let value = overview.websites[domain][timeframe][timePoint][metric]
                    if (value) {
                        allWebsitesScope[metric] += value;
                        scope[metric] += value;
                    }
                }
            }
            /*if (scope["Recordings"] > 0) {
                scope["Avg. recording duration"] /= scope["Recordings"];
            }*/
            scope["Views"] = formatNum(scope["Views"]);
            scope["Recordings"] = formatNum(scope["Recordings"]);
            scope["Avg. recording duration"] = formatDuration(scope["Avg. recording duration"]);
            dynamicScopeListData.push(scope);
        }
        /*if (allWebsitesScope["Recordings"] > 0) {
            allWebsitesScope["Avg. recording duration"] /= allWebsitesScope["Recordings"];
        }*/
        allWebsitesScope["Views"] = formatNum(allWebsitesScope["Views"]);
        allWebsitesScope["Recordings"] = formatNum(allWebsitesScope["Recordings"]);
        allWebsitesScope["Avg. recording duration"] = formatDuration(allWebsitesScope["Avg. recording duration"]);
        dynamicScopeListData = [allWebsitesScope, ...dynamicScopeListData];

        dynamicScopeList.clearData();
        dynamicScopeList.addData(dynamicScopeListData, dynamicScopeListOrder);

        var timePointOrder = {
            "Today": [
                "12 AM","1 AM","2 AM","3 AM","4 AM","5 AM","6 AM","7 AM",
                "8 AM","9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM",
                "4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM"
            ],
            "This week": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
            "This month": Array.from({length: new Date(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth() + 1,0)).getUTCDate()},(_, i) => i + 1)//Array.from({length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}, (_, i) => i + 1)
        }
        var data = [];

        if (Object.keys(overview.websites).length > 0) {

            if (scopeInput === "All websites") {
                for (let domain in overview.websites) {
                    for (let [timePointI, timePoint] of timePointOrder[dynamicTimeframeInput.value].entries()) {
                        let curBucket = overview.websites[domain][dynamicTimeframeInput.value][timePoint];
                        let curBucketMetric = curBucket[dynamicMetricInput.value];
                        if (timePointI < data.length) {
                            if (data[timePointI].hasOwnProperty("y")) {
                                if (dynamicMetricInput.value === "Avg. recording duration") {
                                    data[timePointI].y += curBucketMetric * curBucket["Recordings"];
                                    data[timePointI]["Recordings"] += curBucket["Recordings"];
                                } else {
                                    data[timePointI].y += curBucketMetric;
                                }
                            }
                        } else {
                            let bucket = {
                                x: timePoint
                            }
                            if (curBucket) {
                                if (dynamicMetricInput.value === "Avg. recording duration") {
                                    bucket.y = curBucketMetric * curBucket["Recordings"];
                                    bucket["Recordings"] = curBucket["Recordings"];
                                } else {
                                    bucket.y = curBucketMetric;
                                }
                            }
                            data.push(bucket);
                        }
                    }
                }
                if (dynamicMetricInput.value === "Avg. recording duration") {
                    for (let timePoint of data) {
                        if (timePoint.y > 0) {
                            timePoint.y = parseFloat((timePoint.y / timePoint["Recordings"] / 1000).toFixed(1).replace(/\.0$/, ""));
                        }
                        delete timePoint["Recordings"];
                    }
                }
            } else {
                for (let timePoint of timePointOrder[dynamicTimeframeInput.value]) {
                    let curBucket = overview.websites[scopeInput][dynamicTimeframeInput.value][timePoint];
                    let bucket = {
                        x: timePoint
                    }
                    if (curBucket) {
                        bucket.y = curBucket[dynamicMetricInput.value];
                        if (dynamicMetricInput.value === "Avg. recording duration") {
                            bucket.y = parseFloat((bucket.y / 1000).toFixed(1).replace(/\.0$/, ""));
                        }
                    }
                    data.push(bucket);
                }
            }

            data = data.map(point => ({
                x: point.x,
                y: point.hasOwnProperty("y") ? point.y : null
            }));

        } else {
            /*for (let timePoint of timePointOrder[dynamicTimeframeInput.value]) {
                data.push({x: timePoint, y: 0});
            }*/
            var now = new Date();
            for (let timePoint of timePointOrder[dynamicTimeframeInput.value]) {
                let y;

                if (dynamicTimeframeInput.value === "Today") {
                    let [hourStr, meridiem] = timePoint.split(" ");
                    let hour = parseInt(hourStr) % 12;
                    if (meridiem === "PM") hour += 12;
                    y = hour <= now.getUTCHours() ? 0 : null;
                } else if (dynamicTimeframeInput.value === "This week") {
                    var dayMap = { "Mon":1, "Tue":2, "Wed":3, "Thu":4, "Fri":5, "Sat":6, "Sun":7 };
                    let dayNum = dayMap[timePoint];
                    y = dayNum <= now.getUTCDay() ? 0 : null;
                } else if (dynamicTimeframeInput.value === "This month") {
                    let dayNum = parseInt(timePoint);
                    y = dayNum <= now.getUTCDate() ? 0 : null;
                }

                data.push({ x: timePoint, y });
            }
        }

        function addData() {
            dynamicGraph.style.minHeight = "unset";
            dynamicGraph.innerHTML = "";
            graph = new ApexCharts(dynamicGraph, {
                chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
                series: [{ name: dynamicMetricInput.value, data: data}],
                stroke: { colors: ["#11aaa2"]/*, width: 3 */},
                markers: { colors: ["#11aaa2"]/*, size: 5 */},
                tooltip: {
                    custom: function({ seriesIndex, dataPointIndex, w }) {
                        var point = w.config.series[seriesIndex].data[dataPointIndex];
                        return `
                            <div style="padding:8px 10px; font-family:sans-serif;">
                                <strong>${point.x}</strong><br>
                                ${dynamicMetricInput.value}: <b>${dynamicMetricInput.value === "Avg. recording duration" ? point.y+" sec" : point.y}</b>
                            </div>
                        `;
                    }
                }
            }).render();
        }

        if (dynamicTimeframeInput.value === "Today") {
            SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(profileData) {
                if (profileData.timeFormat === "24h") {
                    for (let timePointI = 0; timePointI < data.length; timePointI++) {
                        data[timePointI].x = to24h(data[timePointI].x);
                    }
                }
                addData();
            });
        } else {
            addData();
        }
    }

    updateGraph();

    totalViews.innerText = formatNum(overview.total["Views"]);
    totalRecordings.innerText = formatNum(overview.total["Recordings"]);
    totalCountries.innerText = overview.total["Countries"];
    totalAvgRecDuration.innerText = formatDuration(overview.total["Avg. recording duration"]);
    total.style.display = "";
    totalLoaderEl.style.display = "none";

    dynamicMetricInput.addEventListener("input", updateGraph);
    dynamicTimeframeInput.addEventListener("input", updateGraph);

});