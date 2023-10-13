const constants = {
  pdfLeftHeader: 'RealAssist.AI',
  pdfRightHeader: '123 Main Street, Denver, NH 02820-4007',
  backendUrl: 'http://localhost:9000/burglary/data',
  graphOptions: {
    plugins: {
      legend: {
        display: false,
      },
      zoom: {
        zoom: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            weight: 'bold',
          },
        },
      },
      y: {
        min: 0,
        ticks: {
          font: {
            weight: 'bold',
          },
        },
      },
    },
    layout: {
      padding: {
        top: 5,
        left: 15,
        right: 15,
        bottom: 15,
      },
    },
  },
};

export default constants;
