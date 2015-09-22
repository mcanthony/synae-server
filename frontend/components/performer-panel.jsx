import React from 'react/addons';

export default class PerformerPanel extends React.Component {

  static propTypes = {
    rsend: React.PropTypes.func.isRequired,
    rrecv: React.PropTypes.func.isRequired,
    rconnected: React.PropTypes.func.isRequired
  }

  state = {
    section: 0,
    sequence: 0,

    isTouching: false
  }

  constructor (props) {
    super(props);

    // Shortcuts to rhizome callbacks
    let {rsend, rrecv, rconnected, rhizome} = this.props;
    Object.assign(this, {rsend, rrecv, rconnected, rhizome});

    this.rconnected(() => {
      this.rsend('/sys/subscribe', ['/world-state']);
      this.rsend('/sys/resend', ['/world-state']);
    })

    this.rrecv((addr, args) => {
      if (addr === '/world-state') {
        let world = JSON.parse(args[0]);
        let section = world.groups[0].activeSection;
        let sequence = world.groups[0].activeSequence;
        this.setState({ section, sequence });
      }
    });
  }

  handleTouchStart (e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isTouching: true });
  }

  handleTouchEnd (msg, e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isTouching: false });
    this.rsend('/performer-events', [msg]);
  }

  render() {
    let {
      isTouching, section, sequence
    } = this.state;

    return (
      <div className={'performer-panel-container' + (isTouching ? ' bg-blue ' : '')}>
        <header className='performer-panel-header'>
          <h1>Section</h1>
          <span
            onTouchStart={this.handleTouchStart.bind(this)}
            onTouchEnd={this.handleTouchEnd.bind(this, 'next-section')}
            className='performer-panel-section-index white'>{section}</span>
          <h1>Sequence</h1>
          <span
            onTouchStart={this.handleTouchStart.bind(this)}
            onTouchEnd={this.handleTouchEnd.bind(this, 'next-sequence')}
            className='performer-panel-section-index white'>{sequence}</span>
        </header>
        <div className='performer-panel-content'></div>
      </div>
    )
  }

}
