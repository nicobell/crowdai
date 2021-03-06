import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import DataTable from 'src/components/core/table/DataTable';
import {
  Form,
  Button
} from 'semantic-ui-react';
import { actions as jobactions } from '../jobs/actions';

var JobOptions = { }

const options = {
  columns: {
    name: {
      label: 'Name',
      renderer(item) {
        return item.data.name;
      }
    },
    created_at: {
      label: 'Date created'
    }
  }
}

class ReportsForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			chosenexp : '',
			activechart: false
		}
		this.chooseExp = this.chooseExp.bind(this)
	}

	componentDidMount() {
    this.props.fetchJobs();

    this.props.jobs.rows.map( step => {
    	JobOptions[step.id] = step.data.name+" ( "+step.created_at+" ) "
    })
  }

  chooseExp(e, {value}) {
  	this.setState({
  		...this.state,
			chosenexp: value,
			activechart: true
		})
  }

	render() {
		//console.log(this.props)
		return(
			<div>
				<DataTable
					title="My Jobs"
        	options={options}
        	data={this.props.jobs.rows}
        	loading={this.props.loading}
      	/>

			<div style={{margin: '20px'}}>
      	<h3 style={{color: '#2185d0'}}>Chosen Job_id : {this.state.chosenexp}</h3>

				<Form.Select 
					style={{margin: '10px'}}
					label="Select Project  "
        	value={this.state.chosenexp}
					options={Object.entries(JobOptions).map(([key, val]) => ({text: val, value: key}))}
					onChange={this.chooseExp}
				/>

				<div style={{textAlign: 'center'}}>
				<Link to={`/admin/reports/${this.state.chosenexp}`}>
					<Button className='btn primary' 
                  disabled={!this.state.activechart}
                  >See Charts</Button>
				</Link>
				</div>

				</div>
			</div>
		);
	}
}

ReportsForm.propTypes = {
  fetchJobs: PropTypes.func,
  error: PropTypes.object,
  loading: PropTypes.bool,
  jobs: PropTypes.object
}

const mapStateToProps = state => ({
  jobs: state.job.list.jobs,
  error: state.job.list.error,
  loading: state.job.list.loading
})

const mapDispatchToProps = dispatch => ({
  fetchJobs: () => dispatch(jobactions.fetchJobs())
})

export default connect(mapStateToProps,mapDispatchToProps)(ReportsForm)