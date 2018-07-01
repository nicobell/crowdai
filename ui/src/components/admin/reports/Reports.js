import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import ChartWrapper from 'src/components/charts/ChartWrapper';
import JobChooser from './JobChooser';
import WorkerChooser from './WorkerChooser';
import ItemChooser from './ItemChooser';
import CritChooser from './CritChooser';
import MetricChooser from './MetricChooser';
import MetricMenu from './MetricMenu';
import { Dimmer, Loader } from 'semantic-ui-react';

import './reports.css';
import { actions } from './actions';

class Reports extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			chosenmetric : '(choose a metric)',
			chosenworker: 'all',
			activeworker: false,
			chosencriteria: 'all',
			activecriteria: false,
			chosenitem: 'all',
			activeitem: false
		}
		this.chooseMetric = this.chooseMetric.bind(this)
		this.chooseWorker = this.chooseWorker.bind(this)
		this.chooseCriteria = this.chooseCriteria.bind(this)
		this.chooseItem = this.chooseItem.bind(this)
	}

	componentDidMount() {
		this.props.fetchWorkers(this.props.match.params.jobid)
	}

	componentDidUpdate() {
	}

	chooseMetric(e, {value}) {
		switch(value) {
			case 'T_CompleteTime':
				this.props.reports.tasks=[]
				this.props.fetchTaskTime(this.props.match.params.jobid)
				break;
			case 'Distribution':
				this.props.reports.tasks=[]
				this.props.fetchTasksAgreements(this.props.match.params.jobid)
				break;
			case 'Classification':
				this.props.reports.tasks=[]
				this.props.fetchCrowdGolds(this.props.match.params.jobid);
				break;
			case 'TwoWorkers':
				this.props.reports.tasks=[]
				this.props.fetchWorkersPairs(this.props.match.params.jobid)
				break;
			case 'SingleWorker':
				this.props.reports.tasks=[]
				this.props.fetchSingleWorker(this.props.match.params.jobid,Number(this.state.chosenworker))
				break;
			case 'Contribution':
				this.props.reports.tasks=[]
				this.props.fetchContribution(this.props.match.params.jobid)
				break;
			case 'Global':
				this.props.reports.tasks=[]
				this.props.fetchJobStats(this.props.match.params.jobid)
			default:
				break;
		}

		this.setState({
			...this.state,
			chosenmetric: value,
			//activeworker: value==='SingleWorker' ? true : false,
			chosenworker: 'all',
			chosenitem: 'all',
			chosencriteria: 'all',
			activeitem: 
				value==='Distribution'||value==='SingleWorker' ? 
					true : false,
			activecriteria: 
				value==='Distribution'||value==='SingleWorker' ? 
					true : false
		})
	}

	chooseWorker(e, {value}) {
		//this.props.fetchSingleWorker(this.props.match.params.jobid,Number(value))
		switch(this.state.chosenmetric) {
			case 'SingleWorker':
				if (value==='all') {
					this.props.reports.tasks = []
				} else {
					this.props.reports.tasks = []
					this.props.fetchSingleWorker(this.props.match.params.jobid,Number(value))
				}
				break;
			default:
				break;
		}

		this.setState({
			...this.state, 
			chosenworker: value,
			chosenitem: 'all',
			chosencriteria: 'all'
		})
	}

	chooseItem(e, {value}) {
		this.state.chosenmetric=='SingleWorker' ?
			this.props.fetchWorkersFilter(this.props.match.params.jobid, value)
			: this.props.fetchWorkers(this.props.match.params.jobid)

		this.setState({
			...this.state,
			chosenitem: value,
			activecriteria: true
		})
	}

	chooseCriteria(e, {value}) {
		this.setState({
			...this.state,
			chosencriteria: value
		})		
	}

	renderChart(chart,x,y,z,w,param) {
		return(
			<div>
				<Dimmer active={this.props.rep_loading} inline="centered" inverted>
					<Loader indeterminate>Loading data...</Loader>
				</Dimmer>
				<ChartWrapper 
					chart={chart}
					x={x}
					y={y}
					z={z}
					w={w}
					selector={'chart1'}
					param={param}
					data={Object.values(this.props.reports.tasks)}
				/>
			</div>
		)
	}

	render() {
		console.log('reports data: ', this.props.reports.tasks)
		//console.log('workers :', this.props.workers.workers)

		//refresh options for charts with new loaded data every time
		var WorkerOptions =  { 'all' : 'All Workers' }
		Object.values(this.props.workers.workers).map( step => {
      WorkerOptions[step.id] = step.turk_id
		});

		var ItemOptions = { 'all': 'All Items' }
		Object.values(
			(this.state.chosenmetric==='SingleWorker' && this.props.reports.tasks.length==1 && this.state.chosenworker!=='all')
				? this.props.reports.tasks[0].answers : this.props.reports.tasks
		).map( step => {
      ItemOptions[step.item_id] = step.item_id
		});

		var CritOptions = { 'all' : 'All Criteria' }
		Object.values(
			(this.state.chosenmetric==='SingleWorker' && this.props.reports.tasks.length==1 && this.state.chosenworker!=='all')
				? this.props.reports.tasks[0].answers : this.props.reports.tasks
		).map( step => {
      CritOptions[step.criteria_id] = step.criteria_id
		});

		var MetricOptions = {
			'Cohen': "Cohen's Kappa",
			'Agreement': "Basic Agreement",
			'Bennett': "Bennett's S",
			'PErr(a|b)': "Probability in Errors [ P_err(A|B) ]",
			'PErr(b|a)': "Probability in Errors [ P_err(B|A) ]",
			'Comparing': "Comparing Correlation Metrics"
		}

		//parameters for reusable charts
		var chart = ''
		var x = ''
		var y = ''
		var z = ''
		var w = ''
		var param = ''

		//show different reports
		switch (this.state.chosenmetric) {

			case 'T_CompleteTime':
				chart='histogramChart'
				x='avgtime_ms'
				y='item_id'
				z='criteria_id'
				param=1000
				break;

			case 'Distribution':
				chart='stackedBarChart'
				x='item_id'
				y=['no','not clear','yes']
				z='criteria_id'
				param=[this.state.chosenitem,this.state.chosencriteria]
				break;

			case 'Classification' :
				chart='treeChart'
				x='item_id'
				y='criteria_id'
				z=['yes','no']
				w='answer'
				param=this.state.chosenitem
				break;

			case 'Cohen':
				chart='heatMapChart'
				x='worker_A'
				y='worker_B'
				z='cohen_kappa'
				param=1
				break;

			case 'Agreement':
				chart='heatMapChart'
				x='worker_A'
				y='worker_B'
				z='agreement'
				param=1
				break;

			case 'Bennett':
				chart='heatMapChart'
				x='worker_A'
				y='worker_B'
				z='bennett_S'
				param=1
				break;

			case 'PErr(a|b)':
				chart='heatMapChart'
				x='worker_A'
				y='worker_B'
				z='a_error_dependency'
				param=1
				break;

			case 'PErr(b|a)':
				chart='heatMapChart'
				x='worker_A'
				y='worker_B'
				z='b_error_dependency'
				param=1
				break;

			case 'Contribution':
				chart='histogramChart'
				x='error_contribution'
				y='id'
				z='worker_A'
				param=1
				break;

			case 'Global':
				chart='groupedChart'
				x=['item_id','null']
				y='f1_score'
				z='matthews_correlation'
				w='diagnostic_odds_ratio'
				param=this.props.chosenworker
				break;

			case 'Comparing':
				chart='groupedChart'
				x=['worker_A','worker_B']
				y='cohen_kappa'
				z='agreement'
				w='bennett_S'
				param=this.state.chosenworker
				break;

			case 'SingleWorker':
				chart='singleWorker'
				x='total_tasks'
				y=['tasks_right_for_gold','tasks_right_for_crowd']
				z=this.props.workers.workers
				w=this.chooseWorker
				param=this.state
				break;

			default:
				break;
		}

		return(
			<div style={{margin: '20px'}}>
				<div className="rowC">
				{
							(this.state.chosenmetric==="Cohen"
							||this.state.chosenmetric==="Agreement"
							||this.state.chosenmetric==="Bennett"
							||this.state.chosenmetric==="PErr(a|b)"
							||this.state.chosenmetric==="PErr(b|a)"
							||this.state.chosenmetric==="TwoWorkers"
							||this.state.chosenmetric==="Comparing") && 
							<React.Fragment>
							<div className='row' style={{'display': 'flex', 'color': '#2185d0'}}>
								<br />
								<MetricChooser 
									options={MetricOptions}
									onChange={this.chooseMetric}
									chosenmetric={this.state.chosenmetric}
								/>
								<br />
							</div>
							<div style={{width: "5%"}} className='empty'></div>
							</React.Fragment>
					}

					<ItemChooser 
						disabled={(!this.state.activeitem)}
						options={ItemOptions}
						onChange={this.chooseItem}
						chosenitem={this.state.chosenitem}
					/>
					<div style={{width: "5%"}} className='empty'></div>
					<CritChooser 
						disabled={(!this.state.activecriteria)}
						options={CritOptions}
						onChange={this.chooseCriteria}
						chosencriteria={this.state.chosencriteria}
					/>
				</div>

				<br />

				<div className="rowC">
					<div className='options'>
						<MetricMenu 
							chosenmetric={this.state.chosenmetric}
							onChange={this.chooseMetric}/>
					</div>
					{this.renderChart(chart,x,y,z,w,param)}
				</div>
			
			</div>
		);
	}
}

