import React from 'react'
//import * as d3 from 'd3'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

import PointChart from './PointChart'
import HistogramChart from './HistogramChart'
import HeatMapChart from './HeatMapChart'
import NestChart from './NestChart.js'
import StackedBarChart from './StackedBarChart'
import DonutChart from './DonutChart'
import CompareLineChart from './CompareLineChart'
import TreeChart from './TreeChart'
import GroupedChart from './GroupedChart'
import SingleWorker from './SingleWorker'
import TimeLineChart from './TimeLineChart'

class ChartWrapper extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    }
  }

  render() {
    switch(this.props.chart) {
      case 'histogramChart':
        return(
          <div>
          <HistogramChart
            {... this.props}
            />
          </div>
        );
      case 'heatMapChart':
        return(
          <div>
            <HeatMapChart
              {... this.props}
              />
          </div>
        );
      case 'donutChart': 
        return(
          <div>
            <DonutChart
              {... this.props}
            />
          </div>
        );
      case 'nestChart': 
        return(
          <div>
            <NestChart
              {... this.props}
            />
          </div>
        );
      case 'stackedBarChart':
        return(
          <div>
            <StackedBarChart 
              {... this.props}
            />
          </div>
        );
      case 'compareLineChart':
        return(
          <div>
            <CompareLineChart
              {...this.props}
            />
          </div>
        );
      case 'treeChart':
        return(
          <div>
            <TreeChart
              {...this.props}
            />
          </div>
        );
      case 'groupedChart':
        return(
          <div>
            <GroupedChart
              {...this.props}
            />
          </div>
        );
      case 'singleWorker':
        return(
          <div>
            <SingleWorker
              {...this.props}
            />
          </div>
        );
      case 'timeLineChart':
        return(
          <div>
            <TimeLineChart
              {...this.props}
            />
          </div>
        )
      case 'pointChart':
        return(
          <div>
            <PointChart
              {...this.props}
            />
          </div>
        )
      default:
        return(
          <div style={{'padding': 20}}>
            No data to display yet
            <svg width="900"></svg>
          </div>
        );
    }
  }
}

ChartWrapper.propTypes = {

}

const mapStateToProps = state => ({

})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps,mapDispatchToProps)(ChartWrapper)
