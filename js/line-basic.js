var lineChart = function () {
    $(function () {
        Highcharts.chart('chartContainer', {
            title: {
                text: 'Major Events evolution',
                x: -20 //center
            },
            xAxis: {
                categories: ['2012', '2013', '2014', '2015', '2016']
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
                data: [2,4,5,6,7]
            }]
        });
    });
}