import React from 'react/addons';

export default class PerformerPanel extends React.Component {

  static propTypes = {
    rsend: React.PropTypes.func.isRequired,
    rrecv: React.PropTypes.func.isRequired,
    rconnected: React.PropTypes.func.isRequired
  }

  state = {
    section: 0
  }
  
  componentWillMount() {
    this.props.rsend('/sys/subscribe', ['/world-state']);
    this.props.rsend('/sys/resend', ['/world-state']);
    this.props.rrecv((addr, args) => {
      if (addr === '/world-state') {
        let world = JSON.parse(args[0]);
        let section = world.groups[0].activeSection;
        this.setState({ section });
      }
    })
  }

  render() {
    return (
      <div className='performer-panel-container'>
        <header className='performer-panel-header'>
          <h1>Section</h1>
          <span className='performer-panel-section-index white'>{this.state.section}</span>
        </header>
        <div className='performer-panel-content'></div>
      </div>
    )
  }

}