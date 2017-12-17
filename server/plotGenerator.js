import ChartjsNode from 'chartjs-node'

export default class PlotGenerator {
  getImageUrl(data, req) {
    this.plot(data)
    return req.get('host') + '/' + this.plotName
  }

  constructor() {
    this.plotName = 'testImage.png'

    //this.plot()
  }

  plot(plotData) {
    let chartNode = new ChartjsNode(600, 600)

    let myChartOptions = {
        plugins: {
            afterDraw: function (chart, easing) {
                var self = chart.config    /* Configuration object containing type, data, options */
                var ctx = chart.chart.ctx  /* Canvas context used to draw with */
            }
        }
    }
    let chartJsOptions = {
        type: 'bar',
        data:  {
        labels: plotData.x,
        datasets: [{
            label: '# of Votes',
            data: plotData.y,
            borderWidth: 1
        }]
        },
        options: myChartOptions
    };

    return chartNode.drawChart(chartJsOptions)
    .then(() => {
        // chart is created

        // get image as png buffer
        return chartNode.getImageBuffer('image/png')
    })
    .then(buffer => {
        Array.isArray(buffer) // => true
        // as a stream
        return chartNode.getImageStream('image/png')
    })
    .then(streamResult => {
        // using the length property you can do things like
        // directly upload the image to s3 by using the
        // stream and length properties
        streamResult.stream // => Stream object
        streamResult.length // => Integer length of stream
        // write to a file
        return chartNode.writeImageToFile('image/png', './server/public/' + this.plotName)
    })
    .then(() => {
        // chart is now written to the file path
        // ./testimage.png
    });
  }
}
