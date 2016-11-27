var loadColumnChart = function(data){
    if(!data){
        return false;
    }
    console.log(data);
    $(function () {
    Highcharts.chart('columnContainer', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Total Earning distribution'
        },
        xAxis: {
            categories: data.categories
        },
        yAxis: [{
            min: 0,
            title: {
                text: 'Team count'
            }
        }, {
            title: {
                text: 'Total earning ($)'
            },
            opposite: true
        }],
        legend: {
            shadow: false
        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            column: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series: [
            {
                name: 'Team count',
                color: 'rgba(165,170,217,1)',
                data: data.data_y1,
                pointPadding: 0.3,
                pointPlacement: -0.2
            },
            {
                name: 'Total Earning',
                color: 'rgba(248,161,63,1)',
                data: data.data_y2,
                tooltip: {
                    valuePrefix: '$'
                },
                pointPadding: 0.3,
                pointPlacement: 0.2,
                yAxis: 1
            }
        ]
    });
});
}
