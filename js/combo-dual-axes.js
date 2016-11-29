var comboDualAxes = function (data) {

    year = [];
    eventCount = [];
    totalEarning = [];

    for(key in data)
    {
        year.push(data[key].year);
        eventCount.push(data[key].count);
        totalEarning.push(data[key].totalEarning)
    }

    Highcharts.chart('chartContainer', {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Major Events evolution'
        },
        xAxis: [{
            categories: year,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: 'Events Count',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Total Earned',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '${value}',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 120,
            verticalAlign: 'top',
            y: 100,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: [{
            name: 'Total Earned',
            type: 'column',
            yAxis: 1,
            data: totalEarning,
            tooltip: {
                valueSuffix: ' $'
            }

        }, {
            name: 'Events Count',
            type: 'spline',
            data: eventCount,
            tooltip: {
                valueSuffix: ''
            }
        }]
    });
}