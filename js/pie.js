var loadChart = function(data, pays){
  if(!pays)
      pays = "All";
  if(!data){
      return false;
  }
  $(function () {
      Highcharts.chart('chartContainer', {
          chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie'
          },
          title: {
              text: 'Total earned (of all time) for : '+pays
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
