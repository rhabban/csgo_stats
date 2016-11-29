var lineChart = function (data) {
    $(function () {

        categories = [];
        series = [];
        totalEarning = [];

        for(key in data)
        {
            categories.push(data[key].year);
            series.push(data[key].count);
        }

        Highcharts.chart('chartContainer', {
            title: {
                text: 'Major Events evolution',
                x: -20 //center
            },
            xAxis: {
                categories: categories
            },
            yAxis: {
                title: {
                    text: 'Events'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ''
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'Events',
                data: series
            },
                name: 'Total Earning',
                data: series
            ]
        });
    });
}