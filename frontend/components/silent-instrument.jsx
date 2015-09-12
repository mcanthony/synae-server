import React from 'react/addons';

export default class extends React.Component {

  //static propTypes = {
  //  sample: React.PropTypes.string.isRequired,
  //  silence: React.PropTypes.func.isRequired
  //}

  //state = {
  //  ...this.props
  //}

  render () {
    return <div>{this.props.instructions}</div>
  }
}
