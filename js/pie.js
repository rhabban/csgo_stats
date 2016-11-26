var loadChart = function(data, pays){
  if(!pays)
      pays = "All";
  if(!data)
      data = [{
          name: 'Total earning',
          colorByPoint: true,
          data: [{
              name: 'VP',
              totalEarning: 13250,
              y: 56.33
          }, {
              name: 'Chrome',
              totalEarning: 1325,
              y: 24.03,
          }, {
              name: 'Firefox',
              totalEarning: 13250,
              y: 10.38
          }, {
              name: 'Safari',
              totalEarning: 13250,
              y: 4.77
          }, {
              name: 'Opera',
              totalEarning: 13250,
              y: 0.91
          }, {
              name: 'Proprietary or Undetectable',
              totalEarning: 13250,
              y: 0.2
          }]
      }];
  $(function () {
      Highcharts.chart('container', {
          chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie'
          },
          title: {
              text: 'Total earning (of all time) by Country : '+pays
          },
          tooltip: {
              pointFormat: '{series.name}: <b>{point.totalEarning}$</b>'
          },
          plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                      style: {
                          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                      }
                  }
              }
          },
          series: data
      });
  });
}
