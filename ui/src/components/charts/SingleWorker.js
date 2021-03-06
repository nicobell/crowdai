import React from 'react'
import { connect } from 'react-redux'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import ChartWrapper from './ChartWrapper'
import '../admin/reports/reports.css'
import { Button } from 'semantic-ui-react';

class SingleWorker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: this.props.x,
      collapsed: this.props.param.chosenworker==='all' ? false : true
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e, {value}) {
    this.props.w(e, {value})
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  render() {
    var data = this.props.data[0]
    var x = this.props.x
    var y = this.props.y
    var z = this.props.z
    var w = this.props.w
    var param = this.props.param
    
    //build interface for single worker metrics analysis
    return (
      
      <div className='nest' style={{'padding': 20}}>
        
        <div style={{'width': 900}}>
          <Button
            className='red'
            onClick={(e) => this.setState({
              collapsed: !this.state.collapsed
            })}
          >{this.state.collapsed ? 'Expand' : 'Collapse'}</Button>
        {
          this.state.collapsed ?
          <React.Fragment>
            <i>{"    "}Worker chooser &#x25BC;</i>
            <br />
            <br />
          </React.Fragment>
           : 
          <React.Fragment>
            <i>{"    "}Worker chooser &#x25B2;</i>
              <ChartWrapper
                chart={'pointChart'}
                color={['lightgreen','orange','#2185d0']}
                x={'id'}                    //x axis
                y={'precision_for_gold'}    //y axis
                z={'precision_for_crowd'}   //color intensity
                w={this.handleClick}        //onClick event
                param={'total_tasks'}       //selection circle radius
                data={z}
                selector={'points'}
              />
            <br />
            <br />
          </React.Fragment>
        }
        </div>

        {
          param.chosenworker!=='all' && this.props.data.length==1 && this.state.collapsed ?
        <React.Fragment>
        <div className='row'>
            {'Worker:   '}
            <strong style={{'color': '#2185d0', 'fontSize': '25px'}}>{data['worker_A']}</strong>
            <hr />
            {'Worker ID:   '}
            <strong style={{'color': '#2185d0'}}>{data['id']}</strong>
            <br />
            {'Registered since:   '}
            <strong style={{'color': '#2185d0'}}>{
              new Date(data['registration']*1000).getDate()
              +'/'+((new Date(data['registration']*1000).getMonth())+1)
              +'/'+new Date(data['registration']*1000).getFullYear()
              +' at '+new Date(data['registration']*1000).getHours()
              +':'+new Date(data['registration']*1000).getMinutes()
              }</strong>
        </div>

        <hr />

        <div className='rowC'>

          <div>
          <strong style={{'color': '#2185d0', 'fontSize': '15px'}}>Completed Tasks Timeline :</strong>
          <br />
          <ChartWrapper  
            chart={'timeLineChart'}
            x={'item_id'}                                     //first upper label
            y={'delivery'}                                    //x axis
            z={'criteria_id'}                                 //second upper label
            w={'answer'}                                      //bottom label and color
            param={[param.chosenitem,param.chosencriteria]}   //filtering parameters
            color={['orange','#2185d0','lightgreen']}         //color scale
            data={param.chosenworker==='all' ? [] : Object.values(data.answers)}
            selector={'timeline_chart'}
          />
          <br />
          <strong style={{'color': '#2185d0', 'fontSize': '15px'}}>Tasks Completion Times :</strong>
          <br />
          <ChartWrapper  
            chart={'nestChart'}
            x={'item_id'}                               //x axis
            y={'completion_time'}                       //y axis
            z={'criteria_id'}                           //x axis
            w={'correct'}                               //bar color
            param={1000}                                //scale time in seconds
            color={['lightgreen','orange','#2185d0']}   //color scale
            data={param.chosenworker==='all' ? [] : Object.values(data.answers)}
            selector={'wcompletion_chart'}
          />
          </div>

          <div className='row'>

            <strong style={{'color': '#2185d0'}}>Votes Distribution on Completed Tasks :</strong><br />
            Total completed tasks: <i>{data[x]}</i>
            <br />

            <ChartWrapper 
              chart={'donutChart'}
              x={'turk_id'}
                //x to use if there are more workers possible in data to be selected, 
                //in this case these are all answers from the same worker so there's no need to filter or group
              y={'answer'}                                      //percentage sectors
              z={['item_id','criteria_id']}                     //filter and show on tooltip
              param={[param.chosenitem,param.chosencriteria]}   //filtering parameters
              color={['orange','#2185d0','lightgreen']}         //color scale
              data={param.chosenworker==='all' ? [] : Object.values(data.answers)}
              selector={'chart_distribution'}
            />

            <strong style={{'color': '#2185d0'}}>Precision toward Gold Truth :</strong><br />
            Total: <i>{
              ((data[y[0]]/data[x])*100).toFixed(3)
              } %</i>

            <ChartWrapper 
              chart={'donutChart'}
              x={'turk_id'}
              y={'correct'}
              z={['item_id','criteria_id']}
              param={[param.chosenitem,param.chosencriteria]}
              color={['lightgreen','orange','#2185d0']}
              data={param.chosenworker==='all' ? [] : Object.values(data.answers)}
              selector={'chart_gold'}
            />

            <strong style={{'color': '#2185d0'}}>Precision toward Crowd Truth :</strong><br />
            Total: <i>{
              ((data[y[1]]/data[x])*100).toFixed(3)
              } %</i>

            <ChartWrapper 
              chart={'donutChart'}
              x={'turk_id'}
              y={'crowd_correct'}
              color={['#2185d0','lightgreen','orange']}
              z={['item_id','criteria_id']}
              param={[param.chosenitem,param.chosencriteria]}
              selector={'chart_crowd'}
              data={param.chosenworker==='all' ? [] : Object.values(data.answers)}
            />

          </div>

        </div>
        </React.Fragment>
         : 
        <div>
          <br />
          {param.chosenworker==='all' ? 'Choose a Worker' : 'Collapse to see selected worker'}
        </div>
        
        }

      </div>
    );
  }
}

SingleWorker.propTypes = {
}

const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
})

export default connect (mapStateToProps,mapDispatchToProps)(SingleWorker)
