import React from 'react/addons';

export default class extends React.Component {

  static propTypes = {
    sample: React.PropTypes.string.isRequired,
    silence: React.PropTypes.func.isRequired
  }

  //state = {
  //  ...this.props
  //}

  render () {
    // I guess things go here to make a flutter happen?
    // This could just be 'gesture.jsx' with a big switch statement if the
    // gesture visualizations are mostly static.
    return <div>{this.props.sample}</div>
  }
}