Reports.propTypes = {
	fetchTaskTime: PropTypes.func,
	fetchWorkers: PropTypes.func,
	fetchTasksAgreements: PropTypes.func,
	fetchCrowdGolds: PropTypes.func,
	fetchWorkersPairs: PropTypes.func,
	fetchSingleWorker: PropTypes.func,
	fetchJobStats: PropTypes.func,
	fetchContribution: PropTypes.func,
	fetchWorkersFilter: PropTypes.func,

	fetchItems: PropTypes.func,
	fetchCriteria: PropTypes.func,
	match: PropTypes.object,

	rep_error: PropTypes.any,
	rep_loading: PropTypes.bool,
	reports: PropTypes.any,

	worker_error: PropTypes.any,
	worker_loading: PropTypes.bool,
	workers: PropTypes.any,
}

const mapDispatchToProps = dispatch => ({
	fetchTaskTime: jobId => dispatch(actions.fetchTaskTime(jobId)),
	fetchWorkers: jobId => dispatch(actions.fetchWorkers(jobId)),
	fetchTasksAgreements: jobId => dispatch(actions.fetchTasksAgreements(jobId)),
	fetchCrowdGolds: jobId => dispatch(actions.fetchCrowdGolds(jobId)),
	fetchWorkersPairs: jobId => dispatch(actions.fetchWorkersPairs(jobId)),
	fetchSingleWorker: (jobId,workerId) => dispatch(actions.fetchSingleWorker(jobId,workerId)),
	fetchJobStats: jobId => dispatch(actions.fetchJobStats(jobId)),
	fetchContribution: jobId => dispatch(actions.fetchContribution(jobId)),
	fetchWorkersFilter: (jobId,itemId) => dispatch(actions.fetchWorkersFilter(jobId,itemId)),
})

const mapStateToProps = state => ({
	reports: state.report.list.reports,
	rep_error: state.report.list.error,
	rep_loading: state.report.list.loading,

	workers: state.report.wlist.workers,
	worker_error: state.report.wlist.error,
	worker_loading: state.report.wlist.loading,
})

export default connect(mapStateToProps,mapDispatchToProps)(Reports)
